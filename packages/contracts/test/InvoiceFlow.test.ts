import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("InvoiceFlow", function () {
  async function deployFixture() {
    const [owner, seller, payer, investor, researcher] = await ethers.getSigners();

    // Deploy MockStablecoin
    const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
    const stablecoin = await MockStablecoin.deploy();
    const stablecoinAddr = await stablecoin.getAddress();

    // Deploy InvoiceNFT
    const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
    const invoiceNFT = await InvoiceNFT.deploy();
    const invoiceNFTAddr = await invoiceNFT.getAddress();

    // Deploy ResearchPool
    const ResearchPool = await ethers.getContractFactory("ResearchPool");
    const researchPool = await ResearchPool.deploy(stablecoinAddr);
    const researchPoolAddr = await researchPool.getAddress();

    // Deploy InvoiceEscrow (30 bps = 0.3% fee)
    const InvoiceEscrow = await ethers.getContractFactory("InvoiceEscrow");
    const escrow = await InvoiceEscrow.deploy(invoiceNFTAddr, owner.address, 30);
    const escrowAddr = await escrow.getAddress();

    // Deploy InvoiceMarketplace (50 bps = 0.5% fee)
    const InvoiceMarketplace = await ethers.getContractFactory("InvoiceMarketplace");
    const marketplace = await InvoiceMarketplace.deploy(invoiceNFTAddr, 50, owner.address);
    const marketplaceAddr = await marketplace.getAddress();

    // Authorize escrow and marketplace as modules on InvoiceNFT
    await invoiceNFT.setAuthorizedModule(escrowAddr, true);
    await invoiceNFT.setAuthorizedModule(marketplaceAddr, true);

    // Mint stablecoins to payer and investor
    const amount = ethers.parseEther("10000");
    await stablecoin.mint(payer.address, amount);
    await stablecoin.mint(investor.address, amount);
    await stablecoin.mint(seller.address, amount);

    const dueDate = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days
    const invoiceHash = ethers.keccak256(ethers.toUtf8Bytes("INV-001"));

    return {
      owner, seller, payer, investor, researcher,
      stablecoin, stablecoinAddr,
      invoiceNFT, invoiceNFTAddr,
      escrow, escrowAddr,
      marketplace, marketplaceAddr,
      researchPool, researchPoolAddr,
      dueDate, invoiceHash, amount,
    };
  }

  describe("InvoiceNFT", function () {
    it("should mint a draft invoice", async function () {
      const { invoiceNFT, seller, payer, stablecoinAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      const tx = await invoiceNFT.connect(seller).mintDraft(
        invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate
      );
      await tx.wait();

      const inv = await invoiceNFT.getInvoice(0);
      expect(inv.seller).to.equal(seller.address);
      expect(inv.payer).to.equal(payer.address);
      expect(inv.amount).to.equal(invoiceAmount);
      expect(inv.status).to.equal(0); // DRAFT
    });

    it("should request approval and payer approves", async function () {
      const { invoiceNFT, seller, payer, stablecoinAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);

      let inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(1); // AWAITING_APPROVAL

      await invoiceNFT.connect(payer).approve(0);
      inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(2); // APPROVED
    });

    it("should allow payer to dispute", async function () {
      const { invoiceNFT, seller, payer, stablecoinAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await invoiceNFT.connect(payer).dispute(0);

      const inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(5); // DISPUTED
    });

    it("should allow arbitrator to resolve dispute", async function () {
      const { invoiceNFT, owner, seller, payer, stablecoinAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await invoiceNFT.connect(payer).dispute(0);
      await invoiceNFT.connect(owner).resolveDispute(0, true);

      const inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(2); // APPROVED (dispute resolved in favor)
    });

    it("should allow owner to cancel draft invoice", async function () {
      const { invoiceNFT, seller, payer, stablecoinAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).cancel(0);

      const inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(7); // CANCELLED
    });

    it("should reject mint with zero amount", async function () {
      const { invoiceNFT, seller, payer, stablecoinAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      await expect(
        invoiceNFT.connect(seller).mintDraft(invoiceHash, 0, stablecoinAddr, payer.address, dueDate)
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("should reject approval from non-payer", async function () {
      const { invoiceNFT, seller, payer, investor, stablecoinAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await expect(invoiceNFT.connect(investor).approve(0)).to.be.revertedWith("Only payer can approve");
    });
  });

  describe("InvoiceEscrow", function () {
    it("should pay an approved invoice via escrow", async function () {
      const { invoiceNFT, escrow, stablecoin, seller, payer, stablecoinAddr, escrowAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      // Mint + approve invoice
      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await invoiceNFT.connect(payer).approve(0);

      // Payer approves stablecoin spend
      await stablecoin.connect(payer).approve(escrowAddr, invoiceAmount);

      const sellerBalBefore = await stablecoin.balanceOf(seller.address);
      await escrow.connect(payer).pay(0);
      const sellerBalAfter = await stablecoin.balanceOf(seller.address);

      // Seller should receive amount minus 0.3% protocol fee
      const fee = (invoiceAmount * 30n) / 10000n;
      expect(sellerBalAfter - sellerBalBefore).to.equal(invoiceAmount - fee);

      // Invoice should be PAID
      const inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(6); // PAID
    });

    it("should reject payment for non-approved invoice", async function () {
      const { invoiceNFT, escrow, stablecoin, seller, payer, stablecoinAddr, escrowAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await stablecoin.connect(payer).approve(escrowAddr, invoiceAmount);

      await expect(escrow.connect(payer).pay(0)).to.be.revertedWith("Invoice not payable");
    });

    it("should reject payment from non-payer", async function () {
      const { invoiceNFT, escrow, stablecoin, seller, payer, investor, stablecoinAddr, escrowAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await invoiceNFT.connect(payer).approve(0);
      await stablecoin.connect(investor).approve(escrowAddr, invoiceAmount);

      await expect(escrow.connect(investor).pay(0)).to.be.revertedWith("Only payer can pay");
    });
  });

  describe("InvoiceMarketplace", function () {
    it("should list and buy an invoice (factoring)", async function () {
      const { invoiceNFT, marketplace, stablecoin, seller, payer, investor, stablecoinAddr, invoiceNFTAddr, marketplaceAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");
      const salePrice = ethers.parseEther("950"); // 5% discount
      const expiry = dueDate;

      // Mint + approve invoice
      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await invoiceNFT.connect(payer).approve(0);

      // Seller approves marketplace for NFT transfer (disambiguate from invoice approve)
      await invoiceNFT.connect(seller).getFunction("approve(address,uint256)")(marketplaceAddr, 0);

      // List invoice
      await marketplace.connect(seller).list(0, salePrice, expiry);
      let inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(3); // LISTED

      // Investor buys
      await stablecoin.connect(investor).approve(marketplaceAddr, salePrice);
      await marketplace.connect(investor).buy(0);

      inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(4); // SOLD
      expect(await invoiceNFT.ownerOf(0)).to.equal(investor.address);
    });

    it("should allow seller to cancel listing", async function () {
      const { invoiceNFT, marketplace, seller, payer, stablecoinAddr, marketplaceAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");
      const salePrice = ethers.parseEther("950");
      const expiry = dueDate;

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await invoiceNFT.connect(payer).approve(0);
      await invoiceNFT.connect(seller).getFunction("approve(address,uint256)")(marketplaceAddr, 0);
      await marketplace.connect(seller).list(0, salePrice, expiry);

      await marketplace.connect(seller).cancelListing(0);
      const inv = await invoiceNFT.getInvoice(0);
      expect(inv.status).to.equal(2); // Back to APPROVED
    });

    it("should reject listing of non-approved invoice", async function () {
      const { invoiceNFT, marketplace, seller, payer, stablecoinAddr, marketplaceAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("1000");

      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).getFunction("approve(address,uint256)")(marketplaceAddr, 0);

      await expect(
        marketplace.connect(seller).list(0, ethers.parseEther("950"), dueDate)
      ).to.be.revertedWith("Must be APPROVED");
    });
  });

  describe("ResearchPool (DeSci)", function () {
    it("should accept donations and allocate/execute grants", async function () {
      const { researchPool, stablecoin, seller, researcher, researchPoolAddr } = await loadFixture(deployFixture);
      const donationAmount = ethers.parseEther("500");
      const grantAmount = ethers.parseEther("100");

      // Donate
      await stablecoin.connect(seller).approve(researchPoolAddr, donationAmount);
      await researchPool.connect(seller).donate(donationAmount);
      expect(await researchPool.totalDonations()).to.equal(donationAmount);

      // Allocate grant (owner only)
      await researchPool.allocateGrant(researcher.address, grantAmount, "Invoice payment analytics");
      expect(await researchPool.totalGrantsAllocated()).to.equal(grantAmount);

      // Execute grant
      const balBefore = await stablecoin.balanceOf(researcher.address);
      await researchPool.executeGrant(0);
      const balAfter = await stablecoin.balanceOf(researcher.address);
      expect(balAfter - balBefore).to.equal(grantAmount);
    });

    it("should mint research access NFT", async function () {
      const { researchPool, researcher } = await loadFixture(deployFixture);
      await researchPool.mintAccessNFT(researcher.address);
      expect(await researchPool.ownerOf(0)).to.equal(researcher.address);
    });

    it("should reject grant execution twice", async function () {
      const { researchPool, stablecoin, seller, researcher, researchPoolAddr } = await loadFixture(deployFixture);
      await stablecoin.connect(seller).approve(researchPoolAddr, ethers.parseEther("500"));
      await researchPool.connect(seller).donate(ethers.parseEther("500"));
      await researchPool.allocateGrant(researcher.address, ethers.parseEther("100"), "Test");
      await researchPool.executeGrant(0);
      await expect(researchPool.executeGrant(0)).to.be.revertedWith("Grant already executed");
    });
  });

  describe("End-to-End Flow", function () {
    it("full lifecycle: mint → approve → pay via escrow", async function () {
      const { invoiceNFT, escrow, stablecoin, seller, payer, stablecoinAddr, escrowAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("5000");

      // 1. Seller mints invoice
      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      expect((await invoiceNFT.getInvoice(0)).status).to.equal(0); // DRAFT

      // 2. Seller requests approval
      await invoiceNFT.connect(seller).requestApproval(0);
      expect((await invoiceNFT.getInvoice(0)).status).to.equal(1); // AWAITING_APPROVAL

      // 3. Payer approves
      await invoiceNFT.connect(payer).approve(0);
      expect((await invoiceNFT.getInvoice(0)).status).to.equal(2); // APPROVED

      // 4. Payer pays via escrow
      await stablecoin.connect(payer).approve(escrowAddr, invoiceAmount);
      await escrow.connect(payer).pay(0);
      expect((await invoiceNFT.getInvoice(0)).status).to.equal(6); // PAID

      // Verify payment record
      const payment = await escrow.payments(0);
      expect(payment.payer).to.equal(payer.address);
      expect(payment.amount).to.equal(invoiceAmount);
    });

    it("full lifecycle: mint → approve → list → sell to investor → investor gets paid", async function () {
      const { invoiceNFT, escrow, marketplace, stablecoin, seller, payer, investor, stablecoinAddr, escrowAddr, marketplaceAddr, dueDate, invoiceHash } = await loadFixture(deployFixture);
      const invoiceAmount = ethers.parseEther("5000");
      const salePrice = ethers.parseEther("4750"); // 5% discount

      // 1. Mint + approve
      await invoiceNFT.connect(seller).mintDraft(invoiceHash, invoiceAmount, stablecoinAddr, payer.address, dueDate);
      await invoiceNFT.connect(seller).requestApproval(0);
      await invoiceNFT.connect(payer).approve(0);

      // 2. List on marketplace
      await invoiceNFT.connect(seller).getFunction("approve(address,uint256)")(marketplaceAddr, 0);
      await marketplace.connect(seller).list(0, salePrice, dueDate);

      // 3. Investor buys
      await stablecoin.connect(investor).approve(marketplaceAddr, salePrice);
      await marketplace.connect(investor).buy(0);
      expect(await invoiceNFT.ownerOf(0)).to.equal(investor.address);

      // 4. Payer pays — money goes to investor (new owner)
      await stablecoin.connect(payer).approve(escrowAddr, invoiceAmount);
      const investorBalBefore = await stablecoin.balanceOf(investor.address);
      await escrow.connect(payer).pay(0);
      const investorBalAfter = await stablecoin.balanceOf(investor.address);

      const fee = (invoiceAmount * 30n) / 10000n;
      expect(investorBalAfter - investorBalBefore).to.equal(invoiceAmount - fee);
    });
  });
});
