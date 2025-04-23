import { Request, Response } from 'express';
import { Discount, IDiscount } from '../models/discount';

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

  static async createDiscount(req: Request, res: Response) {
    try {
      const discountData: IDiscount = req.body;
      const discount = new Discount(discountData);
      await discount.save();
      res.status(201).json(discount);
    } catch (error) {
      res.status(400).json({ message: 'Error creating discount', error });
    }
  }

  static async updateDiscount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const discount = await Discount.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!discount) {
        return res.status(404).json({ message: 'Discount not found' });
      }

      res.json(discount);
    } catch (error) {
      res.status(400).json({ message: 'Error updating discount', error });
    }
  }

  static async deleteDiscount(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const discount = await Discount.findByIdAndDelete(id);

      if (!discount) {
        return res.status(404).json({ message: 'Discount not found' });
      }

      res.json({ message: 'Discount deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting discount', error });
    }
  }

  static async getDiscountByCode(req: Request, res: Response) {
    try {
      const { code } = req.params;
      const discount = await Discount.findOne({ code: code.toUpperCase() });
      
      if (!discount) {
        return res.status(404).json({ message: 'Discount not found' });
      }

      res.json(discount);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching discount', error });
    }
  }

  static async validateDiscount(req: Request, res: Response) {
    try {
      const { code, amount } = req.body;
      const discount = await Discount.findOne({ code: code.toUpperCase() });

      if (!discount) {
        return res.status(404).json({ message: 'Invalid discount code' });
      }

      if (!discount.isActive) {
        return res.status(400).json({ message: 'Discount code is inactive' });
      }

      const now = new Date();
      if (now < discount.startDate || now > discount.endDate) {
        return res.status(400).json({ message: 'Discount code has expired' });
      }

      if (discount.currentUses >= discount.maxUses) {
        return res.status(400).json({ message: 'Discount code has reached maximum uses' });
      }

      if (discount.minPurchaseAmount && amount < discount.minPurchaseAmount) {
        return res.status(400).json({ 
          message: `Minimum purchase amount of ${discount.minPurchaseAmount} required` 
        });
      }

      let discountAmount = 0;
      if (discount.type === 'percentage') {
        discountAmount = (amount * discount.value) / 100;
        if (discount.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, discount.maxDiscountAmount);
        }
      } else {
        discountAmount = discount.value;
      }

      const finalAmount = amount - discountAmount;

      res.json({
        isValid: true,
        discountAmount,
        finalAmount,
        discount
      });
    } catch (error) {
      res.status(500).json({ message: 'Error validating discount', error });
    }
  }
}