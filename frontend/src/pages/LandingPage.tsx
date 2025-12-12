import React from 'react';
import { HeroSection, HowItWorksSection, USPsSection, TechStackSection } from '../components/landing/LandingComponents';
import { Layout } from '../components/Layout';

const LandingPage: React.FC = () => {
    return (
        <Layout>
            <HeroSection />
            <div className="page-section">
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
