/**
 * Raw Solidity source for a multisig timelock vault treasury contract.
 */
export const vaultTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Multisig treasury vault with a timelock. Transactions require a quorum of
 * owner confirmations and can only execute after a configurable delay has elapsed.
 */
contract StandardVault {
    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 confirmations;
        uint256 eta;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint256 public required;
    uint256 public delay;

    Transaction[] public transactions;
    mapping(uint256 => mapping(address => bool)) public confirmedBy;

    event Deposit(address indexed sender, uint256 amount);
    event Submitted(uint256 indexed txId, address indexed to, uint256 value);
    event Confirmed(uint256 indexed txId, address indexed owner);
    event Executed(uint256 indexed txId);

    modifier onlyOwner() {
        require(isOwner[msg.sender], "Not an owner");
        _;
    }

    modifier txExists(uint256 _txId) {
        require(_txId < transactions.length, "Transaction does not exist");
        _;
    }

    /**
     * @dev Initializes the vault with its owner set, quorum and timelock delay.
     * @param _owners address[] The list of owner addresses.
     * @param _required uint256 The number of confirmations required to execute.
     * @param _delay uint256 The timelock delay in seconds before execution.
     */
    constructor(address[] memory _owners, uint256 _required, uint256 _delay) {
        require(_owners.length > 0, "Owners required");
        require(_required > 0 && _required <= _owners.length, "Invalid required count");

        for (uint256 i = 0; i < _owners.length; i++) {
            address owner = _owners[i];
            require(owner != address(0), "Invalid owner");
            require(!isOwner[owner], "Duplicate owner");
            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
        delay = _delay;
    }

    /**
     * @dev Receives native currency deposits into the treasury.
     */
    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    /**
     * @dev Submits a new transaction for owner confirmation.
     * @param _to address The destination address of the call.
     * @param _value uint256 The native currency amount to send.
     * @param _data bytes The calldata payload of the transaction.
     * @return uint256 The ID of the newly created transaction.
     */
    function submit(address _to, uint256 _value, bytes calldata _data) external onlyOwner returns (uint256) {
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            executed: false,
            confirmations: 0,
            eta: block.timestamp + delay
        }));

        uint256 txId = transactions.length - 1;
        emit Submitted(txId, _to, _value);
        return txId;
    }

    /**
     * @dev Confirms a pending transaction.
     * @param _txId uint256 The ID of the transaction to confirm.
     */
    function confirm(uint256 _txId) external onlyOwner txExists(_txId) {
        require(!confirmedBy[_txId][msg.sender], "Already confirmed");
        Transaction storage transaction = transactions[_txId];
        require(!transaction.executed, "Already executed");

        confirmedBy[_txId][msg.sender] = true;
        transaction.confirmations += 1;

        emit Confirmed(_txId, msg.sender);
    }

    /**
     * @dev Executes a transaction once it has enough confirmations and the timelock has passed.
     * @param _txId uint256 The ID of the transaction to execute.
     */
    function execute(uint256 _txId) external onlyOwner txExists(_txId) {
        Transaction storage transaction = transactions[_txId];
        require(!transaction.executed, "Already executed");
        require(transaction.confirmations >= required, "Insufficient confirmations");
        require(block.timestamp >= transaction.eta, "Timelock not elapsed");

        transaction.executed = true;
        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Execution failed");

        emit Executed(_txId);
    }
}
`;
