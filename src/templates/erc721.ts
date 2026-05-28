export const erc721Template = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal implementation of the ERC721 Non-Fungible Token Standard.
 */
contract StandardERC721 {
    string public name;
    string public symbol;
    uint256 private _nextTokenId;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    /**
     * @dev Initializes the contract by setting a \`name\` and a \`symbol\` to the token collection.
     * @param _name string Name of the token collection.
     * @param _symbol string Symbol of the token collection.
     */
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }

    /**
     * @dev Returns the number of tokens in \`owner\`'s account.
     * @param owner address The account to query the balance of.
     * @return uint256 Returns the number of tokens owned.
     */
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Address zero is not a valid owner");
        return _balances[owner];
    }

    /**
     * @dev Returns the owner of the \`tokenId\` token.
     * @param tokenId uint256 The token identifier to query the owner of.
     * @return address Returns the address of the owner.
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Invalid token ID");
        return owner;
    }

    /**
     * @dev Mints a new token to \`to\`.
     * @param to address The account to receive the minted token.
     * @return uint256 Returns the ID of the newly minted token.
     */
    function mint(address to) public returns (uint256) {
        require(to != address(0), "Mint to the zero address");
        
        uint256 tokenId = _nextTokenId++;
        
        _balances[to] += 1;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);
        
        return tokenId;
    }
}
`;
