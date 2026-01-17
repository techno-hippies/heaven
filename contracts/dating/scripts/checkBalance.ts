import "dotenv/config";
import { ethers, network } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("Network:", network.name);
  console.log("Deployer:", signer.address);
  console.log("Balance:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
