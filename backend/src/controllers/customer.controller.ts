import { Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { CustomerStatus, CustomerType } from '@prisma/client';

export class CustomerController {
  static async getCustomers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string;
      const status = req.query.status as CustomerStatus;
      const type = req.query.type as CustomerType;

      const result = await CustomerService.getCustomers({
        page,
        limit,
        search,
        status,
        type,
      });

      return sendSuccess(res, 'Customers retrieved successfully', result.customers, 200, result.meta);
    } catch (err) {
      return next(err);
    }
  }

  static async getCustomerById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.getCustomerById(id);
      return sendSuccess(res, 'Customer details retrieved', customer);
    } catch (err) {
      return next(err);
    }
  }

  static async createCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const createdBy = req.user?.name || 'System User';
      const customer = await CustomerService.createCustomer({
        ...req.body,
        createdBy,
      });
      return sendSuccess(res, 'Customer created successfully', customer, 201);
    } catch (err) {
      return next(err);
    }
  }

  static async updateCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const customer = await CustomerService.updateCustomer(id, req.body);
      return sendSuccess(res, 'Customer updated successfully', customer);
    } catch (err) {
      return next(err);
    }
  }

  static async addNote(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const createdBy = req.user?.name || 'System User';

      const createdNote = await CustomerService.addNote(id, note, createdBy);
      return sendSuccess(res, 'Follow-up note added successfully', createdNote, 201);
    } catch (err) {
      return next(err);
    }
  }
}
