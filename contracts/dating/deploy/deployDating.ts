import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, get } = hre.deployments;

  // Get DirectoryV2 address from previous deployment
  const directory = await get("DirectoryV2");

  // Roles: all deployer for now (configure separately for production)
  const admin = deployer;
  const oracle = process.env.ORACLE_ADDRESS ?? deployer;
  const relayer = process.env.RELAYER_ADDRESS ?? deployer;

  // Deploy DatingV3 contract with constructor args
  const deployedDating = await deploy("DatingV3", {
    from: deployer,
    args: [admin, directory.address, oracle, relayer],
    log: true,
  });

  console.log(`DatingV3 contract: `, deployedDating.address);
  console.log(`  - admin: ${admin}`);
  console.log(`  - directory: ${directory.address}`);
  console.log(`  - oracle: ${oracle}`);
  console.log(`  - relayer: ${relayer}`);
};

export default func;
func.id = "deploy_dating";
func.tags = ["DatingV3"];
func.dependencies = ["DirectoryV2"]; // Deploy after DirectoryV2
