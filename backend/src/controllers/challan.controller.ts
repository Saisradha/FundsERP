import { Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendSuccess } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ChallanStatus } from '@prisma/client';

export class ChallanController {
  static async createChallan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const createdBy = req.user!.userId;
      const createdByName = req.user!.name;

      const challan = await ChallanService.createChallan({
        customerId: req.body.customerId,
        items: req.body.items,
        status: req.body.status as ChallanStatus,
        createdBy,
        createdByName,
      });

      return sendSuccess(res, 'Sales challan created successfully', challan, 201);
    } catch (err) {
      return next(err);
    }
  }

  static async getChallans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const search = req.query.search as string;
      const status = req.query.status as ChallanStatus;
      const customerId = req.query.customerId as string;

      const result = await ChallanService.getChallans({
        page,
        limit,
        search,
        status,
        customerId,
      });

      return sendSuccess(res, 'Sales challans retrieved successfully', result.challans, 200, result.meta);
    } catch (err) {
      return next(err);
    }
  }

  static async getChallanById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const challan = await ChallanService.getChallanById(id);
      return sendSuccess(res, 'Sales challan details retrieved', challan);
    } catch (err) {
      return next(err);
    }
  }

  static async updateChallanStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedByName = req.user!.name;

      const updated = await ChallanService.updateChallanStatus(id, status as ChallanStatus, updatedByName);
      return sendSuccess(res, `Challan status updated to ${status}`, updated);
    } catch (err) {
      return next(err);
    }
  }
}
