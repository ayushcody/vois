# EkMat Roadmap

Our vision for the future of decentralized, private voting.

## Phase 1: Foundation (Current)
- [x] Basic Smart Contracts (Voting, Admin Roles)
- [x] ZK Proof Concept (Groth16)
- [x] Voter Registration & Identity Verification
- [x] Basic Admin Dashboard
- [x] Results Visualization

## Phase 2: Enhanced Privacy & Scalability
- [ ] **PLONK / STARKs Migration**: Move away from Groth16 to remove the need for a trusted setup per circuit.
- [ ] **Relayer Network**: implement gasless voting where a relayer submits the vote, decoupling the voter's wallet address from the transaction completely.
- [ ] **Batch Processing**: Use ZK-Rollups to aggregate votes before submitting to L1 to reduce gas costs.

## Phase 3: Advanced Voting Features
- [ ] **Ranked-Choice Voting**: Support for complex ballot types beyond simple "first-past-the-post".
- [ ] **Delegated Voting (Liquid Democracy)**: Allow voters to delegate their voting power to trusted representatives securely.
- [ ] **Multi-Language Support**: Localization for Hindi, Spanish, and other regional languages.

## Phase 4: Platform Expansion
- [ ] **Mobile Application**: Native iOS/Android apps with biometric hardware integration (FaceID/TouchID).
- [ ] **Decentralized ID (DID) Integration**: Support Polygon ID or WorldID for sybil resistance.
- [ ] **Cross-Chain Voting**: Enable voting from other EVM chains (Polygon, Arbitrum).
