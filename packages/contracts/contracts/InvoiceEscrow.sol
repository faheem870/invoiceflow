// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IInvoiceNFT {
    enum InvoiceStatus {
        DRAFT, AWAITING_APPROVAL, APPROVED, LISTED, SOLD, DISPUTED, PAID, CANCELLED
    }

    struct InvoiceData {
        bytes32 invoiceHash;
        uint256 amount;
        address token;
        address payer;
        address seller;
        uint64 dueDate;
        InvoiceStatus status;
        uint64 createdAt;
    }

    function getInvoice(uint256 tokenId) external view returns (InvoiceData memory);
    function ownerOf(uint256 tokenId) external view returns (address);
    function setStatus(uint256 tokenId, InvoiceStatus newStatus) external;
}

contract InvoiceEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IInvoiceNFT public invoiceNFT;
    uint256 public protocolFeeBps; // e.g., 30 = 0.3%
    address public feeRecipient;
    address public researchPool;
    uint256 public researchFeeBps; // e.g., 5 = 0.05%

    struct PaymentRecord {
        uint256 invoiceId;
        address payer;
        address recipient;
        uint256 amount;
        uint256 protocolFee;
        uint256 researchFee;
        uint256 timestamp;
    }

    mapping(uint256 => PaymentRecord) public payments;

    event InvoicePaid(
        uint256 indexed invoiceId,
        address indexed payer,
        address indexed recipient,
        uint256 amount,
        uint256 protocolFee,
        uint256 researchFee
    );
    event ProtocolFeeUpdated(uint256 newFeeBps);
    event ResearchPoolUpdated(address pool, uint256 feeBps);

    constructor(
        address _invoiceNFT,
        address _feeRecipient,
        uint256 _protocolFeeBps
    ) Ownable(msg.sender) {
        invoiceNFT = IInvoiceNFT(_invoiceNFT);
        feeRecipient = _feeRecipient;
        protocolFeeBps = _protocolFeeBps;
    }

    function pay(uint256 invoiceId) external nonReentrant {
        IInvoiceNFT.InvoiceData memory inv = invoiceNFT.getInvoice(invoiceId);

        require(
            inv.status == IInvoiceNFT.InvoiceStatus.APPROVED ||
            inv.status == IInvoiceNFT.InvoiceStatus.SOLD,
            "Invoice not payable"
        );
        require(msg.sender == inv.payer, "Only payer can pay");

        address currentOwner = invoiceNFT.ownerOf(invoiceId);
        IERC20 token = IERC20(inv.token);

        uint256 protocolFee = (inv.amount * protocolFeeBps) / 10000;
        uint256 researchFee = 0;
        if (researchPool != address(0) && researchFeeBps > 0) {
            researchFee = (inv.amount * researchFeeBps) / 10000;
        }
        uint256 payoutAmount = inv.amount - protocolFee - researchFee;

        // Transfer from payer
        token.safeTransferFrom(msg.sender, currentOwner, payoutAmount);

        if (protocolFee > 0) {
            token.safeTransferFrom(msg.sender, feeRecipient, protocolFee);
        }

        if (researchFee > 0) {
            token.safeTransferFrom(msg.sender, researchPool, researchFee);
        }

        // Update invoice status to PAID
        invoiceNFT.setStatus(invoiceId, IInvoiceNFT.InvoiceStatus.PAID);

        // Record payment
        payments[invoiceId] = PaymentRecord({
            invoiceId: invoiceId,
            payer: msg.sender,
            recipient: currentOwner,
            amount: inv.amount,
            protocolFee: protocolFee,
            researchFee: researchFee,
            timestamp: block.timestamp
        });

        emit InvoicePaid(invoiceId, msg.sender, currentOwner, inv.amount, protocolFee, researchFee);
    }

    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 500, "Fee too high"); // Max 5%
        protocolFeeBps = _feeBps;
        emit ProtocolFeeUpdated(_feeBps);
    }

    function setResearchPool(address _pool, uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 100, "Research fee too high"); // Max 1%
        researchPool = _pool;
        researchFeeBps = _feeBps;
        emit ResearchPoolUpdated(_pool, _feeBps);
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }
}
