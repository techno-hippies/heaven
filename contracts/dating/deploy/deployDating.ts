import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // Get Directory address from previous deployment
  const directory = await get("Directory");

  // Roles: all deployer for now (configure separately for production)
  const admin = deployer;
  const oracle = process.env.ORACLE_ADDRESS ?? deployer;
  const relayer = process.env.RELAYER_ADDRESS ?? deployer;

  // Deploy Dating contract with constructor args
  const deployedDating = await deploy("Dating", {
    from: deployer,
    args: [admin, directory.address, oracle, relayer],
    log: true,
  });

  console.log(`Dating contract: `, deployedDating.address);
  console.log(`  - admin: ${admin}`);
  console.log(`  - directory: ${directory.address}`);
  console.log(`  - oracle: ${oracle}`);
  console.log(`  - relayer: ${relayer}`);
};

export default func;
func.id = "deploy_dating";
func.tags = ["Dating"];
func.dependencies = ["Directory"]; // Deploy after Directory
