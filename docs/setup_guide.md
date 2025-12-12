# EkMat Setup & Run Guide

This guide details how to set up the environment, run the full stack (Blockchain, Backend, Frontend), and clean up the project for sharing.

---

## 🚀 How to Run the Program

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Metamask** installed in your browser.

### 2. Installation
You need to install dependencies for the root, frontend, and backend.

```bash
# 1. Root dependencies (Hardhat, Contracts)
npm install

# 2. Frontend dependencies
cd frontend
npm install
cd ..

# 3. Backend dependencies
cd backend
npm install
cd ..
```

### 3. Start the Local Blockchain
Run a local Hardhat node. This simulates Ethereum on your machine.

```bash
# Terminal 1
npx hardhat node
```
*Keep this terminal running.*

### 4. Deploy Smart Contracts
Deploy the contracts to your local network.

```bash
# Terminal 2
npx hardhat run scripts/deploy/deploy.ts --network localhost
```
*Note the deployed addresses (especially `EkMatVoting`). If they change, update `frontend/src/utils/constants.ts`.*

### 5. Start the Backend
The backend handles ZK Proof generation (optional for pure client-side demo) and IPFS pinning.

```bash
# Terminal 2 (after deployment)
cd backend
npm run dev
```
*Server runs on http://localhost:3000*

### 6. Start the Frontend
The user interface.

```bash
# Terminal 3
cd frontend
npm run dev
```
*App runs on http://localhost:5173*

### 7. Connect & Play
1.  Open [http://localhost:5173](http://localhost:5173).
2.  Open Metamask and switch network to **Localhost 8545**.
3.  Import a test account from the "Start the Local Blockchain" terminal (use one of the private keys provided).
4.  Connect Wallet and start voting!

---

## 🧹 Making Code Lighter for Sharing

To share the code (e.g., via GitHub or Zip file), you should **DELETE** the generated folders. These can be massive (hundreds of MBs). They can be easily re-created by running `npm install` and `npm run build`.

### ❌ Safe to Delete
Delete these folders from **Root**, **Frontend**, and **Backend**:

1.  **`node_modules/`**: Contains all installed libraries. (Heaviest folder)
2.  **`dist/`** or **`build/`**: Compiled production code.
3.  **`artifacts/`**: Compiled smart contract JSONs.
4.  **`cache/`**: Hardhat cache.
5.  **`typechain-types/`**: Generated TypeScript types for contracts.
6.  **`coverage/`**: Test coverage reports (if any).
7.  **`.env`**: **WARNING** - Only delete this if it contains real secrets. For a hackathon project with dummy keys, you might want to share `.env.example`.

### ⚡ Command to Clean
You can run this command in the root directory to clean everything at once (Mac/Linux):

```bash
# Be careful! This deletes all list folders recursively.
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name "artifacts" -type d -prune -exec rm -rf '{}' +
find . -name "cache" -type d -prune -exec rm -rf '{}' +
find . -name "typechain-types" -type d -prune -exec rm -rf '{}' +
```

### 📥 How to Restore (After downloading shared code)
1.  `npm install` (Root)
2.  `cd frontend && npm install`
3.  `cd backend && npm install`
4.  `npx hardhat compile`
