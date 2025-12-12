# EkMat - Zero-Knowledge Blockchain Voting Platform

EkMat is a privacy-first e-voting system Pilot built on Ethereum. It uses **Zero-Knowledge Proofs (ZKPs)** to allow voters to prove they are eligible to vote *without* revealing their identity on the blockchain.

## 🏗 System Architecture (How it Works)
This project uses a modern web3 stack. Here is why we use each tool:

### 1. The Blockchain Layer
- **Ganache**: The **Local Blockchain Network**. Think of this as our private "server" where the election data lives during development.
- **Hardhat**: The **Development Toolbelt**. We use Hardhat to *compile* our Solidity code and *deploy* it to Ganache. We do **not** use the Hardhat Network for running the chain, only for compiling.
- **Solidity Contracts**: The "Brain". Handles vote counting, double-voting prevention, and election management.

### 2. The Privacy Layer (ZK-SNARKs)
- **Circom**: Used to write the cryptographic "Circuit" that defines the rules of a valid vote.
- **SnarkJS**: runs in the browser to generate the "Eligible Voter Proof" locally on the user's device.

### 3. The Application Layer
- **Frontend (React + Vite)**: Where voters connect wallets and cast votes.
- **Backend (Express)**: Acts as a relay and storage for off-chain metadata (like candidate photos via IPFS).

## 📂 Project Structure
Access the code in these workspaces:
- `contracts/`: Smart contracts (`EkMatVoting.sol`) and tests.
- `circuits/`: ZK Circuit definitions (`.circom`).
- `frontend/`: React voter portal and Admin dashboard.
- `backend/`: Node.js API database and auth services.

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Local Blockchain
This starts **Ganache**, a persistent blockchain that mimics Ethereum on your machine.
```bash
npm run chain
```
*Keep this terminal running! It listens on port 8545.*

### Step 3: Deploy Smart Contracts
This uses **Hardhat** to compile the contracts and send them to your running Ganache chain.
```bash
npm run deploy:ganache
```

### Step 4: Start the App
Open two new terminals for the app services:

**Start Backend:**
```bash
npm run dev:backend
```

**Start Frontend:**
```bash
npm run dev:frontend
```

## 🖥 Usage
- **Voter Portal**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5173/admin

## 🛠 Technology Stack
- **Languages**: TypeScript, Solidity, Circom
- **Frameworks**: React, Express, Hardhat
- **Tools**: Ganache (Chain), SnarkJS (Proof), Winston (Logs)
