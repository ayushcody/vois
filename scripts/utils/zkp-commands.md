# Zero Knowledge Proof Commands

## Prerequisites
- `circom` installed (Rust version recommended).
- `snarkjs` installed globally or locally.

## Compilation & Key Generation

```bash
# 1. Compile Circuit
circom circuits/voterEligibility.circom --r1cs --wasm --sym --c -o circuits/

# 2. Download Powers of Tau (if not exists)
# Downloads a ptau file for 12k constraints (verify size needed based on circuit)
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau -O circuits/pot14_final.ptau

# 3. Groth16 Setup
snarkjs groth16 setup circuits/voterEligibility.r1cs circuits/pot14_final.ptau circuits/voterEligibility_0000.zkey

# 4. Contribute Phase 2 (ZKey)
# In production, this should be a random contribution
snarkjs zkey contribute circuits/voterEligibility_0000.zkey circuits/voterEligibility_final.zkey --name="1st Contributor Name" -v -e="random text"

# 5. Export Verification Key
snarkjs zkey export verificationkey circuits/voterEligibility_final.zkey circuits/verification_key.json

# 6. Export Solidity Verifier
snarkjs zkey export solidityverifier circuits/voterEligibility_final.zkey contracts/core/Verifier.sol
```

## Running the provided script
We have bundled these steps into `scripts/utils/compile_circuits.sh`.
Make sure you are in the project root:
```bash
chmod +x scripts/utils/compile_circuits.sh
./scripts/utils/compile_circuits.sh
```
