
import React from 'react';
import { Link } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { Button } from './Button';
import { connectWallet } from '../../lib/blockchain';
import { useProvider } from '../../hooks/useProvider';

export const Navbar: React.FC = () => {
  const { account } = useProvider();

  const handleConnect = async () => {
    try {
      await connectWallet();
    } catch (e) {
      console.error(e);
      alert('Failed to connect wallet');
    }
  };

  const navLinkStyle = {
    color: theme.colors.textPrimary,
    textDecoration: 'none',
    fontWeight: 500
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: `1px solid ${theme.colors.gray200}`,
        backgroundColor: theme.colors.white,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '0.03em',
              color: theme.colors.primaryDark,
            }}
          >
            EkMat
          </Link>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.45rem',
              borderRadius: '999px',
              backgroundColor: theme.colors.gray100,
              color: theme.colors.textSecondary,
              textTransform: 'uppercase',
            }}
          >
            Pilot Election Portal
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/vote" style={navLinkStyle}>Vote</Link>
          <Link to="/results" style={navLinkStyle}>Results</Link>
          <Link to="/audit" style={navLinkStyle}>Audit</Link>
          <Link to="/admin" style={navLinkStyle}>Admin</Link>
          <Link
            to="/support"
            style={{
              ...navLinkStyle,
              padding: '0.35rem 0.9rem',
              borderRadius: '999px',
              border: `1px solid ${theme.colors.gray200}`,
              backgroundColor: theme.colors.gray100,
              fontSize: '0.85rem',
            }}
          >
            Support
          </Link>
        </div>

        {/* Wallet / status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              backgroundColor: theme.colors.gray100,
              color: theme.colors.textSecondary,
            }}
          >
            Network: Testnet
          </span>
          <Button onClick={handleConnect} variant={account ? 'secondary' : 'primary'} size="sm">
            {account ? `${account.substring(0, 6)}...${account.substring(38)}` : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    </nav>
  );
};
