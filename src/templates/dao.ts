export const daoTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal implementation of a DAO (Decentralized Autonomous Organization) contract.
 */
contract StandardDAO {
    string public name;
    
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
    }

    uint256 public nextProposalId;
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed id, address indexed proposer, string description);
    event Voted(uint256 indexed id, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);

    /**
     * @dev Initializes the contract by setting a \`name\` to the DAO.
     * @param _name string Name of the DAO.
     */
    constructor(string memory _name) {
        name = _name;
    }

    /**
     * @dev Creates a new proposal.
     * @param _description string Description of the proposal.
     * @return uint256 Returns the ID of the new proposal.
     */
    function createProposal(string memory _description) public returns (uint256) {
        uint256 id = nextProposalId++;
        proposals[id] = Proposal({
            id: id,
            proposer: msg.sender,
            description: _description,
            votesFor: 0,
            votesAgainst: 0,
            executed: false
        });
        
        emit ProposalCreated(id, msg.sender, _description);
        return id;
    }

    /**
     * @dev Votes on a proposal.
     * @param _id uint256 The ID of the proposal to vote on.
     * @param _support bool True for "yes", false for "no".
     */
    function vote(uint256 _id, bool _support) public {
        require(_id < nextProposalId, "Proposal does not exist");
        require(!hasVoted[_id][msg.sender], "Already voted");
        
        Proposal storage proposal = proposals[_id];
        require(!proposal.executed, "Proposal already executed");
        
        uint256 weight = 1; // Assuming 1 account = 1 vote for simplicity
        
        if (_support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        hasVoted[_id][msg.sender] = true;
        
        emit Voted(_id, msg.sender, _support, weight);
    }
}
`;
