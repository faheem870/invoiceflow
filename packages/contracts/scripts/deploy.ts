import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // 1. Deploy MockStablecoin
  console.log("\n1. Deploying MockStablecoin...");
  const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
  const stablecoin = await MockStablecoin.deploy();
  await stablecoin.waitForDeployment();
  const stablecoinAddr = await stablecoin.getAddress();
  console.log("MockStablecoin deployed to:", stablecoinAddr);

  // 2. Deploy InvoiceNFT
  console.log("\n2. Deploying InvoiceNFT...");
  const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  await invoiceNFT.waitForDeployment();
  const invoiceNFTAddr = await invoiceNFT.getAddress();
  console.log("InvoiceNFT deployed to:", invoiceNFTAddr);

  // 3. Deploy ResearchPool
  console.log("\n3. Deploying ResearchPool...");
  const ResearchPool = await ethers.getContractFactory("ResearchPool");
  const researchPool = await ResearchPool.deploy(stablecoinAddr);
  await researchPool.waitForDeployment();
  const researchPoolAddr = await researchPool.getAddress();
  console.log("ResearchPool deployed to:", researchPoolAddr);

  // 4. Deploy InvoiceEscrow
  console.log("\n4. Deploying InvoiceEscrow...");
  const InvoiceEscrow = await ethers.getContractFactory("InvoiceEscrow");
  const escrow = await InvoiceEscrow.deploy(
    invoiceNFTAddr,
    deployer.address, // fee recipient
    30 // 0.3% protocol fee
  );
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log("InvoiceEscrow deployed to:", escrowAddr);

  // 5. Deploy InvoiceMarketplace
  console.log("\n5. Deploying InvoiceMarketplace...");
  const InvoiceMarketplace = await ethers.getContractFactory("InvoiceMarketplace");
  const marketplace = await InvoiceMarketplace.deploy(
    invoiceNFTAddr,
    50, // 0.5% marketplace fee
    deployer.address // fee recipient
  );
  await marketplace.waitForDeployment();
  const marketplaceAddr = await marketplace.getAddress();
  console.log("InvoiceMarketplace deployed to:", marketplaceAddr);

  // 6. Authorize modules on InvoiceNFT
  console.log("\n6. Authorizing modules...");
  await invoiceNFT.setAuthorizedModule(escrowAddr, true);
  console.log("Escrow authorized on InvoiceNFT");
  await invoiceNFT.setAuthorizedModule(marketplaceAddr, true);
  console.log("Marketplace authorized on InvoiceNFT");

  // 7. Set research pool on escrow
  await escrow.setResearchPool(researchPoolAddr, 5); // 0.05%
  console.log("Research pool set on Escrow");

  console.log("\n========================================");
  console.log("DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("MockStablecoin:      ", stablecoinAddr);
  console.log("InvoiceNFT:          ", invoiceNFTAddr);
  console.log("ResearchPool:        ", researchPoolAddr);
  console.log("InvoiceEscrow:       ", escrowAddr);
  console.log("InvoiceMarketplace:  ", marketplaceAddr);
  console.log("========================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
