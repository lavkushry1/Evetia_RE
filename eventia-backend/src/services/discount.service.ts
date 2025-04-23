import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Discount } from '../models/discount.model';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class DiscountService {
    private discountRepository: Repository<Discount>;

    constructor() {
        this.discountRepository = AppDataSource.getRepository(Discount);
    }

    async createDiscount(data: Partial<Discount>): Promise<Discount> {
        const existingDiscount = await this.discountRepository.findOne({
            where: { code: data.code }
        });

        if (existingDiscount) {
            throw new BadRequestError('Discount code already exists');
        }

        const discount = this.discountRepository.create(data);
        return this.discountRepository.save(discount);
    }

    async updateDiscount(id: string, data: Partial<Discount>): Promise<Discount> {
        const discount = await this.getDiscountById(id);
        if (!discount) {
            throw new NotFoundError('Discount not found');
        }

        if (data.code && data.code !== discount.code) {
            const existingDiscount = await this.discountRepository.findOne({
                where: { code: data.code }
            });
            if (existingDiscount) {
                throw new BadRequestError('Discount code already exists');
            }
        }

        Object.assign(discount, data);
        return this.discountRepository.save(discount);
    }

    async deleteDiscount(id: string): Promise<void> {
        const discount = await this.getDiscountById(id);
        if (!discount) {
            throw new NotFoundError('Discount not found');
        }
        await this.discountRepository.remove(discount);
    }

    async getDiscountById(id: string): Promise<Discount | null> {
        return this.discountRepository.findOne({ where: { id } });
    }

    async getDiscountByCode(code: string): Promise<Discount | null> {
        return this.discountRepository.findOne({ where: { code } });
    }

    async getAllDiscounts(): Promise<Discount[]> {
        return this.discountRepository.find();
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

        // Use a transaction to ensure atomicity
        await this.discountRepository.manager.transaction(async (transactionalEntityManager) => {
            const currentDiscount = await transactionalEntityManager.findOne(Discount, {
                where: { id },
                lock: { mode: 'pessimistic_write' }
            });

            if (!currentDiscount) {
                throw new NotFoundError('Discount not found');
            }

            if (currentDiscount.usesCount >= currentDiscount.maxUses) {
                throw new BadRequestError('Discount usage limit reached');
            }

            currentDiscount.usesCount += 1;
            await transactionalEntityManager.save(currentDiscount);
        });
    }
} 