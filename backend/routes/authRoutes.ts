import express from 'express';
import { z } from 'zod';
import { verifyId } from '../services/govDbService';
import { authService } from '../services/authService';
import { validate } from '../middleware/validate';

const router = express.Router();

const verifyIdSchema = z.object({
    body: z.object({
        idNumber: z.string().min(1, "ID Number is required"),
        otp: z.string().min(6, "OTP must be at least 6 characters")
    })
});

const loginSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string()
    })
});

const createUserSchema = z.object({
    body: z.object({
        username: z.string(),
        password: z.string().min(6),
        role: z.enum(['admin', 'voter', 'auditor'])
    })
});

router.post('/verify-id', validate(verifyIdSchema), async (req, res, next) => {
    try {
        const { idNumber, otp } = req.body;
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

router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        
        res.json({
            success: true,
            message: 'Login successful',
            token: result.token,
            user: result.user
        });
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/create-user', validate(createUserSchema), async (req, res, next) => {
    try {
        const { username, password, role } = req.body;
        const user = await authService.createUser(username, password, role);
        
        const { passwordHash, ...userWithoutPassword } = user;
        
        res.json({
            success: true,
            message: 'User created successfully',
            user: userWithoutPassword
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

router.post('/logout', (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        authService.logout(token);
    }
    
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

export default router;
