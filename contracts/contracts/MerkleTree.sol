// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.0;
import "hardhat/console.sol";
interface IHasher {
    function poseidon(bytes32[2] calldata leftRight)
        external
        pure
        returns (bytes32);
}

contract MerkleTree {
    IHasher public immutable hasher;
    uint256 public constant FIELD_SIZE =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;
    uint256 public constant ZERO_VALUE =
        21663839004416932945382355908790599225266501822907911457504978515578255421292;

    uint32 public levels;

    bytes32[] public filledSubtrees;
    bytes32[] public zeros;
    uint32 public nextIndex = 0;
    bytes32 public latestRoot;

    constructor(uint32 _treeLevels, IHasher _hasher) {
        require(_treeLevels > 0, "_treeLevels < 0");
        require(_treeLevels < 32, "_treeLevels > 32");
        levels = _treeLevels;
        hasher = _hasher;

        bytes32 currentZero = bytes32(ZERO_VALUE);
        zeros.push(currentZero);
        filledSubtrees.push(currentZero);

        for (uint32 i = 1; i < levels; i++) {
            currentZero = hashLeftRight(hasher, currentZero, currentZero);
            zeros.push(currentZero);
            filledSubtrees.push(currentZero);
        }

        latestRoot = hashLeftRight(hasher, currentZero, currentZero);
    }

    /**
    @dev Hash 2 tree leaves, returns MiMC(_left, _right)
  */
    function hashLeftRight(IHasher _hasher, bytes32 _left, bytes32 _right)
        public
        pure
        returns (bytes32)
    {
        require(
            uint256(_left) < FIELD_SIZE,
            "_left is out the field"
        );
        require(
            uint256(_right) < FIELD_SIZE,
            "_left is in the field"
        );
        bytes32[2] memory leftright = [_left, _right];
        return _hasher.poseidon(leftright);
    }

    function _insert(bytes32 _leaf) internal returns (uint32 index) {
        uint32 currentIndex = nextIndex;
        require(
            currentIndex != uint32(2)**levels,
            "Merkle tree is full."
        );
        nextIndex += 1;
        bytes32 currentLevelHash = _leaf;
        bytes32 left;
        bytes32 right;

        for (uint32 i = 0; i < levels; i++) {
            if (currentIndex % 2 == 0) {
                left = currentLevelHash;
                right = zeros[i];

                filledSubtrees[i] = currentLevelHash;
            } else {
                left = filledSubtrees[i];
                right = currentLevelHash;
            }
            
            currentLevelHash = hashLeftRight(hasher, left, right);

            currentIndex /= 2;
        }
        //TODO: implement the lastest root block for multiple inserts
        latestRoot = currentLevelHash;
        return nextIndex - 1;
    }

    /**
    @dev Whether the root is present in the root history
  */
  /*   function isKnownRoot(bytes32 _root) public view returns (bool) {
        if (_root == 0) {
            return false;
        }
        if (_root == latestRoot) {
            return true;
        }
        return false;
    } */
}