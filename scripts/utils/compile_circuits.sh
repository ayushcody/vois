#!/bin/bash
set -e

# Config
CIRCUIT_NAME="voterEligibility"
BUILD_DIR="circuits/build"
PTAU_PATH="circuits/pot14_final.ptau"

mkdir -p $BUILD_DIR

echo "Compiling circuit..."
circom circuits/$CIRCUIT_NAME.circom --r1cs --wasm --sym -o $BUILD_DIR

if [ ! -f "$PTAU_PATH" ]; then
    echo "Downloading Powers of Tau..."
    curl -L https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau -o $PTAU_PATH
fi

echo "Generating zKey..."
npx snarkjs groth16 setup $BUILD_DIR/$CIRCUIT_NAME.r1cs $PTAU_PATH $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey

echo "Contributing to phase 2..."
# Non-interactive contribution for dev
npx snarkjs zkey contribute $BUILD_DIR/${CIRCUIT_NAME}_0000.zkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey --name="Dev Setup" -v -e="random entropy"

echo "Exporting verification key..."
npx snarkjs zkey export verificationkey $BUILD_DIR/${CIRCUIT_NAME}_final.zkey $BUILD_DIR/verification_key.json

echo "Exporting Solidity verifier..."
npx snarkjs zkey export solidityverifier $BUILD_DIR/${CIRCUIT_NAME}_final.zkey contracts/core/Verifier.sol

echo "Done! Verifier.sol updated and keys generated in $BUILD_DIR"
