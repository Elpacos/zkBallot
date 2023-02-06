// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./MerkleTree.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IVerifier {
    function verifyProof(bytes memory _proof, uint256[2] memory _input)
        external
        returns (bool);
}

contract Proposal is Ownable, MerkleTree, ReentrancyGuard{
    
    /**********
     * Errors *
     **********/

    error UnAuthorizedCaller(address caller);
    error UsedCommitment(bytes32 commit);
    error VotationPeriodStarted();
    error VotationPeriodNotStarted();
    error VotationPeriodFinished();
    error VotationPeriodNotFinished();
    error InvalidChoice();
    error InvalidNullifier();
    error InvalidWithdrawProof();
    error InvalidStartDate();
  
    /**********
     * Events *
     **********/

    event SignUp(
        bytes32 indexed commitment,
        uint32 leafIndex,
        uint256 timestamp
    );

    event Vote(address voter, bytes32 nullifierHash);

    /**********************
     * Contract Variables *
     **********************/

    uint32 private constant MERKLE_LEVELS = 15;
    uint256 private constant MIN_DELAY = 2 hours;
    uint256 public choiceNumber;
    uint256 public proposalId;

     /**
     * @notice Start and end date of the voting time
     */
    uint256 public startDate;
    uint256 public endDate;

    string public name;
    string public description;
    string[] private choices;
    address public host;
    address private verifier;

    /**
     * @notice Address of the nft whoose holders can vote
     */
    address public tokenAddress;

     /**
     * @notice Mapping that stores the votes for each choice
     */
    mapping(uint256 => uint256) public votes;

    /**
     * @notice Mappings that mark the nullifierHashes and commitments as used
     */
    mapping(bytes32 => bool) private nullifierHashes;
    mapping(bytes32 => bool) private commitments;

    /**
     * @notice Mapping that stores the signedUp users
     */
    mapping(address => bool) private signed;
  

    /**
     * @notice Modifier that checks if the caller is owner of the token
     */
    modifier onlyTokenOwner() {
        if(IERC721(tokenAddress).balanceOf(msg.sender) == 0){
            revert UnAuthorizedCaller(msg.sender);
        }
        _;
    }

    /**
     * @notice Constructor of the contract that initializes the MerkleTree 
     */
    constructor(
        uint256 _id,
        string memory _name,
        string memory _description,
        address _token,
        string[] memory _choices,
        uint256 _startDate,
        uint256 _endDate,
        address _host,
        address _verifier,
        IHasher _hasher
    ) MerkleTree(MERKLE_LEVELS, _hasher) {
        if(_startDate + MIN_DELAY >= _endDate){
            revert InvalidStartDate();
        }
        proposalId = _id;
        name = _name;
        description = _description;
        tokenAddress = _token;
        choices = _choices;
        choiceNumber = _choices.length;
        startDate = _startDate;
        endDate = _endDate;
        verifier = _verifier;
        host = _host;
    }

    /**
     * @notice Returns the list of choices of the proposal
     */
    function choicesList() public view returns (string[] memory) {
        return choices;
    }

    /**
     * @notice True if the votation has ended
     */
    function hasEnded() public view returns (bool) {
        return block.timestamp > endDate;
    }

    /**
     * @notice True if the votation has started
     */
    function hasStarted() public view returns (bool) {
        return block.timestamp > startDate;
    }

    /**
     * @notice Returns an array with the number of votes for each choice
     * @dev postion i corresponds to the choice i with x votes
     */
    function proposalResults() public view returns(uint256[] memory){
        if(!hasEnded()){
            revert VotationPeriodNotFinished();
        }

        uint256[] memory results = new uint256[](choiceNumber);
        // Iterates over the votes mapping and add the votes to the array
        for (uint i; i < choiceNumber; ) {
            results[i] = votes[i];
            unchecked {
                ++i;
            }
        }
        return results;        
    }

    /**
     * @notice Signs a token owner to the Proposas, adds its commitment to the MerkleTree
     * @dev Frontend should should generate the zk proof 
     * @param _commitment commitment of the token owner generated on the frontend with a 
     * secret and a nullifier
     */
    function signUp(bytes32 _commitment)
        external
        onlyTokenOwner
        nonReentrant
    {
        if(commitments[_commitment]){
            revert UsedCommitment(_commitment);
        }
        if(block.timestamp > startDate){
            revert VotationPeriodStarted();
        }
        if(signed[msg.sender]){
            revert UnAuthorizedCaller(msg.sender);
        }

        // Adds the commitment to the MerkleTree
        uint32 insertedIndex = _insert(_commitment);
        commitments[_commitment] = true;
        signed[msg.sender] = true;

        emit SignUp(_commitment, insertedIndex, block.timestamp);
    }

    /**
     * @notice Casts a vote for a choice if the user has a valid proof
     * @dev Frontend should should generate the zk proof
     * @param _proof zk proof of membership
     * @param _nullifierHash hash of the nullifier
     * @param _choice choice of the vote
     */
    function castVote(
        bytes calldata _proof,
        bytes32 _nullifierHash,
        uint256 _choice
    ) external {
        if(block.timestamp > endDate){
            revert VotationPeriodFinished();
        }
        if(block.timestamp < startDate){
            revert VotationPeriodNotStarted();
        }
        if(_choice == 0 || _choice > choices.length){
            revert InvalidChoice();
        }
        if(nullifierHashes[_nullifierHash]){
            revert InvalidNullifier();
        }
        //Call to the verifier contract to check the proof
        if(!IVerifier(verifier).verifyProof(
                _proof, [uint256(latestRoot), uint256(_nullifierHash)])){
            revert InvalidWithdrawProof();
        }
        
        votes[_choice]++;
        nullifierHashes[_nullifierHash] = true;
        emit Vote(msg.sender, _nullifierHash);
    }


}