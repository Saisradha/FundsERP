import { Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { sendSuccess } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { MovementType } from '@prisma/client';

export class ProductController {
  static async getProducts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const search = req.query.search as string;
      const category = req.query.category as string;
      const lowStockOnly = req.query.lowStock === 'true';

      const result = await ProductService.getProducts({
        page,
        limit,
        search,
        category,
        lowStockOnly,
      });

      return sendSuccess(res, 'Products retrieved successfully', result.products, 200, result.meta);
    } catch (err) {
      return next(err);
    }
  }

  static async getProductById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id);
      return sendSuccess(res, 'Product details retrieved', product);
    } catch (err) {
      return next(err);
    }
  }

  static async createProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const createdBy = req.user?.name || 'System User';
      const product = await ProductService.createProduct({
        ...req.body,
        createdBy,
      });
      return sendSuccess(res, 'Product created successfully', product, 201);
    } catch (err) {
      return next(err);
    }
  }

  static async updateProduct(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.updateProduct(id, req.body);
      return sendSuccess(res, 'Product updated successfully', product);
    } catch (err) {
      return next(err);
    }
  }

  static async adjustStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { quantity, type, reason } = req.body;
      const createdBy = req.user?.name || 'System User';

      const result = await ProductService.adjustStock(
        id,
        quantity,
        type as MovementType,
        reason || 'Manual Inventory Adjustment',
        createdBy
      );

      return sendSuccess(res, 'Stock adjusted successfully', result);
    } catch (err) {
      return next(err);
    }
  }

  static async getStockLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const logs = await ProductService.getStockLogs(limit);
      return sendSuccess(res, 'Stock movement logs retrieved', logs);
    } catch (err) {
      return next(err);
    }
  }
}
