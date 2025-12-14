import { Button } from '../common/Button';
import { theme } from '../../styles/theme';
import { Shield, CheckCircle, Database } from 'lucide-react';
import { Card } from '../common/Card';

export const HeroSection = () => (
    <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        background: `linear-gradient(135deg, ${theme.colors.backgroundAlt} 0%, #FFFFFF 100%)`
    }}>
        <h1 style={{ fontSize: theme.typography.h1, color: theme.colors.primaryDark, marginBottom: theme.spacing.md }}>
            EkMat
        </h1>
        <p style={{ fontSize: theme.typography.h3, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl }}>
            Secure, verifiable and privacy-preserving elections on blockchain.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: theme.spacing.md }}>
            <Button size="lg" variant="primary">Get Started</Button>
            <Button size="lg" variant="outline">View Demo</Button>
        </div>
    </section>
);

export const HowItWorksSection = () => (
    <section style={{ padding: '4rem 2rem', backgroundColor: theme.colors.white }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: theme.typography.h2 }}>How It Works</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            {[
                { step: 1, title: "Verify ID", desc: "Government issued Identity verification" },
                { step: 2, title: "Prove Eligibility", desc: "Generate Zero-Knowledge Proof" },
                { step: 3, title: "Vote Anonymously", desc: "Cast your vote on-chain" },
                { step: 4, title: "Verify Vote", desc: "Check via Manifest & Merkle Root" }
            ].map((item) => (
                <div key={item.step} style={{ width: '250px', textAlign: 'center' }}>
                    <div style={{
                        width: '50px', height: '50px', background: theme.colors.primary, color: 'white',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1rem', fontSize: '1.25rem', fontWeight: 'bold'
                    }}>
                        {item.step}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                    <p style={{ color: theme.colors.textSecondary }}>{item.desc}</p>
                </div>
            ))}
        </div>
    </section>
);

export const USPsSection = () => (
    <section style={{ padding: '4rem 2rem', backgroundColor: theme.colors.background }}>
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: theme.typography.h2 }}>Why EkMat?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Shield size={48} color={theme.colors.accent} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Privacy First</h3>
                    <p style={{ color: theme.colors.textSecondary }}>Uses Zero-Knowledge Proofs (zk-SNARKs) to ensure your vote remains anonymous while being verifiable.</p>
                </div>
            </Card>
            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <CheckCircle size={48} color={theme.colors.success} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Auditable</h3>
                    <p style={{ color: theme.colors.textSecondary }}>Every vote is recorded on the blockchain. Mathematical proofs guarantee the result's integrity.</p>
                </div>
            </Card>
            <Card>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Database size={48} color={theme.colors.primary} style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Decentralized</h3>
                    <p style={{ color: theme.colors.textSecondary }}>Data is stored on IPFS and logic runs on Ethereum. No central authority controls the outcome.</p>
                </div>
            </Card>
        </div>
    </section>
);

export const TechStackSection = () => (
    <section style={{ padding: '4rem 2rem', backgroundColor: theme.colors.white, textAlign: 'center' }}>
        <h2 style={{ marginBottom: '2rem', fontSize: theme.typography.h3, color: theme.colors.textSecondary }}>Powered By</h2>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '2rem', fontSize: '1.1rem', fontWeight: 600, color: theme.colors.primaryDark }}>
            <span>React</span>
            <span>Solidity</span>
            <span>Hardhat</span>
            <span>IPFS/Pinata</span>
            <span>Circom</span>
            <span>SnarkJS</span>
        </div>
    </section>
);
