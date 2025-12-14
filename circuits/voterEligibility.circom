pragma circom 2.0.0;

template Poseidon(nInputs) {
    signal input inputs[nInputs];
    signal output out;
    
    // Simplified mock Poseidon for development
    var sum = 0;
    for (var i = 0; i < nInputs; i++) {
        sum += inputs[i];
    }
    out <== sum;
}

template MerkleTreeChecker(levels) {
    signal input leaf;
    signal input root;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    
    // Simplified mock Merkle verification for development
    component hasher = Poseidon(2);
    hasher.inputs[0] <== leaf;
    hasher.inputs[1] <== pathElements[0];
    
    root === hasher.out;
}

template VoterEligibility(levels) {
    // Private Inputs
    signal input commitment;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    // Public Inputs
    signal input merkleRoot;
    signal input electionId;
    signal input nullifierHash;

    // 1. Verify that commitment is in the Merkle Tree
    component tree = MerkleTreeChecker(levels);
    tree.leaf <== commitment;
    tree.root <== merkleRoot;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }

    // 2. Compute Nullifier Hash
    component hasher = Poseidon(2);
    hasher.inputs[0] <== nullifier;
    hasher.inputs[1] <== electionId;

    // 3. Constrain the output
    hasher.out === nullifierHash;
}

component main {public [merkleRoot, electionId, nullifierHash]} = VoterEligibility(20);