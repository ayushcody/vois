import React from 'react';
import { useProvider } from '../hooks/useProvider';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useToast } from '../components/common/ToastProvider';
import { theme } from '../styles/theme';
import { Wallet, User, LogOut, Copy } from 'lucide-react';

const ProfilePage: React.FC = () => {
    const { account, connect, disconnect } = useProvider();
    const { showToast } = useToast();

    const shortAddr = (addr: string) => addr?.substring(0, 6) + '...' + addr?.substring(addr.length - 4);

    const copyAddress = () => {
        if (account) {
            navigator.clipboard.writeText(account);
            showToast('Address copied to clipboard', 'success');
        }
    };

    const handleConnect = async () => {
        try {
            await connect();
            showToast('Wallet connected successfully', 'success');
        } catch (error) {
            showToast('Failed to connect wallet', 'error');
        }
    };

    const handleDisconnect = () => {
        disconnect();
        showToast('Wallet disconnected', 'info');
    };

    return (
        <Layout>
            <div className="page-header">
                <h1 className="page-header-title">Profile</h1>
                <p className="page-header-subtitle">
                    Manage your wallet connection and view account information.
                </p>
            </div>

            <div className="page-section">
                <Card style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <User size={32} color={theme.colors.primary} />
                        <h2 style={{ margin: 0 }}>Wallet Information</h2>
                    </div>

                    {account ? (
                        <div>
                            <div style={{ 
                                background: theme.colors.gray100, 
                                padding: '1.5rem', 
                                borderRadius: theme.borderRadius.md, 
                                marginBottom: '2rem' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <Wallet size={20} color={theme.colors.success} />
                                    <span style={{ color: theme.colors.success, fontWeight: 'bold' }}>Connected</span>
                                </div>
                                
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Wallet Address:
                                    </label>
                                    <div style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem',
                                        background: 'white',
                                        padding: '0.75rem',
                                        borderRadius: theme.borderRadius.sm,
                                        border: `1px solid ${theme.colors.gray300}`
                                    }}>
                                        <span style={{ fontFamily: 'monospace', flex: 1 }}>
                                            {account}
                                        </span>
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={copyAddress}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        >
                                            <Copy size={14} />
                                            Copy
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                        Short Address:
                                    </label>
                                    <span style={{ 
                                        fontFamily: 'monospace', 
                                        background: 'white',
                                        padding: '0.75rem',
                                        borderRadius: theme.borderRadius.sm,
                                        border: `1px solid ${theme.colors.gray300}`,
                                        display: 'inline-block'
                                    }}>
                                        {shortAddr(account)}
                                    </span>
                                </div>
                            </div>

                            <Button 
                                onClick={handleDisconnect}
                                variant="outline"
                                fullWidth
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem',
                                    color: theme.colors.error,
                                    borderColor: theme.colors.error
                                }}
                            >
                                <LogOut size={16} />
                                Disconnect Wallet
                            </Button>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ 
                                background: theme.colors.gray100, 
                                padding: '3rem 2rem', 
                                borderRadius: theme.borderRadius.md, 
                                marginBottom: '2rem' 
                            }}>
                                <Wallet size={48} color={theme.colors.gray400} style={{ marginBottom: '1rem' }} />
                                <h3 style={{ color: theme.colors.gray600, marginBottom: '0.5rem' }}>
                                    No Wallet Connected
                                </h3>
                                <p style={{ color: theme.colors.textSecondary, margin: 0 }}>
                                    Connect your wallet to access EkMat voting features
                                </p>
                            </div>

                            <Button 
                                onClick={handleConnect}
                                fullWidth
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    gap: '0.5rem' 
                                }}
                            >
                                <Wallet size={16} />
                                Connect Wallet
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default ProfilePage;