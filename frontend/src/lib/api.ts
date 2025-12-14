export const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
    auth: {
        verifyId: (idNumber: string, otp: string) =>
            fetch(`${API_BASE_URL}/auth/verify-id`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idNumber, otp }),
            }).then(res => res.json()),
    },
    ipfs: {
        uploadJSON: (data: any) =>
            fetch(`${API_BASE_URL}/ipfs/json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(res => res.json()),

        uploadFile: (formData: FormData) =>
            fetch(`${API_BASE_URL}/ipfs/file`, {
                method: 'POST',
                body: formData, // Content-Type header let browser set it
            }).then(res => res.json()),
    },
    zkp: {
        generate: (input: any) =>
            fetch(`${API_BASE_URL}/zkp/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            }).then(res => res.json()),
    },
    analytics: {
        getFraudStats: () =>
            fetch(`${API_BASE_URL}/analytics/fraud`).then(res => res.json()),
    }
};
