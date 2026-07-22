import { prisma } from '../utils/prisma.util';
import { MovementType } from '@prisma/client';

export class ProductService {
  static async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    lowStockOnly?: boolean;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { sku: { contains: params.search } },
        { category: { contains: params.search } },
        { location: { contains: params.search } },
      ];
    }

    if (params.category) {
      where.category = params.category;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    let filtered = products;
    if (params.lowStockOnly) {
      filtered = products.filter((p) => p.currentStock <= p.minStockAlert);
    }

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limit);

    return {
      products: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockLogs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    return product;
  }

  static async createProduct(data: {
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    currentStock: number;
    minStockAlert?: number;
    location?: string;
    createdBy?: string;
  }) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku },
    });
    if (existingSku) {
      throw { statusCode: 400, message: `SKU '${data.sku}' already exists` };
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        sku: data.sku,
        category: data.category,
        unitPrice: data.unitPrice,
        currentStock: data.currentStock,
        minStockAlert: data.minStockAlert ?? 10,
        location: data.location || 'Zone Alpha - Shelf 01',
        stockLogs: {
          create: [
            {
              quantity: data.currentStock,
              type: MovementType.IN,
              reason: 'Initial Product Stock Registration',
              createdBy: data.createdBy || 'System',
            },
          ],
        },
      },
      include: {
        stockLogs: true,
      },
    });

    return product;
  }

  static async updateProduct(
    id: string,
    data: {
      name?: string;
      sku?: string;
      category?: string;
      unitPrice?: number;
      minStockAlert?: number;
      location?: string;
    }
  ) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuCheck = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (skuCheck) {
        throw { statusCode: 400, message: `SKU '${data.sku}' already exists` };
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    return updated;
  }

  static async adjustStock(
    id: string,
    quantity: number,
    type: MovementType,
    reason: string,
    createdBy: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id } });
      if (!product) {
        throw { statusCode: 404, message: 'Product not found' };
      }

      let newStock = product.currentStock;
      if (type === MovementType.IN) {
        newStock += quantity;
      } else {
        if (product.currentStock < quantity) {
          throw {
            statusCode: 400,
            message: `Insufficient stock! Current stock: ${product.currentStock}, Requested reduction: ${quantity}`,
          };
        }
        newStock -= quantity;
      }

      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newStock },
      });

      const log = await tx.stockLog.create({
        data: {
          productId: id,
          quantity,
          type,
          reason,
          createdBy,
        },
      });

      return { product: updatedProduct, log };
    });
  }

  static async getStockLogs(limit = 50) {
    const logs = await prisma.stockLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            location: true,
          },
        },
      },
    });

    return logs;
  }
}
