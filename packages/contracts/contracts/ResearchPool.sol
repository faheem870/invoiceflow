// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ResearchPool is ERC721, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public stablecoin;
    uint256 public totalDonations;
    uint256 public totalGrantsAllocated;
    uint256 public totalGrantsExecuted;
    uint256 private _nextAccessTokenId;

    struct Grant {
        address recipient;
        uint256 amount;
        string purpose;
        bool executed;
        uint256 createdAt;
    }

    mapping(uint256 => Grant) public grants;
    uint256 public grantCount;
    mapping(address => uint256) public donorBalances;

    event DonationReceived(address indexed donor, uint256 amount);
    event ProtocolFeeReceived(uint256 amount);
    event GrantAllocated(uint256 indexed grantId, address indexed recipient, uint256 amount, string purpose);
    event GrantExecuted(uint256 indexed grantId, address indexed recipient, uint256 amount);
    event AccessNFTMinted(uint256 indexed tokenId, address indexed researcher);

    constructor(address _stablecoin) ERC721("InvoiceFlow Research Access", "IFRA") Ownable(msg.sender) {
        stablecoin = IERC20(_stablecoin);
    }

    function donate(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        totalDonations += amount;
        donorBalances[msg.sender] += amount;
        emit DonationReceived(msg.sender, amount);
    }

    function receiveProtocolFee(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");
        stablecoin.safeTransferFrom(msg.sender, address(this), amount);
        totalDonations += amount;
        emit ProtocolFeeReceived(amount);
    }

    function allocateGrant(
        address recipient,
        uint256 amount,
        string calldata purpose
    ) external onlyOwner {
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");
        require(
            stablecoin.balanceOf(address(this)) >= amount,
            "Insufficient pool balance"
        );

        uint256 grantId = grantCount++;
        grants[grantId] = Grant({
            recipient: recipient,
            amount: amount,
            purpose: purpose,
            executed: false,
            createdAt: block.timestamp
        });

        totalGrantsAllocated += amount;

        emit GrantAllocated(grantId, recipient, amount, purpose);
    }

    function executeGrant(uint256 grantId) external onlyOwner {
        Grant storage grant = grants[grantId];
        require(!grant.executed, "Grant already executed");
        require(grant.amount > 0, "Invalid grant");

        grant.executed = true;
        totalGrantsExecuted += grant.amount;

        stablecoin.safeTransfer(grant.recipient, grant.amount);

        emit GrantExecuted(grantId, grant.recipient, grant.amount);
    }

    function mintAccessNFT(address researcher) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextAccessTokenId++;
        _safeMint(researcher, tokenId);
        emit AccessNFTMinted(tokenId, researcher);
        return tokenId;
    }

    function poolBalance() external view returns (uint256) {
        return stablecoin.balanceOf(address(this));
    }
}
