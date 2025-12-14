import express from 'express';
import multer from 'multer';
import { pinJSON, pinFile } from '../services/pinataService';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/json', async (req, res) => {
    try {
        const data = req.body;
        const cid = await pinJSON(data);
        res.json({ success: true, cid, ipfsHash: cid });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
});

router.post('/file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const cid = await pinFile(req.file.buffer, req.file.originalname);
        res.json({ success: true, cid, ipfsHash: cid });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
});

export default router;
