import { Discount } from '../models/discount.model';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class DiscountService {
    async createDiscount(data: Partial<Discount>): Promise<Discount> {
        const existingDiscount = await Discount.findOne({
            where: { code: data.code }
        });

        if (existingDiscount) {
            throw new BadRequestError('Discount code already exists');
        }

        return Discount.create(data as any);
    }

    async updateDiscount(id: string, data: Partial<Discount>): Promise<Discount> {
        const discount = await this.getDiscountById(id);
        if (!discount) {
            throw new NotFoundError('Discount not found');
        }

        if (data.code && data.code !== discount.code) {
            const existingDiscount = await Discount.findOne({
                where: { code: data.code }
            });
            if (existingDiscount) {
                throw new BadRequestError('Discount code already exists');
            }
        }

        await discount.update(data as any);
        return discount;
    }

    async deleteDiscount(id: string): Promise<void> {
        const discount = await this.getDiscountById(id);
        if (!discount) {
            throw new NotFoundError('Discount not found');
        }
        await discount.destroy();
    }

    async getDiscountById(id: string): Promise<Discount | null> {
        return Discount.findByPk(id);
    }

    async getDiscountByCode(code: string): Promise<Discount | null> {
        return Discount.findOne({ where: { code } });
    }

    async getAllDiscounts(): Promise<Discount[]> {
        return Discount.findAll();
    }

    async validateAndApplyDiscount(code: string, amount: number): Promise<{ 
        isValid: boolean; 
        discountedAmount: number;
        discount?: Discount;
    }> {
        const discount = await this.getDiscountByCode(code);
        
        if (!discount) {
            return { isValid: false, discountedAmount: amount };
        }

        if (!discount.isValid()) {
            return { isValid: false, discountedAmount: amount };
        }

        const discountedAmount = discount.applyDiscount(amount);
        return { 
            isValid: true, 
            discountedAmount,
            discount
        };
    }

    async incrementUsage(id: string): Promise<void> {
        const discount = await this.getDiscountById(id);
        if (!discount) {
            throw new NotFoundError('Discount not found');
        }

        if (discount.usesCount >= discount.maxUses) {
            throw new BadRequestError('Discount usage limit reached');
        }

        await discount.increment('usesCount');
    }
} 