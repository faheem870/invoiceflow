import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying to BSC Testnet with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // 1. Deploy MockStablecoin
  console.log("\n1. Deploying MockStablecoin...");
  const MockStablecoin = await ethers.getContractFactory("MockStablecoin");
  const stablecoin = await MockStablecoin.deploy();
  await stablecoin.waitForDeployment();
  const stablecoinAddr = await stablecoin.getAddress();
  console.log("MockStablecoin:", stablecoinAddr);

  // 2. Deploy InvoiceNFT
  console.log("\n2. Deploying InvoiceNFT...");
  const InvoiceNFT = await ethers.getContractFactory("InvoiceNFT");
  const invoiceNFT = await InvoiceNFT.deploy();
  await invoiceNFT.waitForDeployment();
  const invoiceNFTAddr = await invoiceNFT.getAddress();
  console.log("InvoiceNFT:", invoiceNFTAddr);

  // 3. Deploy ResearchPool
  console.log("\n3. Deploying ResearchPool...");
  const ResearchPool = await ethers.getContractFactory("ResearchPool");
  const researchPool = await ResearchPool.deploy(stablecoinAddr);
  await researchPool.waitForDeployment();
  const researchPoolAddr = await researchPool.getAddress();
  console.log("ResearchPool:", researchPoolAddr);

  // 4. Deploy InvoiceEscrow
  console.log("\n4. Deploying InvoiceEscrow...");
  const InvoiceEscrow = await ethers.getContractFactory("InvoiceEscrow");
  const escrow = await InvoiceEscrow.deploy(invoiceNFTAddr, deployer.address, 30);
  await escrow.waitForDeployment();
  const escrowAddr = await escrow.getAddress();
  console.log("InvoiceEscrow:", escrowAddr);

  // 5. Deploy InvoiceMarketplace
  console.log("\n5. Deploying InvoiceMarketplace...");
  const InvoiceMarketplace = await ethers.getContractFactory("InvoiceMarketplace");
  const marketplace = await InvoiceMarketplace.deploy(invoiceNFTAddr, 50, deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddr = await marketplace.getAddress();
  console.log("InvoiceMarketplace:", marketplaceAddr);

  // 6. Authorize modules
  console.log("\n6. Authorizing modules...");
  await invoiceNFT.setAuthorizedModule(escrowAddr, true);
  await invoiceNFT.setAuthorizedModule(marketplaceAddr, true);
  await escrow.setResearchPool(researchPoolAddr, 5);
  console.log("Modules authorized");

  console.log("\n========================================");
  console.log("BSC TESTNET DEPLOYMENT COMPLETE");
  console.log("========================================");
  console.log("MockStablecoin:      ", stablecoinAddr);
  console.log("InvoiceNFT:          ", invoiceNFTAddr);
  console.log("ResearchPool:        ", researchPoolAddr);
  console.log("InvoiceEscrow:       ", escrowAddr);
  console.log("InvoiceMarketplace:  ", marketplaceAddr);
  console.log("========================================");

  // Verify contracts
  console.log("\nVerifying contracts on BscScan...");
  try {
    await run("verify:verify", { address: stablecoinAddr, constructorArguments: [] });
    await run("verify:verify", { address: invoiceNFTAddr, constructorArguments: [] });
    await run("verify:verify", { address: researchPoolAddr, constructorArguments: [stablecoinAddr] });
    await run("verify:verify", { address: escrowAddr, constructorArguments: [invoiceNFTAddr, deployer.address, 30] });
    await run("verify:verify", { address: marketplaceAddr, constructorArguments: [invoiceNFTAddr, 50, deployer.address] });
    console.log("All contracts verified!");
  } catch (error) {
    console.log("Verification failed (may need to wait):", error);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
