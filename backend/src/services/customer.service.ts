import { prisma } from '../utils/prisma.util';
import { CustomerStatus, CustomerType } from '@prisma/client';

export class CustomerService {
  static async getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: CustomerStatus;
    type?: CustomerType;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { mobile: { contains: params.search } },
        { businessName: { contains: params.search } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.type) {
      where.customerType = params.type;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          notes: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
          _count: {
            select: { challans: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    return customer;
  }

  static async createCustomer(data: {
    name: string;
    mobile: string;
    email: string;
    businessName: string;
    gstNumber?: string;
    customerType: CustomerType;
    address: string;
    status?: CustomerStatus;
    followUpDate?: Date;
    initialNote?: string;
    createdBy?: string;
  }) {
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        mobile: data.mobile,
        email: data.email,
        businessName: data.businessName,
        gstNumber: data.gstNumber || null,
        customerType: data.customerType,
        address: data.address,
        status: data.status || CustomerStatus.LEAD,
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        notes: data.initialNote
          ? {
              create: [
                {
                  note: data.initialNote,
                  createdBy: data.createdBy || 'System',
                },
              ],
            }
          : undefined,
      },
      include: {
        notes: true,
      },
    });

    return customer;
  }

  static async updateCustomer(
    id: string,
    data: {
      name?: string;
      mobile?: string;
      email?: string;
      businessName?: string;
      gstNumber?: string;
      customerType?: CustomerType;
      address?: string;
      status?: CustomerStatus;
      followUpDate?: Date;
    }
  ) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        followUpDate: data.followUpDate !== undefined
          ? (data.followUpDate ? new Date(data.followUpDate) : null)
          : existing.followUpDate,
      },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });

    return updated;
  }

  static async addNote(id: string, note: string, createdBy: string) {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw { statusCode: 404, message: 'Customer not found' };
    }

    const createdNote = await prisma.customerNote.create({
      data: {
        customerId: id,
        note,
        createdBy,
      },
    });

    return createdNote;
  }
}
