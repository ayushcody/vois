import { expect } from "chai";
import { ethers } from "hardhat";
import { EkMatVoting, Verifier } from "../../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("EkMatVoting", function () {
    let ekMatVoting: EkMatVoting;
    let verifier: Verifier;
    let owner: HardhatEthersSigner;
    let addr1: HardhatEthersSigner;

    // Mock data
    const electionId = "election_1";
    const electionName = "General Election 2024";
    const manifestCid = "QmHash123";
    const merkleRoot = ethers.ZeroHash;
    const candidateId = "candidate_1";
    const candidateName = "Alice";
    const candidateCid = "QmCandidate123";

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy Verifier
        const VerifierFactory = await ethers.getContractFactory("Verifier");
        verifier = await VerifierFactory.deploy();

        // Deploy EkMatVoting
        const EkMatVotingFactory = await ethers.getContractFactory("EkMatVoting");
        ekMatVoting = await EkMatVotingFactory.deploy(await verifier.getAddress());
    });

    describe("Election Management", function () {
        it("Should allow admin to create an election (inactive by default)", async function () {
            const now = Math.floor(Date.now() / 1000);
            const startTime = now + 60;
            const endTime = now + 3600;

            await expect(
                ekMatVoting.createElection(
                    electionId,
                    electionName,
                    startTime,
                    endTime,
                    merkleRoot,
                    manifestCid
                )
            )
                .to.emit(ekMatVoting, "ElectionCreated")
                .withArgs(
                    electionId,
                    electionName,
                    startTime,
                    endTime,
                    merkleRoot,
                    manifestCid
                );

            const election = await ekMatVoting.getElection(electionId);
            expect(election.name).to.equal(electionName);
            expect(election.active).to.be.false; // Default is inactive
        });

        it("Should allow admin to toggle election active status", async function () {
            const now = Math.floor(Date.now() / 1000);
            await ekMatVoting.createElection(
                electionId,
                electionName,
                now + 60,
                now + 3600,
                merkleRoot,
                manifestCid
            );

            await expect(ekMatVoting.toggleElectionActive(electionId, true))
                .to.emit(ekMatVoting, "ElectionToggled")
                .withArgs(electionId, true);

            const election = await ekMatVoting.getElection(electionId);
            expect(election.active).to.be.true;
        });

        it("Should allow admin to add candidates", async function () {
            const now = Math.floor(Date.now() / 1000);
            await ekMatVoting.createElection(
                electionId,
                electionName,
                now + 60,
                now + 3600,
                merkleRoot,
                manifestCid
            );

            await expect(
                ekMatVoting.addCandidate(electionId, candidateId, candidateName, candidateCid)
            )
                .to.emit(ekMatVoting, "CandidateAdded")
                .withArgs(electionId, candidateId, candidateName, candidateCid);

            const candidates = await ekMatVoting.getCandidates(electionId);
            expect(candidates.length).to.equal(1);
            expect(candidates[0].name).to.equal(candidateName);
        });

        it("Should fail if non-admin tries to create election", async function () {
            const now = Math.floor(Date.now() / 1000);
            await expect(
                ekMatVoting.connect(addr1).createElection(
                    electionId,
                    electionName,
                    now,
                    now + 3600,
                    merkleRoot,
                    manifestCid
                )
            ).to.be.revertedWithCustomError(ekMatVoting, "NotAdmin");
        });
    });

    describe("Voting", function () {
        let startTime: number;
        let endTime: number;

        beforeEach(async function () {
            const now = Math.floor(Date.now() / 1000);
            startTime = now - 60; // Just started
            endTime = now + 3600;

            await ekMatVoting.createElection(
                electionId,
                electionName,
                startTime,
                endTime,
                merkleRoot,
                manifestCid
            );

            await ekMatVoting.addCandidate(
                electionId,
                candidateId,
                candidateName,
                candidateCid
            );

            // Activate election
            await ekMatVoting.toggleElectionActive(electionId, true);
        });

        it("Should allow casting a vote with valid proof", async function () {
            const proof = ethers.toUtf8Bytes("mockProof");
            // publicInputs[0] must match merkleRoot for logic consistency if array not empty,
            // but our test MerkleRoot is ZeroHash. 
            // However, the contract check `if (publicInputs.length > 0)`...
            // Let's pass empty publicInputs for simplicity unless contract enforces length.
            // Contract: if (publicInputs.length > 0) checks mismatch.
            const pubSignals: any[] = [];
            const nullifier = ethers.keccak256(ethers.toUtf8Bytes("user1"));
            const cid = "QmVoteCid";

            await expect(
                ekMatVoting.castVote(
                    electionId,
                    candidateId,
                    proof,
                    pubSignals,
                    nullifier,
                    cid
                )
            )
                .to.emit(ekMatVoting, "VoteCast")
                .withArgs(electionId, candidateId, nullifier, cid);

            const candidates = await ekMatVoting.getCandidates(electionId);
            expect(candidates[0].voteCount).to.equal(1);
        });

        it("Should prevent double voting with same nullifier", async function () {
            const proof = ethers.toUtf8Bytes("mockProof");
            const pubSignals: any[] = [];
            const nullifier = ethers.keccak256(ethers.toUtf8Bytes("user1"));
            const cid = "QmVoteCid";

            await ekMatVoting.castVote(
                electionId,
                candidateId,
                proof,
                pubSignals,
                nullifier,
                cid
            );

            await expect(
                ekMatVoting.castVote(
                    electionId,
                    candidateId,
                    proof,
                    pubSignals,
                    nullifier,
                    cid
                )
            ).to.be.revertedWithCustomError(ekMatVoting, "NullifierAlreadyUsed");
        });

        it("Should fail if election is not active", async function () {
            await ekMatVoting.toggleElectionActive(electionId, false);

            const proof = ethers.toUtf8Bytes("mockProof");
            const pubSignals: any[] = [];
            const nullifier = ethers.keccak256(ethers.toUtf8Bytes("user1"));

            await expect(
                ekMatVoting.castVote(
                    electionId,
                    candidateId,
                    proof,
                    pubSignals,
                    nullifier,
                    "cid"
                )
            ).to.be.revertedWithCustomError(ekMatVoting, "ElectionNotActive");
        });
    });
});
