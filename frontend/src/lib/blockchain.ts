
export const connectWallet = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({ method: 'eth_requestAccounts' });
};

export const generateCommitment = async (input: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return '0x' + hashHex; // Mimic a hex string for commitment
};
