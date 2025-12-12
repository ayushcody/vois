import express from "express";
import { z } from "zod";
import { generateProof, VoterProofInput } from "../services/zkpService";
import { validate } from "../middleware/validate";

const router = express.Router();

const generateProofSchema = z.object({
    body: z.object({
        commitment: z.string(),
        nullifier: z.string(),
        pathElements: z.array(z.string()),
        pathIndices: z.array(z.number()),
        merkleRoot: z.string(),
        electionId: z.string(),
        nullifierHash: z.string().optional() // Optional input if not strictly required
    })
});

router.post("/generate", validate(generateProofSchema), async (req, res, next) => {
    try {
        const input: VoterProofInput = req.body;

        // In a real app, you might validate inputs strictly here
        // or ensure the user owns the inputs via session auth

        const result = await generateProof(input);
        res.json({
            success: true,
            proof: result.proof,
            publicSignals: result.publicSignals,
            // Helps frontend easily grab the nullifierHash which should be in publicSignals
            nullifierHash: result.publicSignals[2]
        });
    } catch (error) {
        next(error);
    }
});

export default router;
