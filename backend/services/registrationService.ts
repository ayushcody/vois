import { generateCommitment, buildMerkleTree, getMerkleProof } from './zkpService';
import fs from 'fs';
import path from 'path';

interface VoterRegistration {
    id: string;
    commitment: string;
    nullifier: string;
    secret: string;
    verified: boolean;
    timestamp: number;
}

interface ElectionRegistry {
    electionId: string;
    voters: VoterRegistration[];
    merkleRoot: string;
    merkleTree: string[][];
}

const REGISTRY_PATH = path.resolve(__dirname, '../data/voter-registry.json');

export class RegistrationService {
    private registries: Map<string, ElectionRegistry> = new Map();

    constructor() {
        this.loadRegistries();
    }

    private loadRegistries() {
        try {
            if (fs.existsSync(REGISTRY_PATH)) {
                const data = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
                this.registries = new Map(Object.entries(data));
            }
        } catch (error) {
            console.error('Failed to load registries:', error);
        }
    }

    private saveRegistries() {
        try {
            const dir = path.dirname(REGISTRY_PATH);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const data = Object.fromEntries(this.registries);
            fs.writeFileSync(REGISTRY_PATH, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Failed to save registries:', error);
        }
    }

    async registerVoter(electionId: string, voterId: string, identityProof: string): Promise<{
        commitment: string;
        nullifier: string;
        secret: string;
    }> {
        // Verify identity (simplified for MVP)
        if (!this.verifyIdentity(voterId, identityProof)) {
            throw new Error('Identity verification failed');
        }

        // Generate cryptographic materials
        const secret = this.generateSecret();
        const nullifier = this.generateNullifier(voterId);
        const commitment = generateCommitment(nullifier, secret);

        const registration: VoterRegistration = {
            id: voterId,
            commitment,
            nullifier,
            secret,
            verified: true,
            timestamp: Date.now()
        };

        // Add to registry
        if (!this.registries.has(electionId)) {
            this.registries.set(electionId, {
                electionId,
                voters: [],
                merkleRoot: '',
                merkleTree: []
            });
        }

        const registry = this.registries.get(electionId)!;
        
        // Check if already registered
        if (registry.voters.find(v => v.id === voterId)) {
            throw new Error('Voter already registered for this election');
        }

        registry.voters.push(registration);
        this.saveRegistries();

        return { commitment, nullifier, secret };
    }

    async finalizeElectionRegistry(electionId: string): Promise<string> {
        const registry = this.registries.get(electionId);
        if (!registry) {
            throw new Error('Election registry not found');
        }

        const commitments = registry.voters.map(v => v.commitment);
        const { root, tree } = buildMerkleTree(commitments);
        
        registry.merkleRoot = root;
        registry.merkleTree = tree;
        
        this.saveRegistries();
        return root;
    }

    getMerkleProof(electionId: string, commitment: string): {
        pathElements: string[];
        pathIndices: number[];
        merkleRoot: string;
    } {
        const registry = this.registries.get(electionId);
        if (!registry) {
            throw new Error('Election registry not found');
        }

        const leafIndex = registry.voters.findIndex(v => v.commitment === commitment);
        if (leafIndex === -1) {
            throw new Error('Commitment not found in registry');
        }

        const { pathElements, pathIndices } = getMerkleProof(registry.merkleTree, leafIndex);
        
        return {
            pathElements,
            pathIndices,
            merkleRoot: registry.merkleRoot
        };
    }

    private verifyIdentity(voterId: string, identityProof: string): boolean {
        // Simplified identity verification for MVP
        // In production: integrate with government ID systems, biometrics, etc.
        return identityProof.length > 10 && voterId.length > 5;
    }

    private generateSecret(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    private generateNullifier(voterId: string): string {
        // Hash voter ID to create nullifier
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(voterId).digest('hex');
    }

    getRegistrationStats(electionId: string) {
        const registry = this.registries.get(electionId);
        return {
            totalRegistered: registry?.voters.length || 0,
            verified: registry?.voters.filter(v => v.verified).length || 0,
            merkleRootGenerated: !!registry?.merkleRoot
        };
    }
}

export const registrationService = new RegistrationService();