import React, { useEffect, useState } from 'react';
import { useContract } from '../hooks/useContract';
import EkMatVotingArtifact from '../abi/EkMatVoting.json';
import { EKMAT_VOTING_ADDRESS } from '../utils/constants';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { theme } from '../styles/theme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.success];

const ResultsPage: React.FC = () => {
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const [elections, setElections] = useState<any[]>([]);
    const [selectedElectionId, setSelectedElectionId] = useState(0);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contract) fetchElections();
    }, [contract]);

    useEffect(() => {
        if (contract) fetchResults(selectedElectionId);
    }, [contract, selectedElectionId]);

    const fetchElections = async () => {
        // Only doing Election 0 for demo
        const e = await contract!.getElection(0).catch(() => null);
        if (e) setElections([{ ...e, id: 0 }]);
    };

    const fetchResults = async (id: number) => {
        setLoading(true);
        try {
            const cands = await contract!.getCandidates(id);
            const data = cands.map((c: any) => ({
                name: c.name,
                votes: Number(c.voteCount),
                party: c.party
            }));
            setChartData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const totalVotes = chartData.reduce((acc, curr) => acc + curr.votes, 0);

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-header-title">Election Results</h1>
                <p className="page-header-subtitle">
                    Select an election to view candidate-wise vote counts, turnout and audit references.
                </p>
            </div>

            <div className="page-section">
                <Card style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Election Overview</h2>
                        <p style={{ color: theme.colors.textSecondary, fontSize: '0.9rem', margin: 0 }}>Viewing real-time results from the ledger.</p>
                    </div>
                    <select
                        value={selectedElectionId}
                        onChange={e => setSelectedElectionId(Number(e.target.value))}
                        style={{ padding: '10px', borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray300}`, minWidth: '200px' }}
                    >
                        {elections.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </Card>
            </div>

            <div className="page-grid-2 page-section">
                <Card style={{ padding: '2rem', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Vote Distribution</h3>
                    {loading ? <p>Loading...</p> : (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="votes" fill={theme.colors.primary}>
                                    {chartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Card>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Card style={{ padding: '2rem', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>Total Turnout</h3>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', color: theme.colors.primary }}>
                            {totalVotes}
                        </div>
                        <p style={{ color: theme.colors.textSecondary }}>Votes Cast</p>
                    </Card>

                    <Card style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem' }}>Transparency Resources</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '1rem' }}>
                                <a href="#" style={{ color: theme.colors.primary, textDecoration: 'none' }}>📦 View Election Manifest (IPFS)</a>
                            </li>
                            <li style={{ marginBottom: '1rem' }}>
                                <a href={`https://sepolia.etherscan.io/address/${EKMAT_VOTING_ADDRESS}`} target="_blank" rel="noreferrer" style={{ color: theme.colors.primary, textDecoration: 'none' }}>📜 View Smart Contract</a>
                            </li>
                            <li>
                                <a href="#" style={{ color: theme.colors.primary, textDecoration: 'none' }}>🔒 Download Anonymized Vote Logs</a>
                            </li>
                        </ul>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default ResultsPage;
