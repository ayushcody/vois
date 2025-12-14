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

    const connect = async () => {
        if (window.ethereum) {
            try {
                // Request wallet_requestPermissions to force account selection
                await window.ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }]
                });
                
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                setProvider(browserProvider);
                
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            } catch (error) {
                throw error;
            }
        } else {
            throw new Error('No crypto wallet found');
        }
    };

    const disconnect = () => {
        setAccount(null);
        setProvider(null);
    };

    return { provider, account, connect, disconnect };
};
