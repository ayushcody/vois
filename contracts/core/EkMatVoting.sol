// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AdminRoles.sol";
import "./Verifier.sol";

/// @title EkMatVoting
/// @notice ZK-enabled voting contract for EkMat.
///         - One-voter-one-vote via nullifier
///         - Eligibility bound to a Merkle root
///         - Results aggregated on-chain
contract EkMatVoting is AdminRoles {
    // -----------
    // Errors
    // -----------

    error ElectionAlreadyExists();
    error ElectionNotFound();
    error InvalidTimeRange();
    error ElectionNotActive();
    error ElectionNotStarted();
    error ElectionEnded();
    error ElectionAlreadyStarted();
    error MerkleRootMismatch();
    error NullifierAlreadyUsed();
    error CandidateNotFound();
    error CandidateAlreadyExists();
    error InvalidProof();
    error VerifierAddressZero();

    // -----------
    // Structs
    // -----------

    struct Election {
        string id;           // human-readable id: "mit-2025-president"
        string name;
        uint64 startTime;
        uint64 endTime;
        bytes32 merkleRoot;  // merkle root of eligible commitments/nullifiers
        string manifestCid;  // IPFS CID for manifest
        bool active;
        bool exists;
    }

    struct Candidate {
        string id;       // candidate slug/id
        string name;
        string ipfsCid;  // IPFS CID for candidate profile
        uint256 voteCount;
    }

    // -----------
    // State
    // -----------

    // electionId => Election
    mapping(string => Election) private _elections;

    // electionId => Candidate[]
    mapping(string => Candidate[]) private _candidates;

    // electionId => hash(candidateId) => index+1
    mapping(string => mapping(bytes32 => uint256)) private _candidateIndexById;

    // hash(electionId, nullifier) => used?
    mapping(bytes32 => bool) private _usedNullifiers;

    // list of electionIds for enumeration
    string[] private _electionIds;

    // zkSNARK verifier
    IVerifier public verifier;

    // -----------
    // Events
    // -----------

    event ElectionCreated(
        string indexed electionId,
        string name,
        uint256 startTime,
        uint256 endTime,
        bytes32 merkleRoot,
        string manifestCid
    );

    event CandidateAdded(
        string indexed electionId,
        string candidateId,
        string name,
        string ipfsCid
    );

    event ElectionToggled(string indexed electionId, bool active);

    event VerifierUpdated(address indexed newVerifier);

    event VoteCast(
        string indexed electionId,
        string candidateId,
        bytes32 nullifier,
        string cid  // IPFS CID for anonymized vote receipt
    );

    // -----------
    // Constructor
    // -----------

    constructor(address verifierAddress) {
        if (verifierAddress == address(0)) revert VerifierAddressZero();
        verifier = IVerifier(verifierAddress);
        emit VerifierUpdated(verifierAddress);
    }

    // -----------
    // Admin functions
    // -----------

    /// @notice Create a new election.
    function createElection(
        string calldata electionId,
        string calldata name,
        uint256 startTime,
        uint256 endTime,
        bytes32 merkleRoot,
        string calldata manifestCid
    ) external onlyAdmin {
        Election storage e = _elections[electionId];
        if (e.exists) revert ElectionAlreadyExists();
        if (endTime <= startTime) revert InvalidTimeRange();

        e.id = electionId;
        e.name = name;
        e.startTime = uint64(startTime);
        e.endTime = uint64(endTime);
        e.merkleRoot = merkleRoot;
        e.manifestCid = manifestCid;
        e.active = false; // must explicitly activate
        e.exists = true;

        _electionIds.push(electionId);

        emit ElectionCreated(
            electionId,
            name,
            startTime,
            endTime,
            merkleRoot,
            manifestCid
        );
    }

    /// @notice Add a candidate to an election.
    function addCandidate(
        string calldata electionId,
        string calldata candidateId,
        string calldata name,
        string calldata ipfsCid
    ) external onlyAdmin {
        Election storage e = _elections[electionId];
        if (!e.exists) revert ElectionNotFound();

        bytes32 key = keccak256(bytes(candidateId));
        if (_candidateIndexById[electionId][key] != 0) {
            revert CandidateAlreadyExists();
        }

        _candidates[electionId].push(
            Candidate({
                id: candidateId,
                name: name,
                ipfsCid: ipfsCid,
                voteCount: 0
            })
        );

        _candidateIndexById[electionId][key] = _candidates[electionId].length; // index+1

        emit CandidateAdded(electionId, candidateId, name, ipfsCid);
    }

    /// @notice Activate / deactivate an election.
    function toggleElectionActive(
        string calldata electionId,
        bool isActive
    ) external onlyAdmin {
        Election storage e = _elections[electionId];
        if (!e.exists) revert ElectionNotFound();

        e.active = isActive;
        emit ElectionToggled(electionId, isActive);
    }

    /// @notice Update Merkle root before election starts.
    function setMerkleRoot(
        string calldata electionId,
        bytes32 root
    ) external onlyAdmin {
        Election storage e = _elections[electionId];
        if (!e.exists) revert ElectionNotFound();
        if (block.timestamp >= e.startTime) revert ElectionAlreadyStarted();

        e.merkleRoot = root;
    }

    /// @notice Update the verifier contract (e.g. after new trusted setup).
    function setVerifier(address verifierAddress) external onlyAdmin {
        if (verifierAddress == address(0)) revert VerifierAddressZero();
        verifier = IVerifier(verifierAddress);
        emit VerifierUpdated(verifierAddress);
    }

    // -----------
    // View functions
    // -----------

    function getElection(
        string calldata electionId
    ) external view returns (Election memory) {
        Election memory e = _elections[electionId];
        if (!e.exists) revert ElectionNotFound();
        return e;
    }

    function getCandidates(
        string calldata electionId
    ) external view returns (Candidate[] memory) {
        Election memory e = _elections[electionId];
        if (!e.exists) revert ElectionNotFound();

        Candidate[] storage list = _candidates[electionId];
        Candidate[] memory copy = new Candidate[](list.length);
        for (uint256 i = 0; i < list.length; i++) {
            copy[i] = list[i];
        }
        return copy;
    }

    function getElectionIds() external view returns (string[] memory) {
        return _electionIds;
    }

    /// @notice Check if a nullifier is used for a given election.
    function isNullifierUsed(
        string calldata electionId,
        bytes32 nullifier
    ) external view returns (bool) {
        bytes32 key = keccak256(abi.encodePacked(electionId, nullifier));
        return _usedNullifiers[key];
    }

    // -----------
    // Voting
    // -----------

    /// @notice Cast a vote in an election.
    /// @dev Assumes:
    ///      - `publicInputs[0]` is the Merkle root used in the circuit.
    ///      - `nullifier` is the hash output from the circuit (nullifierHash).
    function castVote(
        string calldata electionId,
        string calldata candidateId,
        bytes calldata proof,
        uint256[] calldata publicInputs,
        bytes32 nullifier,
        string calldata cid
    ) external {
        Election storage e = _elections[electionId];
        if (!e.exists) revert ElectionNotFound();
        if (!e.active) revert ElectionNotActive();

        uint256 ts = block.timestamp;
        if (ts < e.startTime) revert ElectionNotStarted();
        if (ts > e.endTime) revert ElectionEnded();

        // Verify zkSNARK proof
        bool ok = verifier.verifyProof(proof, publicInputs);
        if (!ok) revert InvalidProof();

        // Bind proof to this election's Merkle root (if included in pubSignals)
        if (publicInputs.length > 0) {
            if (bytes32(publicInputs[0]) != e.merkleRoot) {
                revert MerkleRootMismatch();
            }
        }

        // One-person-one-vote via nullifier
        bytes32 nullifierKey = keccak256(
            abi.encodePacked(electionId, nullifier)
        );
        if (_usedNullifiers[nullifierKey]) revert NullifierAlreadyUsed();
        _usedNullifiers[nullifierKey] = true;

        // Candidate lookup via index mapping
        bytes32 candKey = keccak256(bytes(candidateId));
        uint256 idxPlusOne = _candidateIndexById[electionId][candKey];
        if (idxPlusOne == 0) revert CandidateNotFound();
        uint256 idx = idxPlusOne - 1;

        _candidates[electionId][idx].voteCount += 1;

        emit VoteCast(electionId, candidateId, nullifier, cid);
    }
}