// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IInvoiceNFTMarket {
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
    function setStatus(uint256 tokenId, InvoiceStatus newStatus) external;
}

contract InvoiceMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC721 public invoiceNFT;
    IInvoiceNFTMarket public invoiceNFTData;
    uint256 public marketplaceFeeBps; // e.g., 50 = 0.5%
    address public feeRecipient;

    struct Listing {
        uint256 invoiceId;
        address seller;
        uint256 salePrice;
        address paymentToken;
        uint64 expiry;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public totalListings;

    event InvoiceListed(
        uint256 indexed invoiceId,
        address indexed seller,
        uint256 salePrice,
        address paymentToken,
        uint64 expiry
    );
    event InvoiceSold(
        uint256 indexed invoiceId,
        address indexed seller,
        address indexed buyer,
        uint256 salePrice,
        uint256 fee
    );
    event ListingCancelled(uint256 indexed invoiceId, address indexed seller);
    event MarketplaceFeeUpdated(uint256 newFeeBps);

    constructor(
        address _invoiceNFT,
        uint256 _marketplaceFeeBps,
        address _feeRecipient
    ) Ownable(msg.sender) {
        invoiceNFT = IERC721(_invoiceNFT);
        invoiceNFTData = IInvoiceNFTMarket(_invoiceNFT);
        marketplaceFeeBps = _marketplaceFeeBps;
        feeRecipient = _feeRecipient;
    }

    function list(
        uint256 invoiceId,
        uint256 salePrice,
        uint64 expiry
    ) external nonReentrant {
        require(invoiceNFT.ownerOf(invoiceId) == msg.sender, "Not token owner");
        require(salePrice > 0, "Price must be > 0");
        require(expiry > block.timestamp, "Expiry must be future");

        IInvoiceNFTMarket.InvoiceData memory inv = invoiceNFTData.getInvoice(invoiceId);
        require(inv.status == IInvoiceNFTMarket.InvoiceStatus.APPROVED, "Must be APPROVED");

        // Seller must have approved this contract for NFT transfer
        require(
            invoiceNFT.isApprovedForAll(msg.sender, address(this)) ||
            invoiceNFT.getApproved(invoiceId) == address(this),
            "Marketplace not approved for NFT"
        );

        listings[invoiceId] = Listing({
            invoiceId: invoiceId,
            seller: msg.sender,
            salePrice: salePrice,
            paymentToken: inv.token,
            expiry: expiry,
            active: true
        });

        totalListings++;

        // Update invoice status to LISTED
        invoiceNFTData.setStatus(invoiceId, IInvoiceNFTMarket.InvoiceStatus.LISTED);

        emit InvoiceListed(invoiceId, msg.sender, salePrice, inv.token, expiry);
    }

    function buy(uint256 invoiceId) external nonReentrant {
        Listing storage listing = listings[invoiceId];
        require(listing.active, "Listing not active");
        require(block.timestamp <= listing.expiry, "Listing expired");
        require(msg.sender != listing.seller, "Cannot buy own listing");

        IERC20 token = IERC20(listing.paymentToken);

        uint256 fee = (listing.salePrice * marketplaceFeeBps) / 10000;
        uint256 sellerProceeds = listing.salePrice - fee;

        // Transfer payment
        token.safeTransferFrom(msg.sender, listing.seller, sellerProceeds);
        if (fee > 0) {
            token.safeTransferFrom(msg.sender, feeRecipient, fee);
        }

        // Transfer NFT
        invoiceNFT.safeTransferFrom(listing.seller, msg.sender, invoiceId);

        // Update status to SOLD
        invoiceNFTData.setStatus(invoiceId, IInvoiceNFTMarket.InvoiceStatus.SOLD);

        listing.active = false;

        emit InvoiceSold(invoiceId, listing.seller, msg.sender, listing.salePrice, fee);
    }

    function cancelListing(uint256 invoiceId) external {
        Listing storage listing = listings[invoiceId];
        require(listing.seller == msg.sender, "Not listing seller");
        require(listing.active, "Listing not active");

        listing.active = false;

        // Revert status to APPROVED
        invoiceNFTData.setStatus(invoiceId, IInvoiceNFTMarket.InvoiceStatus.APPROVED);

        emit ListingCancelled(invoiceId, msg.sender);
    }

    function setMarketplaceFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 500, "Fee too high");
        marketplaceFeeBps = _feeBps;
        emit MarketplaceFeeUpdated(_feeBps);
    }

    function setFeeRecipient(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient");
        feeRecipient = _recipient;
    }
}
