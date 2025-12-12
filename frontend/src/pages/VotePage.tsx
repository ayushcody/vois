import React, { useEffect, useState } from 'react';
import { useProvider } from '../hooks/useProvider';
import { useContract } from '../hooks/useContract';
import EkMatVotingArtifact from '../abi/EkMatVoting.json';
import { EKMAT_VOTING_ADDRESS } from '../utils/constants'; // Adjust path if needed
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/ToastProvider';
import { theme } from '../styles/theme';
import { api } from '../lib/api';
import { Vote, CheckCircle, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';

// Helper to format short address
const shortAddr = (addr: string) => addr?.substring(0, 6) + '...' + addr?.substring(addr.length - 4);

interface Candidate {
    id: number;
    name: string;
    party: string;
    ipfsCid: string;
    voteCount: number;
}

interface Election {
    id: number;
    name: string;
    startTime: number;
    endTime: number;
    isActive: boolean;
    merkleRoot: string;
}

const VotePage: React.FC = () => {
    const { account } = useProvider();
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const { showToast } = useToast();

    const [elections, setElections] = useState<Election[]>([]);
    const [selectedElectionId, setSelectedElectionId] = useState<number | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [voting, setVoting] = useState(false);

    // Vote Success State
    const [voteReceipt, setVoteReceipt] = useState<{ txHash: string; ipfsCid: string } | null>(null);

    useEffect(() => {
        if (contract) loadElections();
    }, [contract]);

    useEffect(() => {
        if (selectedElectionId !== null && contract) {
            loadCandidates(selectedElectionId);
        }
    }, [selectedElectionId, contract]);

    const loadElections = async () => {
        try {
            // In a real app we might iterate or have a getElections count
            // For now, let's try fetching election ID 0 and 1
            const election0 = await contract!.getElection(0).catch(() => null);
            if (election0 && election0.name) {
                setElections([{ ...election0, id: 0 }]); // Simplified
                setSelectedElectionId(0);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadCandidates = async (electionId: number) => {
        setLoading(true);
        try {
            const cands = await contract!.getCandidates(electionId);
            // Map contract struct to local interface
            const formatted = cands.map((c: any, index: number) => ({
                id: index, // Index in the array is usually the ID for simple arrays
                name: c.name,
                party: c.party,
                ipfsCid: c.ipfsCid,
                voteCount: Number(c.voteCount)
            }));
            setCandidates(formatted);
        } catch (err) {
            console.error(err);
            showToast('Failed to load candidates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCastVote = async (candidateId: number, candidateName: string) => {
        if (!contract) return;
        const confirm = window.confirm(`Confirm vote for ${candidateName}?`);
        if (!confirm) return;

        // 1. Get ZK Proof artifacts from local storage (mocked or real)
        const storedReg = localStorage.getItem('ekmat_registration');
        if (!storedReg) {
            showToast('No registration found. Please register first.', 'error');
            return;
        }
        JSON.parse(storedReg); // Validation

        setVoting(true);
        try {
            // 2. Prepare mock inputs for hackathon/demo
            // Contract signature:
            // castVote(string electionId, string candidateId, bytes proof, uint256[] publicInputs, bytes32 nullifier, string cid)

            // Mock Data
            const dummyMerkleRoot = BigInt(123456);
            const dummyElectionIdBigInt = BigInt(selectedElectionId || 0);
            const randomNullifier = ethers.hexlify(ethers.randomBytes(32)); // bytes32
            // publicSignals = [merkleRoot, electionId, nullifierHash]
            const publicInputs = [dummyMerkleRoot, dummyElectionIdBigInt, BigInt(randomNullifier)];

            const tx = await contract.castVote(
                String(selectedElectionId), // electionId (string)
                String(candidateId),        // candidateId (string)
                ethers.toUtf8Bytes("mock_proof"), // proof (bytes)
                publicInputs,               // publicInputs (uint256[])
                randomNullifier,            // nullifier (bytes32)
                "QmReceiptCid"              // cid (string)
            );

            showToast('Transaction sent, waiting for confirmation...', 'info');
            await tx.wait();

            // 3. Upload Receipt to IPFS
            const receiptData = {
                electionId: selectedElectionId,
                candidateId,
                txHash: tx.hash,
                timestamp: Date.now()
            };

            const ipfsRes = await api.ipfs.uploadJSON(receiptData);

            setVoteReceipt({
                txHash: tx.hash,
                ipfsCid: ipfsRes.ipfsHash
            });

            showToast('Vote cast successfully!', 'success');
            loadCandidates(selectedElectionId!); // Refresh counts
        } catch (err: any) {
            console.error(err);
            // Decode error if possible, or just show reason
            showToast(err.reason || err.message || 'Voting failed', 'error');
        } finally {
            setVoting(false);
        }
    };

    if (voteReceipt) {
        return (
            <Layout>
                <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
                    <Card style={{ padding: '3rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <CheckCircle size={64} color={theme.colors.success} />
                        </div>
                        <h2 style={{ color: theme.colors.success, marginBottom: '1rem' }}>Vote Cast Successfully!</h2>
                        <p style={{ marginBottom: '2rem', color: theme.colors.textSecondary }}>
                            Your vote has been anonymized and recorded on the blockchain.
                        </p>

                        <div style={{ background: theme.colors.gray100, padding: '1rem', borderRadius: theme.borderRadius.md, textAlign: 'left', marginBottom: '2rem' }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>TX Hash:</strong>
                                <a href={`https://sepolia.etherscan.io/tx/${voteReceipt.txHash}`} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: theme.colors.primary }}>
                                    {shortAddr(voteReceipt.txHash)} <ExternalLink size={12} />
                                </a>
                            </div>
                            <div>
                                <strong>Vote Receipt (IPFS):</strong>
                                <a href={`https://gateway.pinata.cloud/ipfs/${voteReceipt.ipfsCid}`} target="_blank" rel="noreferrer" style={{ marginLeft: '10px', color: theme.colors.primary }}>
                                    {voteReceipt.ipfsCid} <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>

                        <Button onClick={() => setVoteReceipt(null)}>Back to Elections</Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-header-title">Cast Your Vote</h1>
                <p className="page-header-subtitle">
                    Select the active election, review candidate details and confirm your choice.
                    Your vote is recorded on-chain with a Zero-Knowledge proof.
                </p>
            </div>

            <div className="page-section">
                <Card style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Active Elections</h2>
                        <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>Select an election to view the ballot.</p>
                    </div>

                    <select
                        style={{ padding: '10px', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}`, fontSize: '1rem', minWidth: '200px' }}
                        value={selectedElectionId || ''}
                        onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                    >
                        {elections.length === 0 ? <option>No active elections</option> : null}
                        {elections.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </Card>
            </div>

            {selectedElectionId !== null && (
                <div className="page-section">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                        {candidates.map(candidate => (
                            <Card key={candidate.id} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ height: '180px', background: theme.colors.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${theme.colors.gray200}` }}>
                                    {/* Placeholder or IPFS Image */}
                                    {candidate.ipfsCid ? (
                                        <img src={`https://gateway.pinata.cloud/ipfs/${candidate.ipfsCid}`} alt={candidate.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Vote size={48} color={theme.colors.gray300} />
                                    )}
                                </div>
                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <h3 style={{ marginBottom: '0.25rem', fontSize: '1.15rem' }}>{candidate.name}</h3>
                                    <p style={{ color: theme.colors.textSecondary, marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 500 }}>{candidate.party}</p>

                                    <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                                        {/* Profile link - mock for now since we don't have a real profile URL */}
                                        <a href="#" style={{ fontSize: '0.85rem', color: theme.colors.primary, textDecoration: 'underline' }}>
                                            View Profile on IPFS
                                        </a>
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: theme.colors.gray500, marginBottom: '1rem' }}>
                                        Current Votes: {candidate.voteCount}
                                    </div>

                                    <Button
                                        fullWidth
                                        onClick={() => handleCastVote(candidate.id, candidate.name)}
                                        disabled={voting || !account}
                                    >
                                        {voting ? 'Signing...' : (account ? `Confirm vote for ${candidate.name}` : 'Connect Wallet')}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {loading && <p style={{ textAlign: 'center', marginTop: '2rem', color: theme.colors.textSecondary }}>Loading candidates...</p>}
        </Layout>
    );
};

export default VotePage;
