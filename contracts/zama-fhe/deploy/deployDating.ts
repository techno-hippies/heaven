import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy Dating contract (encrypted matching with FHE)
  const deployedDating = await deploy("Dating", {
    from: deployer,
    log: true,
  });

  console.log(`Dating contract: `, deployedDating.address);
};

export default func;
func.id = "deploy_dating";
func.tags = ["Dating"];
func.dependencies = ["Directory"]; // Deploy after Directory
