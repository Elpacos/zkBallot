// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMock
 * @notice NFTMock is a mock contract for testing purposes.
 */
contract NFTMock is Ownable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event NFTMinted(uint256 indexed tokenId);
    constructor(string memory name, string memory symbol) ERC721(name, symbol) {}

    function mint(address user, string memory tokenURI) onlyOwner  public returns (uint256) {
        // oppenzepeplin counter
        _tokenIds.increment();

        // mint the token
        uint256 newItemId = _tokenIds.current();
        _mint(user, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit NFTMinted(newItemId);
        return newItemId;
    }
}