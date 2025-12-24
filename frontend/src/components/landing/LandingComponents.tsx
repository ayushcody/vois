import { Button } from '../common/Button';
import { theme } from '../../styles/theme';
import { Shield, Activity, Database } from 'lucide-react';
import { Card } from '../common/Card';

interface HeroSectionProps {
    onGetStarted?: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => (
    <section className="landing-hero">
        <div className="landing-hero-inner">
            <div className="landing-hero-badge">
                <span className="landing-hero-badge-dot" />
                <span className="landing-hero-badge-text">Mainnet Ready</span>
            </div>

            <h1 className="landing-hero-title">EkMat</h1>
            <p className="landing-hero-subtitle">
                Secure, verifiable and privacy-preserving elections on blockchain.
            </p>

            <div className="landing-hero-actions">
                <Button
                    size="lg"
                    variant="primary"
                    style={{
                        boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.35), 0 18px 45px rgba(37, 99, 235, 0.35)',
                    }}
                    onClick={onGetStarted}
                >
                    Get Started
                </Button>
            </div>
        </div>
    </section>
);

export const HowItWorksSection = () => (
    <section className="landing-section landing-section-light">
        <h2 className="landing-section-title">How It Works</h2>
        <div className="how-it-steps">
            {[
                { step: 1, title: 'Verify ID', desc: 'Government issued identity verification' },
                { step: 2, title: 'Prove Eligibility', desc: 'Generate Zero-Knowledge Proof' },
                { step: 3, title: 'Vote Anonymously', desc: 'Cast your vote on-chain' },
                { step: 4, title: 'Verify Vote', desc: 'Check via Manifest & Merkle Root' },
            ].map((item) => (
                <div key={item.step} className="how-it-step">
                    <div className="how-it-circle">
                        <span>{item.step}</span>
                    </div>
                    <h3 className="how-it-title">{item.title}</h3>
                    <p className="how-it-desc">{item.desc}</p>
                </div>
            ))}
        </div>
    </section>
);

export const USPsSection = () => (
    <section className="landing-section landing-section-muted">
        <h2 className="landing-section-title">Why EkMat?</h2>
        <div className="usp-grid">
            <Card className="usp-card">
                <div className="usp-card-inner">
                    <div className="usp-icon">
                        <Shield size={32} color={theme.colors.primary} />
                    </div>
                    <h3 className="usp-title">Privacy First</h3>
                    <p className="usp-desc">
                        Uses Zero-Knowledge Proofs (zk-SNARKs) to ensure your vote remains anonymous while being
                        mathematically verifiable.
                    </p>
                </div>
            </Card>
            <Card className="usp-card">
                <div className="usp-card-inner">
                    <div className="usp-icon">
                        <Activity size={32} color={theme.colors.primary} />
                    </div>
                    <h3 className="usp-title">Auditable End-to-End</h3>
                    <p className="usp-desc">
                        Every election artifact is traceable – manifests, tallies and proofs live on-chain or on IPFS for
                        independent verification.
                    </p>
                </div>
            </Card>
            <Card className="usp-card">
                <div className="usp-card-inner">
                    <div className="usp-icon">
                        <Database size={32} color={theme.colors.primary} />
                    </div>
                    <h3 className="usp-title">Institutional-Grade Infrastructure</h3>
                    <p className="usp-desc">
                        Smart contracts and distributed storage handle core vote logic and data, eliminating single points
                        of failure.
                    </p>
                </div>
            </Card>
        </div>
    </section>
);

export const TechStackSection = () => (
    <section className="landing-section landing-powered-by">
        <div className="powered-by-label">Powered by</div>
        <div className="powered-by-items">
            <span>Ethereum</span>
            <span>IPFS</span>
            <span>Circom</span>
        </div>
    </section>
);
