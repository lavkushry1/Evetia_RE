import { Router } from 'express';
import { DiscountService } from '../services/discount.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/admin.middleware';

const router = Router();
const discountService = new DiscountService();

// Admin routes
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const discount = await discountService.createDiscount(req.body);
        res.status(201).json(discount);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const discount = await discountService.updateDiscount(req.params.id, req.body);
        res.json(discount);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await discountService.deleteDiscount(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const discounts = await discountService.getAllDiscounts();
        res.json(discounts);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Public routes
router.post('/validate', async (req, res) => {
    try {
        const { code, amount } = req.body;
        const result = await discountService.validateAndApplyDiscount(code, amount);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router; 