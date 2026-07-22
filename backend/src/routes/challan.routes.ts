import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ChallanController.getChallans);
router.get('/:id', ChallanController.getChallanById);
router.post('/', requireRoles('ADMIN', 'SALES', 'WAREHOUSE'), ChallanController.createChallan);
router.patch('/:id/status', requireRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), ChallanController.updateChallanStatus);

export default router;
