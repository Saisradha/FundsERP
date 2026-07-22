import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, requireRoles } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ProductController.getProducts);
router.get('/logs', ProductController.getStockLogs);
router.get('/:id', ProductController.getProductById);
router.post('/', requireRoles('ADMIN', 'WAREHOUSE'), ProductController.createProduct);
router.put('/:id', requireRoles('ADMIN', 'WAREHOUSE'), ProductController.updateProduct);
router.post('/:id/stock', requireRoles('ADMIN', 'WAREHOUSE'), ProductController.adjustStock);

export default router;
