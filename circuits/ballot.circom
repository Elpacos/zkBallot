pragma circom 2.0.0;

include "node_modules/circomlib/circuits/poseidon.circom";
include "merkleTree.circom";
// computes Poseidon(nullifier + secret)
template CommitmentHasher() {
    signal input nullifier;
    signal input secret;
    signal output commitment;
    signal output nullifierHash;
    component commitmentHasher = Poseidon(2);
    component nullifierHasher = Poseidon(1);

    nullifierHasher.inputs[0] <== nullifier;
    commitmentHasher.inputs[0] <== nullifier;
    commitmentHasher.inputs[1] <== secret;
    
    commitment <== commitmentHasher.out;
    nullifierHash <== nullifierHasher.out;
}
// Verifies that a commitment that corresponds to given a secret and nullifier is included in the merkle tree of deposits
template CastVote(levels) {
    signal input nullifierHash;
    signal input top;
    signal input nullifier;
    signal input secret;
    signal input pathElements[levels];
    signal input pathIndices[levels];

    component hasher = CommitmentHasher();
    hasher.nullifier <== nullifier;
    hasher.secret <== secret;
    hasher.nullifierHash === nullifierHash;

    component tree = MerkleTreeChecker(levels);
    tree.leaf <== hasher.commitment;
    tree.root <== top;
    for (var i = 0; i < levels; i++) {
        tree.pathElements[i] <== pathElements[i];
        tree.pathIndices[i] <== pathIndices[i];
    }
}
//Tree depth is 15
component main {public [nullifierHash]} = CastVote(15);