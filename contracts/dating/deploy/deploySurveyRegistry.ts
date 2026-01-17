import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  console.log('Deploying SurveyRegistry with deployer:', deployer)

  const result = await deploy('SurveyRegistry', {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 1,
  })

  console.log('SurveyRegistry deployed to:', result.address)
}

export default func
func.tags = ['SurveyRegistry']
