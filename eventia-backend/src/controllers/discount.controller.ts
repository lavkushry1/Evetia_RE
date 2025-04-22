import { Request, Response } from 'express';
import { Discount } from '../models/discount.model';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export class DiscountController {
  async getAllDiscounts(_req: AuthRequest, res: Response) {
    try {
      const discounts = await Discount.find();
      return res.json(discounts);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching discounts', error });
    }
  }

  async getDiscountById(req: Request, res: Response) {
    try {
      const discount = await Discount.findById(req.params.id);
      if (!discount) {
        return res.status(404).json({ message: 'Discount not found' });
      }
      return res.json(discount);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching discount', error });
    }
  }

  async createDiscount(req: Request, res: Response) {
    try {
      const discount = new Discount(req.body);
      await discount.save();
      return res.status(201).json(discount);
    } catch (error) {
      return res.status(500).json({ message: 'Error creating discount', error });
    }
  }

  async updateDiscount(req: Request, res: Response) {
    try {
      const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!discount) {
        return res.status(404).json({ message: 'Discount not found' });
      }
      return res.json(discount);
    } catch (error) {
      return res.status(500).json({ message: 'Error updating discount', error });
    }
  }

  async deleteDiscount(req: Request, res: Response) {
    try {
      const discount = await Discount.findByIdAndDelete(req.params.id);
      if (!discount) {
        return res.status(404).json({ message: 'Discount not found' });
      }
      return res.json({ message: 'Discount deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting discount', error });
    }
  }

  async validateDiscount(req: Request, res: Response) {
    try {
      const { code } = req.body;
      const discount = await Discount.findOne({ code });

      if (!discount) {
        return res.status(404).json({ message: 'Invalid discount code' });
      }

      if (discount.isExpired()) {
        return res.status(400).json({ message: 'Discount code has expired' });
      }

      return res.json({
        valid: true,
        discount: {
          percentage: discount.percentage,
          amount: discount.amount,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error validating discount', error });
    }
  }
}