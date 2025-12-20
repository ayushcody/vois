import React, { useRef } from 'react';
import { HeroSection, HowItWorksSection, USPsSection, TechStackSection } from '../components/landing/LandingComponents';
import { Layout } from '../components/Layout';

const LandingPage: React.FC = () => {
    const howItWorksRef = useRef<HTMLDivElement | null>(null);

    const handleGetStartedClick = () => {
        if (howItWorksRef.current) {
            howItWorksRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <Layout>
            <HeroSection onGetStarted={handleGetStartedClick} />
            <div className="page-section" ref={howItWorksRef}>
                <HowItWorksSection />
            </div>
            <div className="page-section">
                <USPsSection />
            </div>
            <div className="page-section">
                <TechStackSection />
            </div>
        </Layout>
    );
};

export default LandingPage;
