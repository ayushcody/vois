# User Guide

Welcome to EkMat. This guide will help you navigate the voting process.

## For Voters

### 1. Register
1.  Navigate to the **Register** page from the home screen.
2.  **Verify Identity**: Enter your Government ID Number. For this demo, check your SMS (or use the mock OTP `123456`).
3.  **Biometrics**: Click "Capture Biometrics". The system will generate a secure commitment.
4.  **Confirm**: Generate your Privacy Proof. This is a "Zero-Knowledge Proof" that lets you vote later without revealing who you are.

### 2. Cast Your Vote
1.  Go to the **Vote** page.
2.  If your wallet is not connected, click "Connect Wallet" in the top right.
3.  Select the active election from the dropdown.
4.  Browse the candidates. You can view their profiles and manifestos.
5.  Click **Vote** on your chosen candidate.
6.  Confirm the transaction in your wallet.
7.  Save your **Vote Receipt** (IPFS CID) if you wish to verify it later.

## For Admins

### Setting Up an Election
1.  Go to the **Admin Dashboard** (`/admin`).
2.  **Create Election**: In the Elections tab, enter a name (e.g., "General Election 2025") and click Create.
3.  **Add Candidates**: Switch to the Candidates tab. Select the Election ID. Enter name, party, and upload a photo.
4.  **Open Voting**: Go back to Elections and ensure the status is "Active".

### Monitoring
-   Use the **Analytics** tab to watch for suspicious activity.
-   Use the **System Status** tab to check network health.

## For Observers / Auditors

### Verifying the Election
1.  Go to the **Audit** page (`/audit`).
2.  This page displays a live feed of events from the blockchain.
3.  **VoteCast Events**: Verify that votes are coming in. You can click the "TX Hash" to see the raw transaction on Etherscan.
4.  **Results**: Go to the **Results** page (`/results`) to see the current tally. This is computed directly from the smart contract state.

## FAQ / Troubleshooting

**Q: I clicked Vote but nothing happened.**
A: Ensure your Metamask wallet is connected and you have enough test ETH (Sepolia/Localhost) for gas fees.

**Q: Example ZKP generation is taking too long.**
A: Generating a proof happens in your browser. On slower devices, this might take 5-10 seconds. Please be patient.

**Q: "User already voted" error?**
A: Double-voting is strictly prevented. If you reset the local chain, you may need to clear your browser's local storage (Application -> Local Storage -> Clear) to reset your registration state.
