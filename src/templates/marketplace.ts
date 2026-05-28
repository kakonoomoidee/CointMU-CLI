export const marketplaceTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal implementation of an NFT Marketplace contract.
 */
contract StandardMarketplace {
    struct Listing {
        uint256 id;
        address seller;
        address tokenAddress;
        uint256 tokenId;
        uint256 price;
        bool isActive;
    }

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;

    event ListingCreated(uint256 indexed id, address indexed seller, address indexed tokenAddress, uint256 tokenId, uint256 price);
    event ListingPurchased(uint256 indexed id, address indexed buyer, uint256 price);
    event ListingCancelled(uint256 indexed id);

    /**
     * @dev Initializes the marketplace contract.
     */
    constructor() {}

    /**
     * @dev Creates a new listing for an NFT.
     * @param _tokenAddress address Address of the NFT contract.
     * @param _tokenId uint256 Token ID of the NFT.
     * @param _price uint256 Price in native currency.
     * @return uint256 Returns the ID of the new listing.
     */
    function createListing(address _tokenAddress, uint256 _tokenId, uint256 _price) public returns (uint256) {
        require(_price > 0, "Price must be greater than zero");
        
        uint256 id = nextListingId++;
        listings[id] = Listing({
            id: id,
            seller: msg.sender,
            tokenAddress: _tokenAddress,
            tokenId: _tokenId,
            price: _price,
            isActive: true
        });
        
        emit ListingCreated(id, msg.sender, _tokenAddress, _tokenId, _price);
        return id;
    }

    /**
     * @dev Simulates purchasing an active listing.
     * @param _id uint256 The ID of the listing to purchase.
     */
    function purchase(uint256 _id) public payable {
        Listing storage listing = listings[_id];
        require(listing.isActive, "Listing is not active");
        
        // In a real implementation, value transfers and NFT transfers would happen here
        listing.isActive = false;
        
        emit ListingPurchased(_id, msg.sender, listing.price);
    }
}
`;
