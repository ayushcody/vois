import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const useProvider = () => {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    useEffect(() => {
        const initProvider = async () => {
            if (window.ethereum) {
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(browserProvider);
                try {
                    const accounts = await browserProvider.listAccounts();
                    if (accounts.length > 0) {
                        setAccount(accounts[0].address);
                    }
                } catch (e) {
                    console.error("Failed to get accounts", e);
                }
            }
        };
        initProvider();
    }, []);

    return { provider, account };
};
