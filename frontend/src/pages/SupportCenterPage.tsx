import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { theme } from '../styles/theme';
import { ShieldCheck, HelpCircle, Activity, MessageSquare, ChevronDown } from 'lucide-react';

type FaqCategoryKey = 'identity' | 'voting' | 'security';

interface FaqItem {
    id: string;
    category: FaqCategoryKey;
    question: string;
    answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        id: 'zkp-protects-identity',
        category: 'security',
        question: 'How does Zero-Knowledge Proof protect my identity?',
        answer:
            'Zero-Knowledge Proofs (ZKPs) let you prove that you are an eligible voter without revealing who you are. ' +
            'Your personal data is verified off-chain and reduced to cryptographic commitments, so only proofs and commitments are ever sent to the blockchain.',
    },
    {
        id: 'id-verification-fails',
        category: 'identity',
        question: 'What should I do if my ID verification fails?',
        answer:
            'First, double-check that your details match your government-issued ID exactly. If the issue persists, you can submit a support request through the secure form on this page, selecting "ID Issue" as the category.',
    },
    {
        id: 'multiple-votes',
        category: 'voting',
        question: 'Can I vote more than once in the same election?',
        answer:
            'No. EkMat uses nullifiers and Merkle proofs so that each eligibility proof can be used only once per election. ' +
            'If a second vote is attempted with the same credentials, the smart contract will reject the transaction.',
    },
    {
        id: 'verify-my-vote',
        category: 'voting',
        question: 'How can I verify that my vote was included?',
        answer:
            'After you cast a vote, you receive a transaction hash and an IPFS receipt CID. Both can be used to independently verify that your encrypted ballot is included in the election manifest without revealing who you voted for.',
    },
    {
        id: 'device-safety',
        category: 'security',
        question: 'Is it safe to vote from a personal or shared device?',
        answer:
            'For highest assurance, we recommend using a personal device you control and keeping your browser and wallet extensions up to date. ' +
            'Never enter private keys or seed phrases into websites or forms—EkMat never asks for them.',
    },
    {
        id: 'personal-data-storage',
        category: 'identity',
        question: 'Where is my personal identity data stored?',
        answer:
            'Identity attributes used for eligibility are processed by the EkMat backend and partner systems, then reduced into commitments for the ZK circuit. ' +
            'Raw identity data is not written to the public blockchain; only hashed or committed forms are kept for auditability.',
    },
];

const CATEGORY_LABELS: Record<FaqCategoryKey, string> = {
    identity: 'Identity & Verification',
    voting: 'Voting Process',
    security: 'Technical Security',
};

const SupportCenterPage: React.FC = () => {
    const [activeFaqId, setActiveFaqId] = useState<string | null>('zkp-protects-identity');
    const [activeCategory, setActiveCategory] = useState<FaqCategoryKey>('identity');

    const filteredFaqs = FAQ_ITEMS.filter((item) => item.category === activeCategory);

    const handleToggleFaq = (id: string) => {
        setActiveFaqId((prev) => (prev === id ? null : id));
    };

    const glassCardStyle: React.CSSProperties = {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: theme.borderRadius.lg,
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 20px 45px rgba(15,23,42,0.12)',
        backdropFilter: 'blur(16px)',
    };

    return (
        <Layout>
            <div className="page-header" style={{ textAlign: 'center' }}>
                <h1 className="page-header-title">Support Center</h1>
                <p className="page-header-subtitle">
                    Resources and assistance for the EkMat secure voting ecosystem.
                </p>
            </div>

            <div className="page-section">
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.1fr)',
                        gap: '1.75rem',
                    }}
                >
                    {/* Left: FAQ & help content */}
                    <div>
                        <Card style={glassCardStyle}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1.25rem',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.16em',
                                            color: theme.colors.gray500,
                                            marginBottom: '0.25rem',
                                        }}
                                    >
                                        Help & FAQs
                                    </div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '1.4rem',
                                            color: theme.colors.primaryDark,
                                        }}
                                    >
                                        Common questions from voters & admins
                                    </h2>
                                </div>
                                <ShieldCheck size={32} color={theme.colors.primary} />
                            </div>

                            {/* Category tabs */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem',
                                    marginBottom: '1.25rem',
                                }}
                            >
                                {(Object.keys(CATEGORY_LABELS) as FaqCategoryKey[]).map((key) => {
                                    const isActive = activeCategory === key;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setActiveCategory(key)}
                                            style={{
                                                borderRadius: '999px',
                                                border: `1px solid ${
                                                    isActive ? theme.colors.primary : theme.colors.gray200
                                                }`,
                                                backgroundColor: isActive
                                                    ? 'rgba(53,106,230,0.08)'
                                                    : theme.colors.white,
                                                color: isActive
                                                    ? theme.colors.primaryDark
                                                    : theme.colors.textSecondary,
                                                fontSize: '0.8rem',
                                                padding: '0.35rem 0.85rem',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {CATEGORY_LABELS[key]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* FAQ accordion */}
                            <div>
                                {filteredFaqs.map((item) => {
                                    const isOpen = activeFaqId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            style={{
                                                borderRadius: theme.borderRadius.md,
                                                border: `1px solid ${theme.colors.gray200}`,
                                                padding: '0.75rem 0.9rem',
                                                marginBottom: '0.6rem',
                                                backgroundColor: isOpen
                                                    ? 'rgba(248,250,252,0.9)'
                                                    : 'rgba(255,255,255,0.9)',
                                            }}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => handleToggleFaq(item.id)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    gap: '0.75rem',
                                                    width: '100%',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    padding: 0,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.6rem',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <HelpCircle
                                                        size={18}
                                                        color={theme.colors.primary}
                                                    />
                                                    <span
                                                        style={{
                                                            fontSize: '0.95rem',
                                                            fontWeight: 500,
                                                            color: theme.colors.text,
                                                        }}
                                                    >
                                                        {item.question}
                                                    </span>
                                                </div>
                                                <ChevronDown
                                                    size={16}
                                                    color={theme.colors.gray500}
                                                    style={{
                                                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.15s ease',
                                                    }}
                                                />
                                            </button>
                                            {isOpen && (
                                                <p
                                                    style={{
                                                        marginTop: '0.55rem',
                                                        marginBottom: 0,
                                                        fontSize: '0.9rem',
                                                        color: theme.colors.textSecondary,
                                                    }}
                                                >
                                                    {item.answer}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Secure communication form */}
                        <div style={{ marginTop: '1.5rem' }}>
                            <Card style={glassCardStyle}>
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.6rem',
                                        marginBottom: '1rem',
                                    }}
                                >
                                    <MessageSquare size={20} color={theme.colors.primary} />
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '1.1rem',
                                            color: theme.colors.primaryDark,
                                        }}
                                    >
                                        Contact support
                                    </h2>
                                </div>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        // For now we only prevent default; backend endpoint can be wired later.
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                                            gap: '1rem',
                                            marginBottom: '1rem',
                                        }}
                                    >
                                        <div>
                                            <label
                                                style={{
                                                    display: 'block',
                                                    fontSize: '0.85rem',
                                                    marginBottom: '0.3rem',
                                                    color: theme.colors.textSecondary,
                                                }}
                                            >
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Optional"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.6rem 0.7rem',
                                                    borderRadius: theme.borderRadius.md,
                                                    border: `1px solid ${theme.colors.gray300}`,
                                                    fontSize: '0.9rem',
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label
                                                style={{
                                                    display: 'block',
                                                    fontSize: '0.85rem',
                                                    marginBottom: '0.3rem',
                                                    color: theme.colors.textSecondary,
                                                }}
                                            >
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="you@example.org"
                                                style={{
                                                    width: '100%',
                                                    padding: '0.6rem 0.7rem',
                                                    borderRadius: theme.borderRadius.md,
                                                    border: `1px solid ${theme.colors.gray300}`,
                                                    fontSize: '0.9rem',
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div
                                        style={{
                                            marginBottom: '1rem',
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: 'block',
                                                fontSize: '0.85rem',
                                                marginBottom: '0.3rem',
                                                color: theme.colors.textSecondary,
                                            }}
                                        >
                                            Category
                                        </label>
                                        <select
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem 0.7rem',
                                                borderRadius: theme.borderRadius.md,
                                                border: `1px solid ${theme.colors.gray300}`,
                                                fontSize: '0.9rem',
                                            }}
                                            defaultValue="general"
                                        >
                                            <option value="bug">Bug Report</option>
                                            <option value="id">ID Issue</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="fraud">Fraud Report</option>
                                        </select>
                                    </div>

                                    <div
                                        style={{
                                            marginBottom: '1.1rem',
                                        }}
                                    >
                                        <label
                                            style={{
                                                display: 'block',
                                                fontSize: '0.85rem',
                                                marginBottom: '0.3rem',
                                                color: theme.colors.textSecondary,
                                            }}
                                        >
                                            Message
                                        </label>
                                        <textarea
                                            rows={4}
                                            style={{
                                                width: '100%',
                                                padding: '0.6rem 0.7rem',
                                                borderRadius: theme.borderRadius.md,
                                                border: `1px solid ${theme.colors.gray300}`,
                                                fontSize: '0.9rem',
                                                resize: 'vertical',
                                            }}
                                            placeholder="Describe your issue with as much detail as possible, but never include secrets or private keys."
                                        />
                                    </div>

                                    <div
                                        style={{
                                            marginBottom: '1.1rem',
                                            padding: '0.75rem 0.85rem',
                                            borderRadius: theme.borderRadius.md,
                                            backgroundColor: '#FEF3C7',
                                            border: '1px solid #FBBF24',
                                            fontSize: '0.8rem',
                                            color: '#92400E',
                                        }}
                                    >
                                        <strong>SECURITY ADVISORY:</strong> Never share your wallet&apos;s
                                        private key, seed phrase, or ZKP nullifiers with anyone, including our
                                        support team.
                                    </div>

                                    <Button type="submit" variant="primary">
                                        Submit request
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </div>

                    {/* Right: status & contact info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <Card style={glassCardStyle}>
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '1rem',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.14em',
                                            color: theme.colors.gray500,
                                            marginBottom: '0.2rem',
                                        }}
                                    >
                                        System Health
                                    </div>
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: '1.15rem',
                                            color: theme.colors.primaryDark,
                                        }}
                                    >
                                        Network Status
                                    </h2>
                                </div>
                                <Activity size={24} color={theme.colors.primary} />
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    marginBottom: '0.9rem',
                                }}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '999px',
                                        backgroundColor: theme.colors.success,
                                        boxShadow: '0 0 0 4px rgba(16,185,129,0.35)',
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: theme.colors.success,
                                    }}
                                >
                                    All systems operational
                                </span>
                            </div>

                            <ul
                                style={{
                                    listStyle: 'none',
                                    padding: 0,
                                    margin: 0,
                                    fontSize: '0.85rem',
                                    color: theme.colors.textSecondary,
                                }}
                            >
                                <li style={{ marginBottom: '0.35rem' }}>
                                    <strong>Blockchain:</strong> Connected (Sepolia Testnet)
                                </li>
                                <li style={{ marginBottom: '0.35rem' }}>
                                    <strong>IPFS Gateway:</strong> Online
                                </li>
                                <li style={{ marginBottom: '0.35rem' }}>
                                    <strong>ZKP Verifier:</strong> Ready
                                </li>
                            </ul>

                            <div
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.5rem 0.65rem',
                                    borderRadius: '999px',
                                    backgroundColor: 'rgba(53,106,230,0.06)',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    fontSize: '0.75rem',
                                    color: theme.colors.primaryDark,
                                }}
                            >
                                <ShieldCheck size={14} color={theme.colors.primary} />
                                <span>End-to-End Verifiable</span>
                            </div>
                        </Card>

                        <Card style={glassCardStyle}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    marginBottom: '0.85rem',
                                }}
                            >
                                <HelpCircle size={18} color={theme.colors.primary} />
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: '1rem',
                                        color: theme.colors.primaryDark,
                                    }}
                                >
                                    Quick help
                                </h3>
                            </div>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: '0.85rem',
                                    color: theme.colors.textSecondary,
                                }}
                            >
                                For urgent issues impacting an active election, contact your election
                                administrator through the official offline channels in addition to filing a
                                report here.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SupportCenterPage;


