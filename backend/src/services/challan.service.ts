import { prisma } from '../utils/prisma.util';
import { ChallanStatus, MovementType } from '@prisma/client';

export interface CreateChallanItemInput {
  productId: string;
  quantity: number;
}

export class ChallanService {
  private static async generateChallanNumber(): Promise<string> {
    const count = await prisma.salesChallan.count();
    const year = new Date().getFullYear();
    const numberStr = (count + 1).toString().padStart(4, '0');
    return `CH-${year}-${numberStr}`;
  }

  static async createChallan(data: {
    customerId: string;
    items: CreateChallanItemInput[];
    status?: ChallanStatus;
    createdBy: string;
    createdByName: string;
  }) {
    if (!data.items || data.items.length === 0) {
      throw { statusCode: 400, message: 'Sales challan must contain at least one product item' };
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Check customer exists
      const customer = await tx.customer.findUnique({
        where: { id: data.customerId },
      });
      if (!customer) {
        throw { statusCode: 404, message: 'Customer not found' };
      }

      // 2. Fetch product details and check stock
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalQuantity = 0;
      let totalAmount = 0;

      const challanItemsData = [];

      const targetStatus = data.status || ChallanStatus.DRAFT;

      for (const item of data.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw { statusCode: 404, message: `Product with ID ${item.productId} not found` };
        }

        if (item.quantity <= 0) {
          throw { statusCode: 400, message: `Quantity for product '${product.name}' must be greater than 0` };
        }

        // If confirming directly, check negative stock rule
        if (targetStatus === ChallanStatus.CONFIRMED && product.currentStock < item.quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`,
          };
        }

        const subtotal = product.unitPrice * item.quantity;
        totalQuantity += item.quantity;
        totalAmount += subtotal;

        // Snapshot data
        challanItemsData.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          unitPrice: product.unitPrice,
          quantity: item.quantity,
          subtotal,
        });
      }

      const challanNumber = await this.generateChallanNumber();

      // 3. Create Sales Challan
      const challan = await tx.salesChallan.create({
        data: {
          challanNumber,
          customerId: customer.id,
          totalQuantity,
          totalAmount,
          status: targetStatus,
          createdBy: data.createdBy,
          createdByName: data.createdByName,
          items: {
            create: challanItemsData,
          },
        },
        include: {
          customer: true,
          items: true,
        },
      });

      // 4. If status is CONFIRMED, update inventory and log stock movement OUT
      if (targetStatus === ChallanStatus.CONFIRMED) {
        for (const item of data.items) {
          const product = productMap.get(item.productId)!;
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity },
          });

          await tx.stockLog.create({
            data: {
              productId: product.id,
              quantity: item.quantity,
              type: MovementType.OUT,
              reason: `Sales Challan #${challanNumber} Dispatch`,
              createdBy: data.createdByName,
            },
          });
        }
      }

      return challan;
    });
  }

  static async getChallans(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ChallanStatus;
    customerId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { challanNumber: { contains: params.search } },
        { customer: { name: { contains: params.search } } },
        { customer: { businessName: { contains: params.search } } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [challans, total] = await Promise.all([
      prisma.salesChallan.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              name: true,
              businessName: true,
              email: true,
            },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.salesChallan.count({ where }),
    ]);

    return {
      challans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.salesChallan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!challan) {
      throw { statusCode: 404, message: 'Sales challan not found' };
    }

    return challan;
  }

  static async updateChallanStatus(
    id: string,
    newStatus: ChallanStatus,
    updatedByName: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const challan = await tx.salesChallan.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!challan) {
        throw { statusCode: 404, message: 'Sales challan not found' };
      }

      if (challan.status === newStatus) {
        return challan;
      }

      // 1. Transitioning DRAFT -> CONFIRMED
      if (challan.status === ChallanStatus.DRAFT && newStatus === ChallanStatus.CONFIRMED) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) {
            throw { statusCode: 404, message: `Product ${item.productName} no longer exists` };
          }
          if (product.currentStock < item.quantity) {
            throw {
              statusCode: 400,
              message: `Cannot confirm challan! Insufficient stock for product '${product.name}'. Available: ${product.currentStock}, Requested: ${item.quantity}`,
            };
          }

          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: product.currentStock - item.quantity },
          });

          await tx.stockLog.create({
            data: {
              productId: product.id,
              quantity: item.quantity,
              type: MovementType.OUT,
              reason: `Confirmed Sales Challan #${challan.challanNumber}`,
              createdBy: updatedByName,
            },
          });
        }
      }

      // 2. Transitioning CONFIRMED -> CANCELLED
      if (challan.status === ChallanStatus.CONFIRMED && newStatus === ChallanStatus.CANCELLED) {
        for (const item of challan.items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            await tx.product.update({
              where: { id: product.id },
              data: { currentStock: product.currentStock + item.quantity },
            });

            await tx.stockLog.create({
              data: {
                productId: product.id,
                quantity: item.quantity,
                type: MovementType.IN,
                reason: `Restocked from Cancelled Sales Challan #${challan.challanNumber}`,
                createdBy: updatedByName,
              },
            });
          }
        }
      }

      const updated = await tx.salesChallan.update({
        where: { id },
        data: { status: newStatus },
        include: {
          customer: true,
          items: true,
        },
      });

      return updated;
    });
  }
}
