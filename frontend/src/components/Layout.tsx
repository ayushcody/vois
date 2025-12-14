import React from 'react';
import { Navbar } from './common/Navbar';
import { theme } from '../styles/theme';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="page-shell">
            <Navbar />
            <main className="page-main">
                <div className="page-container">
                    {children}
                </div>
            </main>
            <footer
                style={{
                    padding: '1.5rem',
                    textAlign: 'center',
                    borderTop: `1px solid ${theme.colors.gray200}`,
                    color: theme.colors.textSecondary,
                    backgroundColor: theme.colors.white,
                    fontSize: '0.85rem',
                }}
            >
                © 2024 EkMat. EkMat Voting Platform. All actions are logged and auditable.
            </footer>
        </div>
    );
};
