import express from 'express';
import { getStats } from '../services/analyticsService';

const router = express.Router();

router.get('/fraud', (req, res) => {
    const stats = getStats();
    res.json({ success: true, stats });
});

export default router;
