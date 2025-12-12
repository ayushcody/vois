export const shortenAddress = (address: string): string => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
    // Simple formatter, reliable libraries like ethers.formatUnits should be preferred in apps
    const divisor = BigInt(10 ** decimals);
    const integerPart = amount / divisor;
    return integerPart.toString();
};
