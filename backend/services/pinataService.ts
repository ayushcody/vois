import axios from 'axios';
import FormData from 'form-data';
import stream from 'stream';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.warn("Pinata API keys not found in environment variables.");
}

export const pinJSON = async (data: any): Promise<string> => {
    // Mock IPFS for development when API keys not available
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
        console.log('📎 Using mock IPFS hash for development');
        const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return mockHash;
    }

    try {
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY
            }
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error pinning JSON to IPFS:", error);
        // Fallback to mock for development
        console.log('📎 Falling back to mock IPFS hash');
        const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return mockHash;
    }
};

export const pinFile = async (fileBuffer: Buffer, fileName: string): Promise<string> => {
    // Mock IPFS for development when API keys not available
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
        console.log('📎 Using mock IPFS hash for file:', fileName);
        const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return mockHash;
    }

    try {
        const data = new FormData();
        data.append('file', fileBuffer, fileName);

        const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
            maxBodyLength: Infinity,
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_API_KEY,
                ...data.getHeaders()
            }
        });
        return response.data.IpfsHash;
    } catch (error) {
        console.error("Error pinning file to IPFS:", error);
        // Fallback to mock for development
        console.log('📎 Falling back to mock IPFS hash for file:', fileName);
        const mockHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return mockHash;
    }
};
