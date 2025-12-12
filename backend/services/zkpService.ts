import * as snarkjs from "snarkjs";
import path from "path";
import fs from "fs";

// Paths to circuit artifacts
// adjustments may be needed based on where the build output actually lands relative to dist
const WASM_PATH = path.resolve(__dirname, "../../circuits/build/voterEligibility_js/voterEligibility.wasm");
const ZKEY_PATH = path.resolve(__dirname, "../../circuits/build/voterEligibility_final.zkey");
const VKEY_PATH = path.resolve(__dirname, "../../circuits/build/verification_key.json");

export interface VoterProofInput {
    [key: string]: any; // Allow index signature for snarkjs compatibility
    commitment: string;
    nullifier: string;
    pathElements: string[];
    pathIndices: number[];
    merkleRoot: string;
    electionId: string;
    nullifierHash: string;
}

export const generateProof = async (input: VoterProofInput) => {
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            WASM_PATH,
            ZKEY_PATH
        );
        return { proof, publicSignals };
    } catch (error) {
        console.error("Proof generation failed:", error);
        throw new Error("Proof generation failed");
    }
};

export const verifyProof = async (proof: any, publicSignals: any) => {
    try {
        const vKey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf-8"));
        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return res;
    } catch (error) {
        console.error("Proof verification failed:", error);
        return false;
    }
};
