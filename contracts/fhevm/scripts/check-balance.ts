import { ethers } from "hardhat";

async function main() {
  const signers = await ethers.getSigners();
  console.log("Deployer:", signers[0].address);
  const balance = await ethers.provider.getBalance(signers[0].address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
  
  // Check existing contract
  const contractAddress = "0xcAb2919b79D367988FB843420Cdd7665431AE0e7";
  const contract = await ethers.getContractAt("DatingV3", contractAddress);
  console.log("\nExisting contract:", contractAddress);
  console.log("setBasicsSponsor:", await contract.setBasicsSponsor());
}
main();
