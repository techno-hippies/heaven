import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy DirectoryV2 contract
  // admin and attestor are both set to deployer for now
  const deployedDirectory = await deploy("DirectoryV2", {
    from: deployer,
    args: [deployer, deployer], // admin, attestor
    log: true,
  });

  console.log(`DirectoryV2 contract: `, deployedDirectory.address);
};

export default func;
func.id = "deploy_directory";
func.tags = ["DirectoryV2"];
