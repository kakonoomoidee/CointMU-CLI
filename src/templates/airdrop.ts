/**
 * Raw Solidity source for a Merkle tree based token airdrop contract.
 */
export const airdropTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal ERC20 interface used by the airdrop contract.
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @dev Merkle tree based airdrop contract. Eligible accounts and amounts are
 * committed to a single Merkle root, and recipients claim by submitting a proof.
 */
contract StandardAirdrop {
    IERC20 public immutable token;
    bytes32 public immutable merkleRoot;
    address public owner;

    mapping(address => bool) public hasClaimed;

    event Claimed(address indexed account, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    /**
     * @dev Initializes the airdrop with the distributed token and the Merkle root.
     * @param _token address Address of the token to distribute.
     * @param _merkleRoot bytes32 Root of the Merkle tree of (account, amount) leaves.
     */
    constructor(address _token, bytes32 _merkleRoot) {
        token = IERC20(_token);
        merkleRoot = _merkleRoot;
        owner = msg.sender;
    }

    /**
     * @dev Claims an allocation by proving membership in the Merkle tree.
     * @param _amount uint256 The allocated amount encoded in the leaf.
     * @param _proof bytes32[] The Merkle proof for the caller's leaf.
     */
    function claim(uint256 _amount, bytes32[] calldata _proof) external {
        require(!hasClaimed[msg.sender], "Already claimed");

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _amount));
        require(_verify(_proof, leaf), "Invalid proof");

        hasClaimed[msg.sender] = true;
        require(token.transfer(msg.sender, _amount), "Transfer failed");

        emit Claimed(msg.sender, _amount);
    }

    /**
     * @dev Verifies a Merkle proof against the stored root.
     * @param _proof bytes32[] The Merkle proof nodes.
     * @param _leaf bytes32 The leaf being proven.
     * @return bool True if the proof reconstructs the root.
     */
    function _verify(bytes32[] calldata _proof, bytes32 _leaf) internal view returns (bool) {
        bytes32 computed = _leaf;
        for (uint256 i = 0; i < _proof.length; i++) {
            bytes32 node = _proof[i];
            if (computed <= node) {
                computed = keccak256(abi.encodePacked(computed, node));
            } else {
                computed = keccak256(abi.encodePacked(node, computed));
            }
        }
        return computed == merkleRoot;
    }
}
`;
