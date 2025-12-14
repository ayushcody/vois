#!/bin/bash

# EkMat ZK Circuit Setup Script
set -e

echo "🔧 Setting up ZK circuits for EkMat..."

# Create circuits build directory
mkdir -p circuits/build

# Install circom if not present
if ! command -v circom &> /dev/null; then
    echo "Installing circom..."
    npm install -g circom
fi

# Compile circuit
echo "📦 Compiling voterEligibility circuit..."
circom circuits/voterEligibility.circom --r1cs --wasm --sym -o circuits/build

# Download Powers of Tau (for demo - use smaller ceremony for production)
echo "⬇️ Downloading Powers of Tau..."
wget -nc https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_15.ptau -O circuits/build/pot15_final.ptau

# Generate zkey
echo "🔑 Generating proving key..."
snarkjs groth16 setup circuits/build/voterEligibility.r1cs circuits/build/pot15_final.ptau circuits/build/voterEligibility_0000.zkey

# Contribute to ceremony (automated for demo)
echo "🎲 Contributing to ceremony..."
echo "ekmat-demo-contribution" | snarkjs zkey contribute circuits/build/voterEligibility_0000.zkey circuits/build/voterEligibility_final.zkey --name="EkMat Demo"

# Export verification key
echo "📤 Exporting verification key..."
snarkjs zkey export verificationkey circuits/build/voterEligibility_final.zkey circuits/build/verification_key.json

# Generate Solidity verifier
echo "📝 Generating Solidity verifier..."
snarkjs zkey export solidityverifier circuits/build/voterEligibility_final.zkey contracts/core/Verifier.sol

echo "✅ ZK circuit setup complete!"