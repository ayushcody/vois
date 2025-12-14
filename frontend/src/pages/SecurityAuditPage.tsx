import React, { useEffect, useState } from 'react';
import { useContract } from '../hooks/useContract';
import EkMatVotingArtifact from '../abi/EkMatVoting.json';
import { EKMAT_VOTING_ADDRESS } from '../utils/constants';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { theme } from '../styles/theme';
import { AlertTriangle, FileText } from 'lucide-react';
import { api } from '../lib/api';

const SecurityAuditPage: React.FC = () => {
    const contract = useContract(EKMAT_VOTING_ADDRESS, EkMatVotingArtifact.abi);
    const [events, setEvents] = useState<any[]>([]);
    const [fraudEvents, setFraudEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contract) loadAuditLogs();
    }, [contract]);

    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            // 1. Fetch Contract Events
            // Create filters
            const voteFilter = contract!.filters.VoteCast();
            const electionFilter = contract!.filters.ElectionCreated();

            const voteLogs = await contract!.queryFilter(voteFilter, 0, 'latest'); // Query from genesis for demo
            const electionLogs = await contract!.queryFilter(electionFilter, 0, 'latest');

            const formattedVoteLogs = await Promise.all(voteLogs.map(async (log: any) => {
                const block = await log.provider.getBlock(log.blockHash);
                return {
                    type: 'VoteCast',
                    hash: log.transactionHash,
                    timestamp: block!.timestamp * 1000,
                    details: `Voter cast vote in Election #${log.args[0]}`
                };
            }));

            const formattedElectionLogs = await Promise.all(electionLogs.map(async (log: any) => {
                const block = await log.provider.getBlock(log.blockHash);
                return {
                    type: 'ElectionCreated',
                    hash: log.transactionHash,
                    timestamp: block!.timestamp * 1000,
                    details: `Election "${log.args[1]}" Created`
                };
            }));

            const allEvents = [...formattedVoteLogs, ...formattedElectionLogs].sort((a, b) => b.timestamp - a.timestamp);
            setEvents(allEvents);

            // 2. Fetch Fraud Analytics
            const stats = await api.analytics.getFraudStats();
            // Since stats is just numbers in our mock, we'll simulate events if count > 0
            if (stats.failedZKProofs > 0) {
                setFraudEvents([{ type: 'FailedZKP', count: stats.failedZKProofs, details: 'Invalid Zero-Knowledge Proof attempts detected' }]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-header-title">Security & Audit Trail</h1>
                <p className="page-header-subtitle">
                    Review on-chain events and fraud analytics to independently verify elections run on EkMat.
                </p>
            </div>

            <div className="page-section">
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {/* Risk Alerts */}
                    {(fraudEvents.length > 0) && (
                        <Card style={{ padding: '1.5rem', borderLeft: `5px solid ${theme.colors.error}` }}>
                            <h3 style={{ color: theme.colors.error, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertTriangle size={24} /> Security Alerts
                            </h3>
                            <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                                {fraudEvents.map((e, i) => (
                                    <li key={i}>{e.details} ({e.count} occurrences)</li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {/* Event Timeline */}
                    <Card style={{ padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.colors.gray200}` }}>
                            <h3>Immutable Event Ledger</h3>
                            <p style={{ color: theme.colors.textSecondary }}>Real-time events fetched directly from the Ethereum blockchain.</p>
                        </div>

                        <div>
                            {loading ? <p style={{ padding: '2rem' }}>Syncing with blockchain...</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: theme.colors.gray100 }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Event Type</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Details</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Timestamp</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>TX Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {events.map((e, i) => (
                                            <tr key={i} style={{ borderBottom: `1px solid ${theme.colors.gray100}` }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.8rem',
                                                        background: e.type === 'VoteCast' ? theme.colors.success + '20' : theme.colors.primary + '20',
                                                        color: e.type === 'VoteCast' ? theme.colors.success : theme.colors.primary
                                                    }}>
                                                        {e.type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>{e.details}</td>
                                                <td style={{ padding: '1rem', color: theme.colors.textSecondary }}>
                                                    {new Date(e.timestamp).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <a href={`https://sepolia.etherscan.io/tx/${e.hash}`} target="_blank" rel="noreferrer" style={{ color: theme.colors.primary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        View <FileText size={14} />
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                        {events.length === 0 && (
                                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No events found on-chain yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default SecurityAuditPage;
