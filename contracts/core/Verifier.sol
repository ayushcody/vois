// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @notice Interface for zkSNARK verifier (Groth16).
interface IVerifier {
    function verifyProof(
        bytes calldata proof,
        uint256[] calldata pubSignals
    ) external view returns (bool);
}

/// @notice Placeholder verifier for local testing and demo.
///         In production, replace this with the SnarkJS-generated verifier.
contract Verifier is IVerifier {
    function verifyProof(
        bytes calldata,      // proof
        uint256[] calldata   // pubSignals
    ) external pure override returns (bool) {
        // Always true for now. DO NOT USE in real deployment.
        return true;
    }
}