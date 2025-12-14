import * as snarkjs from "snarkjs";
import path from "path";
import fs from "fs";
// import { poseidon } from "circomlibjs"; // Commented out for development

const WASM_PATH = path.resolve(__dirname, "../../circuits/build/voterEligibility_js/voterEligibility.wasm");
const ZKEY_PATH = path.resolve(__dirname, "../../circuits/build/voterEligibility_final.zkey");
const VKEY_PATH = path.resolve(__dirname, "../../circuits/build/verification_key.json");

export interface VoterProofInput {
    commitment: string;
    nullifier: string;
    pathElements: string[];
    pathIndices: number[];
    merkleRoot: string;
    electionId: string;
}

// Mock hash function for development
const mockHash = (inputs: string[]): string => {
    return inputs.join('').split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0).toString();
};

export const generateCommitment = (nullifier: string, secret: string): string => {
    return mockHash([nullifier, secret]);
};

export const generateNullifierHash = (nullifier: string, electionId: string): string => {
    return mockHash([nullifier, electionId]);
};

export const generateProof = async (input: VoterProofInput) => {
    try {
        const nullifierHash = generateNullifierHash(input.nullifier, input.electionId);
        
        // Mock proof for development
        const mockProof = {
            pi_a: ["1", "2", "1"],
            pi_b: [["1", "0"], ["1", "0"], ["1", "0"]],
            pi_c: ["1", "2", "1"]
        };
        
        const publicSignals = [
            input.merkleRoot,
            input.electionId,
            nullifierHash
        ];
        
        console.log('⚠️  Using mock ZK proof for development');
        
        return { 
            proof: mockProof,
            publicSignals,
            nullifierHash
        };
    } catch (error) {
        console.error("Proof generation failed:", error);
        throw new Error("Proof generation failed");
    }
};

export const verifyProof = async (proof: any, publicSignals: any) => {
    try {
        if (!fs.existsSync(VKEY_PATH)) {
            throw new Error("Verification key not found. Run circuit setup first.");
        }
        
        const vKey = JSON.parse(fs.readFileSync(VKEY_PATH, "utf-8"));
        const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return res;
    } catch (error) {
        console.error("Proof verification failed:", error);
        return false;
    }
};

// Merkle tree utilities
export const buildMerkleTree = (commitments: string[]): { root: string; tree: string[][] } => {
    if (commitments.length === 0) return { root: "0", tree: [[]] };
    
    let currentLevel = commitments;
    const tree = [currentLevel];
    
    while (currentLevel.length > 1) {
        const nextLevel = [];
        for (let i = 0; i < currentLevel.length; i += 2) {
            const left = currentLevel[i];
            const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : left;
            nextLevel.push(mockHash([left, right]));
        }
        currentLevel = nextLevel;
        tree.push(currentLevel);
    }
    
    return { root: currentLevel[0] || '0', tree };
};

export const getMerkleProof = (tree: string[][], leafIndex: number): { pathElements: string[]; pathIndices: number[] } => {
    const pathElements = [];
    const pathIndices = [];
    let currentIndex = leafIndex;
    
    for (let level = 0; level < tree.length - 1; level++) {
        const isRightNode = currentIndex % 2 === 1;
        const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
        
        if (siblingIndex < tree[level].length) {
            pathElements.push(tree[level][siblingIndex]);
        } else {
            pathElements.push(tree[level][currentIndex]);
        }
        
        pathIndices.push(isRightNode ? 1 : 0);
        currentIndex = Math.floor(currentIndex / 2);
    }
    
    return { pathElements, pathIndices };
};
