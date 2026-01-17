import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy PartnerLink contract (no constructor args)
  const deployedPartnerLink = await deploy("PartnerLink", {
    from: deployer,
    log: true,
  });

  console.log(`PartnerLink contract: `, deployedPartnerLink.address);
};

export default func;
func.id = "deploy_partnerlink";
func.tags = ["PartnerLink"];
