import { Router } from 'express';
import { auth } from '../middleware/auth';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post('/create-payment-intent', auth, paymentController.createPaymentIntent);
router.post('/confirm-payment', auth, paymentController.confirmPayment);
router.get('/history', auth, paymentController.getPaymentHistory);
router.get('/:id', auth, paymentController.getPaymentById);

export default router;