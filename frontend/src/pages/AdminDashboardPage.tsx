import React, { useState, useEffect } from 'react';
import { useProvider } from '../hooks/useProvider';
import { useContract } from '../hooks/useContract';
import EkMatVotingArtifact from '../abi/EkMatVoting.json';
import { EKMAT_VOTING_ADDRESS } from '../utils/constants';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/ToastProvider';
import { theme } from '../styles/theme';
import { api } from '../lib/api'; // Use api wrapper
import { Server, Plus, ToggleLeft, ToggleRight, Upload, Users } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
    const { account } = useProvider();
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('elections');
    const [loading, setLoading] = useState(false);

    // Data States
    const [elections, setElections] = useState<any[]>([]);
    const [fraudStats, setFraudStats] = useState<any>(null); // For future integration
    const [networkInfo, setNetworkInfo] = useState<any>(null);

    // Forms
    const [newElectionName, setNewElectionName] = useState('');
    const [targetElectionId, setTargetElectionId] = useState(0);
    const [newCandidateName, setNewCandidateName] = useState('');
    const [newCandidateParty, setNewCandidateParty] = useState('');
    const [newCandidateImage, setNewCandidateImage] = useState<File | null>(null);

    useEffect(() => {
        if (contract) {
            fetchElections();
            // Mock fetch fraud stats
            api.analytics.getFraudStats().then(setFraudStats).catch(console.error);
        }
    }, [contract]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.request({ method: 'eth_chainId' }).then((id: string) => {
                setNetworkInfo({ chainId: id, name: 'Localhost / Sepolia' });
            });
        }
    }, []);

    const fetchElections = async () => {
        // In a real dApp we'd iterate counters. For now fetch ID 0 and 1
        const list = [];
        try {
            const e0 = await contract!.getElection(0).catch(() => null);
            if (e0 && e0.name) list.push({ ...e0, id: 0 });
            const e1 = await contract!.getElection(1).catch(() => null);
            if (e1 && e1.name) list.push({ ...e1, id: 1 });
        } catch (e) { console.error(e); }
        setElections(list);
    };

    const createElection = async () => {
        if (!newElectionName) return;
        console.log('Creating election:', newElectionName);
        console.log('Contract:', contract);
        setLoading(true);
        try {
            // Generate election ID from name
            const electionId = newElectionName.toLowerCase().replace(/\s+/g, '-');

            // Set election times (start now, end in 7 days)
            const startTime = Math.floor(Date.now() / 1000);
            const endTime = startTime + (7 * 24 * 60 * 60); // 7 days from now

            // Use zero merkle root for now (will be set later when adding voters)
            const merkleRoot = '0x0000000000000000000000000000000000000000000000000000000000000000';

            // Empty manifest CID for now
            const manifestCid = '';

            console.log('Calling contract.createElection with params:', {
                electionId,
                name: newElectionName,
                startTime,
                endTime,
                merkleRoot,
                manifestCid
            });

            const tx = await contract!.createElection(
                electionId,
                newElectionName,
                startTime,
                endTime,
                merkleRoot,
                manifestCid
            );
            console.log('Transaction created:', tx);
            await tx.wait();
            console.log('Transaction confirmed');
            showToast('Election created successfully', 'success');
            fetchElections();
            setNewElectionName('');
        } catch (err: any) {
            console.error('Error creating election:', err);
            showToast(err.reason || err.message || 'Failed to create election', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleElection = async (id: number) => {
        setLoading(true);
        try {
            const tx = await contract!.toggleElectionActive(id);
            await tx.wait();
            showToast('Election status updated', 'success');
            fetchElections();
        } catch (err: any) {
            showToast(err.reason || 'Failed to toggle election', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addCandidate = async () => {
        if (!newCandidateName || !newCandidateParty || !newCandidateImage) {
            showToast('Please fill all fields', 'error');
            return;
        }
        setLoading(true);
        try {
            // Upload image to IPFS
            const formData = new FormData();
            formData.append('file', newCandidateImage);
            const ipfsRes = await api.ipfs.uploadFile(formData);

            if (!ipfsRes.success) throw new Error('IPFS Upload failed');
            const cid = ipfsRes.ipfsHash;

            // Add to contract
            const tx = await contract!.addCandidate(targetElectionId, newCandidateName, newCandidateParty, cid);
            await tx.wait();
            showToast('Candidate added successfully', 'success');
            setNewCandidateName('');
            setNewCandidateParty('');
            setNewCandidateImage(null);
        } catch (err: any) {
            showToast(err.reason || err.message || 'Failed to add candidate', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!account) {
        return (
            <Layout>
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                    <h2>Please connect wallet to access Admin Dashboard</h2>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-header-title">Admin Control Panel</h1>
                <p className="page-header-subtitle">
                    Create and manage elections, candidates and monitor fraud analytics for the EkMat platform.
                </p>
            </div>

            <div className="page-section">
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    {['elections', 'candidates', 'analytics', 'system'].map(tab => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? 'primary' : 'outline'}
                            onClick={() => setActiveTab(tab)}
                            style={{ textTransform: 'capitalize' }}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                {activeTab === 'elections' && (
                    <div className="page-grid-2">
                        <Card style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={20} /> Create Election
                            </h3>
                            <input
                                placeholder="Election Name"
                                value={newElectionName}
                                onChange={e => setNewElectionName(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                            />
                            <Button onClick={createElection} disabled={loading} fullWidth>
                                {loading ? 'Creating...' : 'Create Election'}
                            </Button>
                        </Card>

                        <Card style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Existing Elections</h3>
                            {elections.map(e => (
                                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: `1px solid ${theme.colors.gray200}` }}>
                                    <div>
                                        <strong>ID {e.id}: {e.name}</strong>
                                        <div style={{ fontSize: '0.8rem', color: e.isActive ? theme.colors.success : theme.colors.textSecondary }}>
                                            {e.isActive ? 'Active' : 'Inactive'}
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => toggleElection(e.id)} disabled={loading}>
                                        {e.isActive ? <ToggleRight color={theme.colors.success} /> : <ToggleLeft />}
                                    </Button>
                                </div>
                            ))}
                            {elections.length === 0 && <p>No elections found.</p>}
                        </Card>
                    </div>
                )}

                {activeTab === 'candidates' && (
                    <Card style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Users size={20} /> Add Candidate
                        </h3>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Select Election ID</label>
                            <input
                                type="number"
                                value={targetElectionId}
                                onChange={e => setTargetElectionId(Number(e.target.value))}
                                style={{ width: '100%', padding: '10px', marginTop: '0.5rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                            />
                        </div>

                        <input
                            placeholder="Candidate Name"
                            value={newCandidateName}
                            onChange={e => setNewCandidateName(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                        />
                        <input
                            placeholder="Party / Affiliation"
                            value={newCandidateParty}
                            onChange={e => setNewCandidateParty(e.target.value)}
                            style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}` }}
                        />

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Candidate Photo</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <Button variant="outline" size="sm" style={{ position: 'relative' }}>
                                    <Upload size={16} style={{ marginRight: '5px' }} /> Upload
                                    <input
                                        type="file"
                                        onChange={e => setNewCandidateImage(e.target.files ? e.target.files[0] : null)}
                                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                                    />
                                </Button>
                                <span>{newCandidateImage ? newCandidateImage.name : 'No file chosen'}</span>
                            </div>
                        </div>

                        <Button onClick={addCandidate} disabled={loading} fullWidth>
                            {loading ? 'Adding...' : 'Add Candidate'}
                        </Button>
                    </Card>
                )}

                {activeTab === 'analytics' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {/* Placeholder for charts */}
                        <Card style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Suspicious Activity</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.warning }}>
                                {fraudStats ? fraudStats.suspiciousIPs : 0}
                            </div>
                            <p style={{ color: theme.colors.textSecondary }}>Blocked IP Attempts</p>
                        </Card>
                        <Card style={{ padding: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Failed Proofs</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: theme.colors.error }}>
                                {fraudStats ? fraudStats.failedZKProofs : 0}
                            </div>
                            <p style={{ color: theme.colors.textSecondary }}>Invalid ZK Proof Submissions</p>
                        </Card>
                    </div>
                )}

                {activeTab === 'system' && (
                    <Card style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Server size={20} /> System Status
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Network:</span>
                                <strong>{networkInfo?.name || 'Unknown'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Chain ID:</span>
                                <strong>{networkInfo?.chainId || '-'}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Contract Address:</span>
                                <span style={{ fontFamily: 'monospace' }}>{EKMAT_VOTING_ADDRESS}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span>System Health:</span>
                                <span style={{ color: theme.colors.success, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: theme.colors.success }}></div>
                                    Operational
                                </span>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </Layout>
    );
};

export default AdminDashboardPage;
