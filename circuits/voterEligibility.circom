pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/merkleTree.circom";

template VoterEligibility(levels) {
    // Private Inputs
    signal input commitment;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public Inputs
    signal input merkleRoot; // The root of the eligibility tree
    signal input electionId; // Included in nullifier hash to bind vote to election
    signal input nullifierHash; // The unique identifier for this vote preventing double voting

    // 1. Verify that commitment is in the Merkle Tree
    component tree = MerkleTreeChecker(levels);
    tree.leaf <== commitment;
    tree.root <== merkleRoot;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    // 2. Compute Nullifier Hash
    // We want nullifierHash = Poseidon(nullifier, electionId)
    // This ensures that the same nullifier produces different hashes for different elections
    component hasher = Poseidon(2);
    hasher.inputs[0] <== nullifier;
    hasher.inputs[1] <== electionId;

    // 3. Constrain the output
    hasher.out === nullifierHash;
}

// Instantiate with depth 20 for standard usage
component main {public [merkleRoot, electionId, nullifierHash]} = VoterEligibility(20);
