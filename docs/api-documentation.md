# API Documentation

The EkMat backend facilitates off-chain computations (ZKP), file storage (IPFS), and analytics.

Base URL: `http://localhost:3001/api`

## Authentication

### `POST /auth/verify-id`
Verifies a government ID against the mock database using an OTP.

**Request Body:**
```json
{
  "idNumber": "ABC1234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Identity Verified"
}
```

## Zero-Knowledge Proofs

### `POST /zkp/generate`
Generates a ZK proof for voter eligibility.

**Request Body:**
```json
{
  "commitment": "0x123...",
  "nullifier": "0xabc...",
  "merkleRoot": "0x789...",
  "pathElements": [...],
  "pathIndices": [...]
}
```

**Response:**
```json
{
  "success": true,
  "proof": "0x...",
  "publicSignals": [...]
}
```

## IPFS (Storage)

### `POST /ipfs/json`
Pins a JSON object to IPFS via Pinata.

**Request Body:**
```json
{
  "electionId": 1,
  "candidateId": 2,
  "txHash": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "ipfsHash": "Qm..."
}
```

### `POST /ipfs/file`
Uploads a file (image, document) to IPFS.

**Request Body:** `FormData` with key `file`.

**Response:**
```json
{
  "success": true,
  "ipfsHash": "Qm..."
}
```

## Analytics

### `GET /analytics/fraud`
Retrieves fraud detection statistics.

**Response:**
```json
{
  "failedZKProofs": 5,
  "failedOnChainVerifications": 2,
  "suspiciousIPs": 12
}
```
