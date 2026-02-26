// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract InvoiceNFT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    enum InvoiceStatus {
        DRAFT,
        AWAITING_APPROVAL,
        APPROVED,
        LISTED,
        SOLD,
        DISPUTED,
        PAID,
        CANCELLED
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

    uint256 private _nextTokenId;
    mapping(uint256 => InvoiceData) public invoices;
    mapping(address => bool) public authorizedModules;

    event InvoiceMinted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed payer,
        uint256 amount,
        address token,
        uint64 dueDate,
        bytes32 invoiceHash
    );
    event ApprovalRequested(uint256 indexed tokenId, address indexed payer);
    event InvoiceApproved(uint256 indexed tokenId, address indexed payer);
    event InvoiceDisputed(uint256 indexed tokenId, address indexed payer);
    event DisputeResolved(uint256 indexed tokenId, bool approved);
    event StatusChanged(uint256 indexed tokenId, InvoiceStatus oldStatus, InvoiceStatus newStatus);
    event ModuleAuthorized(address indexed module, bool authorized);

    modifier onlyOwnerOf(uint256 tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        _;
    }

    modifier onlyAuthorizedModule() {
        require(authorizedModules[msg.sender], "Not authorized module");
        _;
    }

    constructor() ERC721("InvoiceFlow NFT", "INVF") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ARBITRATOR_ROLE, msg.sender);
    }

    function mintDraft(
        bytes32 invoiceHash,
        uint256 amount,
        address token,
        address payer,
        uint64 dueDate
    ) external returns (uint256) {
        require(amount > 0, "Amount must be > 0");
        require(payer != address(0), "Invalid payer");
        require(token != address(0), "Invalid token");
        require(dueDate > block.timestamp, "Due date must be future");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);

        invoices[tokenId] = InvoiceData({
            invoiceHash: invoiceHash,
            amount: amount,
            token: token,
            payer: payer,
            seller: msg.sender,
            dueDate: dueDate,
            status: InvoiceStatus.DRAFT,
            createdAt: uint64(block.timestamp)
        });

        emit InvoiceMinted(tokenId, msg.sender, payer, amount, token, dueDate, invoiceHash);
        return tokenId;
    }

    function requestApproval(uint256 tokenId) external onlyOwnerOf(tokenId) {
        InvoiceData storage inv = invoices[tokenId];
        require(inv.status == InvoiceStatus.DRAFT, "Must be DRAFT");

        InvoiceStatus oldStatus = inv.status;
        inv.status = InvoiceStatus.AWAITING_APPROVAL;

        emit ApprovalRequested(tokenId, inv.payer);
        emit StatusChanged(tokenId, oldStatus, InvoiceStatus.AWAITING_APPROVAL);
    }

    function approve(uint256 tokenId) external {
        InvoiceData storage inv = invoices[tokenId];
        require(msg.sender == inv.payer, "Only payer can approve");
        require(inv.status == InvoiceStatus.AWAITING_APPROVAL, "Must be AWAITING_APPROVAL");

        InvoiceStatus oldStatus = inv.status;
        inv.status = InvoiceStatus.APPROVED;

        emit InvoiceApproved(tokenId, msg.sender);
        emit StatusChanged(tokenId, oldStatus, InvoiceStatus.APPROVED);
    }

    function dispute(uint256 tokenId) external {
        InvoiceData storage inv = invoices[tokenId];
        require(msg.sender == inv.payer, "Only payer can dispute");
        require(
            inv.status == InvoiceStatus.AWAITING_APPROVAL || inv.status == InvoiceStatus.APPROVED,
            "Cannot dispute in current status"
        );

        InvoiceStatus oldStatus = inv.status;
        inv.status = InvoiceStatus.DISPUTED;

        emit InvoiceDisputed(tokenId, msg.sender);
        emit StatusChanged(tokenId, oldStatus, InvoiceStatus.DISPUTED);
    }

    function resolveDispute(uint256 tokenId, bool approved) external onlyRole(ARBITRATOR_ROLE) {
        InvoiceData storage inv = invoices[tokenId];
        require(inv.status == InvoiceStatus.DISPUTED, "Must be DISPUTED");

        InvoiceStatus oldStatus = inv.status;
        inv.status = approved ? InvoiceStatus.APPROVED : InvoiceStatus.CANCELLED;

        emit DisputeResolved(tokenId, approved);
        emit StatusChanged(tokenId, oldStatus, inv.status);
    }

    function setStatus(uint256 tokenId, InvoiceStatus newStatus) external onlyAuthorizedModule {
        InvoiceData storage inv = invoices[tokenId];
        InvoiceStatus oldStatus = inv.status;
        inv.status = newStatus;

        emit StatusChanged(tokenId, oldStatus, newStatus);
    }

    function cancel(uint256 tokenId) external onlyOwnerOf(tokenId) {
        InvoiceData storage inv = invoices[tokenId];
        require(
            inv.status != InvoiceStatus.SOLD && inv.status != InvoiceStatus.PAID,
            "Cannot cancel SOLD or PAID"
        );

        InvoiceStatus oldStatus = inv.status;
        inv.status = InvoiceStatus.CANCELLED;

        emit StatusChanged(tokenId, oldStatus, InvoiceStatus.CANCELLED);
    }

    function setAuthorizedModule(address module, bool authorized) external onlyRole(DEFAULT_ADMIN_ROLE) {
        authorizedModules[module] = authorized;
        emit ModuleAuthorized(module, authorized);
    }

    function getInvoice(uint256 tokenId) external view returns (InvoiceData memory) {
        return invoices[tokenId];
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
