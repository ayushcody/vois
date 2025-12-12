import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useProvider } from './useProvider';

export const useContract = (address: string, abi: any, signerOrProvider?: any) => {
    const { provider } = useProvider();
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    useEffect(() => {
        const initContract = async () => {
            if (!address || !abi) return;

            let effectiveSignerOrProvider = signerOrProvider;

            if (!effectiveSignerOrProvider && provider) {
                try {
                    effectiveSignerOrProvider = await provider.getSigner();
                } catch (e) {
                    // Fallback to provider if signer fails (e.g. not connected)
                    effectiveSignerOrProvider = provider;
                }
            }

            if (effectiveSignerOrProvider) {
                setContract(new ethers.Contract(address, abi, effectiveSignerOrProvider));
            }
        };

        initContract();
    }, [address, abi, signerOrProvider, provider]);

    return contract;
};
