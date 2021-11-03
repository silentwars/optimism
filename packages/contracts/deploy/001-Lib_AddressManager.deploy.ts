/* Imports: Internal */
import { addressNames } from '../src'

/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

const deployFn: DeployFunction = async (hre) => {
  const { deploy } = hre.deployments
  const { deployer } = await hre.getNamedAccounts()

  await deploy(addressNames.addressManager, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: (hre as any).deployConfig.numDeployConfirmations,
  })
}

// This is kept during an upgrade. So no upgrade tag.
deployFn.tags = ['Lib_AddressManager']

export default deployFn