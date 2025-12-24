import React, { useEffect, useMemo, useState } from 'react';
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
import { Vote, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
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
    id: string;  // Changed from number to string
    name: string;
    startTime: number;
    endTime: number;
    active: boolean;  // Changed from isActive to active
    merkleRoot: string;
}

interface LiveElectionTallyProps {
    candidates: Candidate[];
    loading: boolean;
    lastBlock: number | null;
    onRefresh: () => void;
}

const LiveElectionTally: React.FC<LiveElectionTallyProps> = ({ candidates, loading, lastBlock, onRefresh }) => {
    const totalVotes = useMemo(
        () => candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0),
        [candidates]
    );

    const getPercentage = (count: number) => {
        if (!totalVotes) return 0;
        return Math.round((count / totalVotes) * 100);
    };

    return (
        <Card className="tally-card">
            <div className="tally-header">
                <div>
                    <div className="tally-title">Live Election Tally</div>
                    <div className="tally-subtitle">Updated from on-chain vote counts</div>
                </div>
                <div className="tally-live-badge">
                    <span className="tally-live-dot" />
                    Live
                </div>
            </div>

            <div className="tally-total">
                <div className="tally-total-label">Total Votes Cast</div>
                <div className="tally-total-number">
                    {loading ? '— — —' : totalVotes.toString()}
                </div>
            </div>

            <div className="tally-bars">
                {loading && (
                    <>
                        <div className="tally-bar-row skeleton-row" />
                        <div className="tally-bar-row skeleton-row" />
                        <div className="tally-bar-row skeleton-row" />
                    </>
                )}
                {!loading && candidates.map((candidate) => {
                    const pct = getPercentage(candidate.voteCount || 0);
                    return (
                        <div key={candidate.id} className="tally-bar-row">
                            <div className="tally-bar-label">
                                <span className="tally-bar-name">{candidate.name}</span>
                                <span className="tally-bar-value">
                                    {candidate.voteCount.toString().padStart(2, '0')} (
                                    {pct.toString().padStart(2, '0')}%)
                                </span>
                            </div>
                            <div className="tally-bar-track">
                                <div
                                    className="tally-bar-fill"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
                {!loading && candidates.length === 0 && (
                    <div className="tally-empty">No tally data available for this election yet.</div>
                )}
            </div>

            <div className="tally-footer">
                <div className="tally-footer-text">
                    Last Block Checked:{' '}
                    <span className="tally-footer-block">
                        {lastBlock !== null ? `#${lastBlock}` : '— — —'}
                    </span>
                </div>
                <button
                    type="button"
                    className="tally-refresh-btn"
                    onClick={onRefresh}
                >
                    <RefreshCw size={14} />
                </button>
            </div>
        </Card>
    );
};

const VotePage: React.FC = () => {
    const { account, provider } = useProvider();
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const { showToast } = useToast();

    const [elections, setElections] = useState<Election[]>([]);
    const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);
    const [voting, setVoting] = useState(false);
    const [lastBlock, setLastBlock] = useState<number | null>(null);

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
            // Get all election IDs from the contract
            const rawIds: any = await contract!.getElectionIds();
            const electionIds = Array.from(rawIds);
            console.log('[VotePage] Election IDs:', electionIds);

            // Fetch each election by its string ID
            const list = [];
            for (const id of electionIds) {
                try {
                    const election = await contract!.getElection(id);
                    console.log(`[VotePage] Election ${id} raw:`, {
                        id: election.id,
                        name: election.name,
                        active: election.active
                    });

                    // Explicitly map fields to ensure they're preserved
                    const mappedElection = {
                        id: id,
                        name: election.name,
                        active: Boolean(election.active),
                        startTime: Number(election.startTime),
                        endTime: Number(election.endTime),
                        merkleRoot: election.merkleRoot
                    };

                    console.log(`[VotePage] Election ${id} mapped:`, mappedElection);

                    // Only show active elections
                    if (mappedElection.active) {
                        console.log(`[VotePage] Adding active election ${id} to list`);
                        list.push(mappedElection);
                    } else {
                        console.log(`[VotePage] Skipping inactive election ${id}`);
                    }
                } catch (e) {
                    console.error(`Failed to fetch election ${id}:`, e);
                }
            }

            console.log('[VotePage] Final elections list:', list);
            setElections(list);
            if (list.length > 0) {
                setSelectedElectionId(String(list[0].id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadCandidates = async (electionId: string) => {
        setLoading(true);
        try {
            const cands = await contract!.getCandidates(electionId);
            console.log('[VotePage] Raw candidates from contract:', cands);
            // Map contract struct to local interface
            const formatted = cands.map((c: any, index: number) => {
                console.log(`[VotePage] Candidate ${index}:`, {
                    id: c.id || c.candidateId,
                    name: c.name,
                    party: c.party
                });
                return {
                    id: c.id || c.candidateId || `candidate-${index}`, // Use actual ID from contract
                    name: c.name,
                    party: c.party,
                    ipfsCid: c.ipfsCid,
                    voteCount: Number(c.voteCount)
                };
            });
            console.log('[VotePage] Formatted candidates:', formatted);
            setCandidates(formatted);

            if (provider) {
                const blockNumber = await provider.getBlockNumber();
                setLastBlock(blockNumber);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to load candidates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshTally = () => {
        if (selectedElectionId !== null && contract) {
            loadCandidates(selectedElectionId);
        }
    };

    const handleCastVote = async (candidateId: string, candidateName: string) => {
        console.log('🗳️ VOTE BUTTON CLICKED!', { candidateId, candidateName, contract, account });

        // Get account from contract signer if useProvider account is null
        let voterAccount = account;
        if (!voterAccount && contract) {
            try {
                const signer = await contract.runner;
                if (signer && 'getAddress' in signer) {
                    voterAccount = await (signer as any).getAddress();
                    console.log('Got account from contract signer:', voterAccount);
                }
            } catch (e) {
                console.error('Failed to get account from signer:', e);
            }
        }

        if (!contract) {
            console.error('No contract available!');
            showToast('Contract not initialized', 'error');
            return;
        }

        if (!voterAccount) {
            console.error('No account available!');
            showToast('Please connect your wallet first', 'error');
            return;
        }

        console.log('Skipping confirmation dialog for testing...');
        // Temporarily disabled confirmation dialog
        // console.log('About to show confirmation dialog...');
        // const confirm = window.confirm(`Confirm vote for ${candidateName}?`);
        // console.log('Confirmation dialog result:', confirm);
        // if (!confirm) {
        //     console.log('User cancelled vote');
        //     return;
        // }
        console.log('Proceeding directly to vote...');

        // 1. Get ZK Proof artifacts from local storage (mocked or real)
        let storedReg = localStorage.getItem('ekmat_registration');
        if (!storedReg) {
            // For testing/demo: create mock registration automatically
            console.log('No registration found, creating mock registration for testing...');
            const mockRegistration = {
                commitment: ethers.hexlify(ethers.randomBytes(32)),
                nullifier: ethers.hexlify(ethers.randomBytes(32)),
                timestamp: Date.now()
            };
            localStorage.setItem('ekmat_registration', JSON.stringify(mockRegistration));
            storedReg = JSON.stringify(mockRegistration);
            showToast('Auto-registered for testing', 'info');
        }
        JSON.parse(storedReg); // Validation

        setVoting(true);
        try {
            console.log('[Vote] Starting vote process...');
            console.log('[Vote] Selected election ID:', selectedElectionId);
            console.log('[Vote] Candidate ID:', candidateId);
            console.log('[Vote] Candidate name:', candidateName);

            // Fetch election details to get the merkleRoot
            const election = await contract!.getElection(selectedElectionId);
            console.log('[Vote] Election details:', {
                merkleRoot: election.merkleRoot,
                active: election.active,
                startTime: Number(election.startTime),
                endTime: Number(election.endTime)
            });

            // 2. Prepare mock inputs for hackathon/demo
            // Contract signature:
            // castVote(string electionId, string candidateId, bytes proof, uint256[] publicInputs, bytes32 nullifier, string cid)

            // Use the election's merkleRoot instead of a dummy value
            const electionMerkleRoot = election.merkleRoot;
            const randomNullifier = ethers.hexlify(ethers.randomBytes(32)); // bytes32

            console.log('[Vote] Generated nullifier:', randomNullifier);
            console.log('[Vote] Election merkle root:', electionMerkleRoot);

            // publicSignals = [merkleRoot, nullifierHash]
            // Convert merkleRoot from bytes32 to uint256
            const merkleRootUint = BigInt(electionMerkleRoot);
            const publicInputs = [merkleRootUint, BigInt(randomNullifier)];

            console.log('[Vote] Public inputs:', publicInputs.map(i => i.toString()));
            console.log('[Vote] Calling contract.castVote...');

            const tx = await contract.castVote(
                String(selectedElectionId), // electionId (string)
                String(candidateId),        // candidateId (string)
                ethers.toUtf8Bytes("mock_proof"), // proof (bytes)
                publicInputs,               // publicInputs (uint256[])
                randomNullifier,            // nullifier (bytes32)
                "QmReceiptCid"              // cid (string)
            );

            console.log('[Vote] Transaction created:', tx.hash);
            showToast('Transaction sent, waiting for confirmation...', 'info');
            await tx.wait();
            console.log('[Vote] Transaction confirmed!');

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
                        onChange={(e) => setSelectedElectionId(e.target.value)}
                    >
                        {elections.length === 0 ? <option>No active elections</option> : null}
                        {elections.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </Card>
            </div>

            {selectedElectionId !== null && (
                <div className="page-section">
                    <div className="vote-layout">
                        <div className="vote-candidates-grid">
                            {candidates.map(candidate => (
                                <Card key={candidate.id} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ height: '180px', background: theme.colors.gray100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${theme.colors.gray200}` }}>
                                        {/* Placeholder or IPFS Image */}
                                        {candidate.ipfsCid ? (
                                            <img
                                                src={`https://gateway.pinata.cloud/ipfs/${candidate.ipfsCid}`}
                                                alt={candidate.name}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => {
                                                    // Show placeholder if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.parentElement!.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path></svg>';
                                                }}
                                            />
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

                        <LiveElectionTally
                            candidates={candidates}
                            loading={loading}
                            lastBlock={lastBlock}
                            onRefresh={handleRefreshTally}
                        />
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default VotePage;
