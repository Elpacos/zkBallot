// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ERC165Checker } from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

import "./Proposal.sol";

/**
 * @title BallotFactory
 * @notice BallotFactorry is the base contract of the protocol. It handles
 *         the proposal creating logic.
 */

contract BallotFactory is Initializable, UUPSUpgradeable, OwnableUpgradeable {

    /**********
     * Errors *
     **********/

    error InvalidName();
    error InvalidDescription();
    error InvalidNumerOfChoices();
    error InvalidToken();
  
    /**********
     * Events *
     **********/

    event ProposalCreated(address indexed proposalAddress, address indexed tokenAddress, uint256 id);

    /**********************
     * Contract Variables *
     **********************/

    /**
     * @notice The address of where the current verifier contract is deployed.
     */
    address public verifier;

    /**
     * @notice The address of where the current hasher library is deployed.
     */
    address public hasher;

    /**
     * @notice The id of the next proposal to be created.
     */
    uint256 public id;

    /**
     * @notice The register of all the proposals created by an address.
     */
    mapping(address => address[]) public proposalsOf;

    /**
     * @notice Mapping that stores the created proposals by their id.
     */
    mapping(uint256 => address) public identification;

    /**
     * @notice List of all the proposals created.
     */
    address[] public proposals;

    /**
     * This contract is intended to be behind a delegate proxy.
     */
    constructor(address _verifier, address _hasher) {
         initialize(_verifier, _hasher);
    }

    /**
     * @dev _verifier is generated from the circuits and already deployed
     * @param _verifier address of the verfier
     * @param _hasher address of the hasher
     */
    function initialize(address _verifier, address _hasher) public initializer {
        verifier = _verifier;
        hasher = _hasher;

        // Initialize upgradable OZ contracts
        __Ownable_init();
    }

    /*
     * @dev required by the OZ UUPS module
    */
   function _authorizeUpgrade(address) internal override onlyOwner {}

    /**
     * @notice Creates a new proposal.
     * @param _name name of the proposal
     * @param _description description of the proposal
     * @param _token address of the token to be used
     * @param _choices array of the choices
     * @param _startDate start date of the proposal
     * @param _endDate end date of the proposal
     */
    function createProposal(
        string memory _name,
        string memory _description,
        address _token,
        string[] memory _choices,
        uint256 _startDate,
        uint256 _endDate        
        ) public {

        if(bytes(_name).length < 0 || bytes(_name).length > 20){
            revert InvalidName();
        }
        if(bytes(_description).length > 200 || bytes(_description).length < 40){
            revert InvalidDescription();
        }
        if(_choices.length < 1) {
            revert InvalidNumerOfChoices();
        }
        if (_token == address(0) || _token == address(this)){
            revert InvalidToken();
        }        
        
        Proposal myProposal = new Proposal(
            ++id,
            _name,
            _description,
            _token,
            _choices,
            _startDate,
            _endDate,
            msg.sender,
            verifier,
            IHasher(hasher)
            
        );
        proposalsOf[msg.sender].push(address(myProposal));
        identification[id] = (address(myProposal));

        // Note that supportsInterface makes a callback to the _token address which is user
        // provided.
        require(ERC165Checker.supportsInterface(_token, 0x80ac58cd), "Token does not support ERC721 interface");
        
        emit ProposalCreated(address(myProposal), _token, id);
    }

    /**
     * @notice get all the proposals that _address has created
     * @param _address address that created the proposals
     * @return  address of proposals created by _address
     */
    function getProposalsOf(address _address) external view returns (address[] memory) {
        return proposalsOf[_address];
    }
}