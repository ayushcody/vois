// In-memory analytics store
interface AnalyticsData {
    failedZkpGenerations: number;
    failedOnChainVerifications: number; // This would need to be fed by logs or a cron job monitoring the contract
    suspiciousIPs: Record<string, number>;
}

const analytics: AnalyticsData = {
    failedZkpGenerations: 0,
    failedOnChainVerifications: 0,
    suspiciousIPs: {}
};

export const trackFailedZkp = (ip: string) => {
    analytics.failedZkpGenerations++;
    if (!analytics.suspiciousIPs[ip]) {
        analytics.suspiciousIPs[ip] = 0;
    }
    analytics.suspiciousIPs[ip]++;
};

export const trackFailedVerification = () => {
    analytics.failedOnChainVerifications++;
};

export const getStats = () => {
    return {
        ...analytics,
        timestamp: new Date().toISOString()
    };
};
