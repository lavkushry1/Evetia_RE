import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Payment, PaymentStatus } from '../models/payment.model';
import { getRepository } from 'typeorm';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export class PaymentController {
  async createPaymentIntent(req: AuthRequest, res: Response) {
    try {
      const { amount, currency = 'usd' } = req.body;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          userId: req.user?.id || '',
        },
      });

      return res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error creating payment intent', error });
    }
  }

  async confirmPayment(req: AuthRequest, res: Response) {
    try {
      const { paymentIntentId } = req.body;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        const paymentRepository = getRepository(Payment);
        
        const payment = new Payment();
        payment.userId = req.user?.id || '';
        payment.amount = paymentIntent.amount / 100;
        payment.currency = paymentIntent.currency;
        payment.status = PaymentStatus.COMPLETED;
        payment.paymentIntentId = paymentIntentId;

        const savedPayment = await paymentRepository.save(payment);
        return res.json({ message: 'Payment confirmed successfully', payment: savedPayment });
      }

      return res.status(400).json({ message: 'Payment not successful' });
    } catch (error) {
      return res.status(500).json({ message: 'Error confirming payment', error });
    }
  }

  async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const paymentRepository = getRepository(Payment);
      const payments = await paymentRepository.find({ 
        where: { userId: req.user?.id },
        order: { createdAt: 'DESC' }
      });
      
      return res.json(payments);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching payment history', error });
    }
  }

  async getPaymentById(req: AuthRequest, res: Response) {
    try {
      const paymentRepository = getRepository(Payment);
      const payment = await paymentRepository.findOne({ 
        where: {
          id: req.params.id,
          userId: req.user?.id
        }
      });

      if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
      }

      return res.json(payment);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching payment', error });
    }
  }
}