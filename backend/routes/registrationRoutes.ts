import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { registrationService } from '../services/registrationService';

const router = express.Router();

const registerSchema = z.object({
    body: z.object({
        electionId: z.string(),
        voterId: z.string(),
        identityProof: z.string()
    })
});

const merkleProofSchema = z.object({
    body: z.object({
        electionId: z.string(),
        commitment: z.string()
    })
});

router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const { electionId, voterId, identityProof } = req.body;
        
        const result = await registrationService.registerVoter(electionId, voterId, identityProof);
        
        res.json({
            success: true,
            message: 'Voter registered successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
});

router.post('/finalize', async (req, res, next) => {
    try {
        const { electionId } = req.body;
        
        const merkleRoot = await registrationService.finalizeElectionRegistry(electionId);
        
        res.json({
            success: true,
            message: 'Election registry finalized',
            merkleRoot
        });
    } catch (error) {
        next(error);
    }
});

router.post('/merkle-proof', validate(merkleProofSchema), async (req, res, next) => {
    try {
        const { electionId, commitment } = req.body;
        
        const proof = registrationService.getMerkleProof(electionId, commitment);
        
        res.json({
            success: true,
            proof
        });
    } catch (error) {
        next(error);
    }
});

router.get('/stats/:electionId', async (req, res, next) => {
    try {
        const { electionId } = req.params;
        
        const stats = registrationService.getRegistrationStats(electionId);
        
        res.json({
            success: true,
            stats
        });
    } catch (error) {
        next(error);
    }
});

export default router;