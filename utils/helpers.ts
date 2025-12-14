export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const isEthereumAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};
