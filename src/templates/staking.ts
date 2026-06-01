/**
 * Raw Solidity source for a basic ERC20 staking / yield farming contract.
 */
export const stakingTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Minimal ERC20 interface used by the staking contract.
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @dev Minimal implementation of an ERC20 staking and yield farming contract.
 * Rewards accrue linearly over time based on the staked balance and a fixed reward rate.
 */
contract StandardStaking {
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;
    address public owner;

    uint256 public rewardRatePerSecond;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewardDebt;
    mapping(address => uint256) public lastUpdate;

    event Staked(address indexed account, uint256 amount);
    event Withdrawn(address indexed account, uint256 amount);
    event RewardClaimed(address indexed account, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    /**
     * @dev Initializes the staking contract with the staking and reward tokens.
     * @param _stakingToken address Address of the token users stake.
     * @param _rewardToken address Address of the token distributed as rewards.
     * @param _rewardRatePerSecond uint256 Reward tokens accrued per staked token per second.
     */
    constructor(address _stakingToken, address _rewardToken, uint256 _rewardRatePerSecond) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRatePerSecond = _rewardRatePerSecond;
        owner = msg.sender;
    }

    /**
     * @dev Updates the pending reward for an account before any balance change.
     * @param _account address The account whose rewards are settled.
     */
    function _updateReward(address _account) internal {
        if (lastUpdate[_account] != 0) {
            uint256 elapsed = block.timestamp - lastUpdate[_account];
            rewardDebt[_account] += stakedBalance[_account] * rewardRatePerSecond * elapsed;
        }
        lastUpdate[_account] = block.timestamp;
    }

    /**
     * @dev Stakes tokens into the contract.
     * @param _amount uint256 The amount of tokens to stake.
     */
    function stake(uint256 _amount) external {
        require(_amount > 0, "Cannot stake zero");
        _updateReward(msg.sender);

        stakedBalance[msg.sender] += _amount;
        require(stakingToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        emit Staked(msg.sender, _amount);
    }

    /**
     * @dev Withdraws previously staked tokens.
     * @param _amount uint256 The amount of tokens to withdraw.
     */
    function withdraw(uint256 _amount) external {
        require(stakedBalance[msg.sender] >= _amount, "Insufficient stake");
        _updateReward(msg.sender);

        stakedBalance[msg.sender] -= _amount;
        require(stakingToken.transfer(msg.sender, _amount), "Transfer failed");

        emit Withdrawn(msg.sender, _amount);
    }

    /**
     * @dev Claims accrued reward tokens for the caller.
     */
    function claimReward() external {
        _updateReward(msg.sender);

        uint256 reward = rewardDebt[msg.sender];
        require(reward > 0, "No rewards");

        rewardDebt[msg.sender] = 0;
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");

        emit RewardClaimed(msg.sender, reward);
    }

    /**
     * @dev Returns the pending reward for an account including unsettled accrual.
     * @param _account address The account to query.
     * @return uint256 The total pending reward amount.
     */
    function pendingReward(address _account) external view returns (uint256) {
        uint256 pending = rewardDebt[_account];
        if (lastUpdate[_account] != 0) {
            uint256 elapsed = block.timestamp - lastUpdate[_account];
            pending += stakedBalance[_account] * rewardRatePerSecond * elapsed;
        }
        return pending;
    }
}
`;
