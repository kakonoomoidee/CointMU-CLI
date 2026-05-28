export const erc1155Template = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal implementation of the ERC1155 Multi-Token Standard.
 */
contract StandardERC1155 {
    string public name;
    string public symbol;

    mapping(uint256 => mapping(address => uint256)) private _balances;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value);
    event ApprovalForAll(address indexed account, address indexed operator, bool approved);

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
     * @dev Returns the amount of tokens of token type \`id\` owned by \`account\`.
     * @param account address The account to query the balance of.
     * @param id uint256 The token identifier to query the balance of.
     * @return uint256 Returns the number of tokens owned.
     */
    function balanceOf(address account, uint256 id) public view returns (uint256) {
        require(account != address(0), "Address zero is not a valid owner");
        return _balances[id][account];
    }

    /**
     * @dev Mints \`amount\` of tokens of token type \`id\` to \`to\`.
     * @param to address The account to receive the minted token.
     * @param id uint256 The token type to mint.
     * @param amount uint256 The amount of tokens to mint.
     * @return bool Returns true on success.
     */
    function mint(address to, uint256 id, uint256 amount) public returns (bool) {
        require(to != address(0), "Mint to the zero address");
        
        _balances[id][to] += amount;

        emit TransferSingle(msg.sender, address(0), to, id, amount);
        
        return true;
    }
}
`;
