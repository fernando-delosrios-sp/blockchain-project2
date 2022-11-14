// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract StarNotary is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter internal _tokenIds;
    mapping(uint256 => uint256) internal _starsForSale;

    constructor() ERC721("Udacity Star", "USTR") {}

    function _make_payable(address x) internal pure returns (address payable) {
        return payable(address(uint160(x)));
    }

    function _isOwner(uint256 tokenId, address owner)
        internal
        view
        returns (bool)
    {
        return ownerOf(tokenId) == owner;
    }

    function isStarUpForSale(uint256 tokenId) public view returns (bool) {
        return _starsForSale[tokenId] > 0;
    }

    function getStarPrice(uint256 tokenId) public view returns (uint256) {
        return _starsForSale[tokenId];
    }

    //Allows minting to contract owner only.
    function createStar(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(tx.origin, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    function exchangeStars(uint256 tokenId1, uint256 tokenId2) public {
        require(
            _isOwner(tokenId1, msg.sender) || _isOwner(tokenId2, msg.sender),
            "Caller is owner of neither star"
        );

        address owner1 = ownerOf(tokenId1);
        address owner2 = ownerOf(tokenId2);
        require(owner1 != owner2, "Caller is owner of both stars");

        _transfer(owner1, owner2, tokenId1);
        delete _starsForSale[tokenId1];
        _transfer(owner2, owner1, tokenId2);
        delete _starsForSale[tokenId2];
    }

    function putStarUpForSale(uint256 tokenId, uint256 price) public {
        require(
            _isOwner(tokenId, msg.sender),
            "Caller is not owner of the star!"
        );
        require(!isStarUpForSale(tokenId), "The star is already up for sale");
        require(price > 0, "Star must be worth more");

        _starsForSale[tokenId] = price;
    }

    function transferStar(address to, uint256 tokenId) public {
        require(
            _isOwner(tokenId, msg.sender),
            "Caller is not owner of the star!"
        );

        address from = msg.sender;
        transferFrom(from, to, tokenId);
        delete _starsForSale[tokenId];
    }

    function buyStar(uint256 tokenId) public payable {
        require(isStarUpForSale(tokenId), "The star must be up for sale");

        uint256 starCost = _starsForSale[tokenId];
        address ownerAddress = ownerOf(tokenId);
        require(msg.value >= starCost, "You need to have enough Ether");

        _transfer(ownerAddress, msg.sender, tokenId);
        delete _starsForSale[tokenId];

        address payable ownerAddressPayable = _make_payable(ownerAddress);
        ownerAddressPayable.transfer(starCost);
        if (msg.value > starCost) {
            _make_payable(msg.sender).transfer(msg.value - starCost);
        }
    }
}
