import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useProvider } from './useProvider';

export const useContract = (address: string, abi: any, signerOrProvider?: any) => {
    const { provider, account } = useProvider();
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        const initContract = async () => {
            if (!address || !abi) return;

            let effectiveSignerOrProvider = signerOrProvider;

            if (!effectiveSignerOrProvider && provider) {
                try {
                    // If account is connected, get signer for transactions
                    if (account) {
                        effectiveSignerOrProvider = await provider.getSigner();
                    } else {
                        // Otherwise use provider for read-only
                        effectiveSignerOrProvider = provider;
                    }
                } catch (e) {
                    console.error("Failed to get signer:", e);
                    // Fallback to provider if signer fails
                    effectiveSignerOrProvider = provider;
                }
            }

            if (effectiveSignerOrProvider) {
                const newContract = new ethers.Contract(address, abi, effectiveSignerOrProvider);
                setContract(newContract);
                console.log("Contract initialized:", address, "with signer:", !!account);
            }
        };

        initContract();
    }, [address, abi, signerOrProvider, provider, account]); // Added account dependency

    return contract;
};
