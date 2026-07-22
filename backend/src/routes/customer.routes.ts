import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', CustomerController.getCustomers);
router.get('/:id', CustomerController.getCustomerById);
router.post('/', requireRoles('ADMIN', 'SALES'), CustomerController.createCustomer);
router.put('/:id', requireRoles('ADMIN', 'SALES'), CustomerController.updateCustomer);
router.post('/:id/notes', requireRoles('ADMIN', 'SALES', 'ACCOUNTS'), CustomerController.addNote);

export default router;
