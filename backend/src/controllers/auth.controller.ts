import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, 'Authentication successful', result);
    } catch (err) {
      return next(err);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const profile = await AuthService.getUserProfile(userId);
      return sendSuccess(res, 'User profile retrieved', profile);
    } catch (err) {
      return next(err);
    }
  }
}
