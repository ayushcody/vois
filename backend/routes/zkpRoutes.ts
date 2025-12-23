import express from "express";
import { z } from "zod";
import { generateProof, VoterProofInput } from "../services/zkpService";
import { validate } from "../middleware/validate";
import { authenticate, requirePermission } from "../middleware/auth";

const router = express.Router();

const generateProofSchema = z.object({
    body: z.object({
        commitment: z.string(),
        nullifier: z.string(),
        pathElements: z.array(z.string()),
        pathIndices: z.array(z.number()),
        merkleRoot: z.string(),
        electionId: z.string()
    })
});

router.post("/generate",
    authenticate,
    requirePermission('cast_vote'),
    validate(generateProofSchema),
    async (req, res, next) => {
        try {
            const input: VoterProofInput = req.body;

            const result = await generateProof(input);
            res.json({
                success: true,
                proof: result.proof,
                publicSignals: result.publicSignals,
                nullifierHash: result.nullifierHash
            });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
