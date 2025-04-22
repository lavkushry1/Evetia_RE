import { Router } from 'express';
import { auth } from '../middleware/auth';
import { validateRequest } from '../middleware/validate-request';
import { DiscountController } from '../controllers/discount.controller';

const router = Router();
const discountController = new DiscountController();

router.get('/', auth, discountController.getAllDiscounts);
router.get('/:id', auth, discountController.getDiscountById);
router.post('/', auth, validateRequest, discountController.createDiscount);
router.put('/:id', auth, validateRequest, discountController.updateDiscount);
router.delete('/:id', auth, discountController.deleteDiscount);
router.post('/validate', auth, discountController.validateDiscount);

export default router; 