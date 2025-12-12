import express from 'express';
import { z } from 'zod';
import { verifyId } from '../services/govDbService';
import { validate } from '../middleware/validate';

const router = express.Router();

const verifyIdSchema = z.object({
    body: z.object({
        idNumber: z.string().min(1, "ID Number is required"),
        otp: z.string().min(6, "OTP must be at least 6 characters")
    })
});

router.post('/verify-id', validate(verifyIdSchema), async (req, res, next) => {
    try {
        const { idNumber, otp } = req.body;
        // Validation handled by middleware

        const isValid = await verifyId(idNumber, otp);
        if (isValid) {
            res.json({ success: true, message: "ID verified successfully" });
        } else {
            res.status(401).json({ success: false, message: "Verification failed" });
        }
    } catch (error) {
        next(error);
    }
});

export default router;
