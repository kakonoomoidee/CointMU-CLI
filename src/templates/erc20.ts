export const erc20Template = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Implementation of the ERC20 Standard token.
 */
contract StandardERC20 {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Sets the values for name, symbol, and decimals. Mints the initial supply to the deployer.
     * @param _name string Name of the token.
     * @param _symbol string Symbol of the token.
     * @param _initialSupply uint256 Initial supply of the token.
     */
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        totalSupply = _initialSupply * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    /**
     * @dev Moves \`amount\` tokens from the caller's account to \`to\`.
     * @param to address The account to receive the tokens.
     * @param amount uint256 The amount of tokens to transfer.
     * @return bool Returns true on success.
     */
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev Sets \`amount\` as the allowance of \`spender\` over the caller's tokens.
     * @param spender address The account allowed to spend the caller's tokens.
     * @param amount uint256 The amount of tokens allowed to be spent.
     * @return bool Returns true on success.
     */
    function approve(address spender, uint256 amount) public returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Moves \`amount\` tokens from \`from\` to \`to\` using the allowance mechanism.
     * @param from address The account to send the tokens from.
     * @param to address The account to receive the tokens.
     * @param amount uint256 The amount of tokens to transfer.
     * @return bool Returns true on success.
     */
    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        
        emit Transfer(from, to, amount);
        return true;
    }
}
`;
