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

                // Listen for account changes
                window.ethereum.on('accountsChanged', (accounts: string[]) => {
                    if (accounts.length > 0) {
                        setAccount(accounts[0]);
                    } else {
                        setAccount(null);
                    }
                });

                // Listen for chain changes
                window.ethereum.on('chainChanged', () => {
                    window.location.reload();
                });
            }
        };
        initProvider();

        // Cleanup listeners
        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', () => { });
                window.ethereum.removeListener('chainChanged', () => { });
            }
        };
    }, []);

    return { provider, account };
};

