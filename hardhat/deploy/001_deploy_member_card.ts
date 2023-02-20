import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const memberCardDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();

  // SBT contract deployment.
  const memberCard = await deploy('MemberCard', {
      contract: 'MemberCard',
      from: deployer,
      args: ['Alyra Member Card', 'AEC'],
      log: true,
  });

  // Governance contract requires both WID contract and MemberCard contract to have been deployed.
  const Governance = await deploy('Governance', {
    contract: 'Governance',
    from: deployer,
    args: [memberCard.address],
    log: true,
  })
};

export default memberCardDeploy;
memberCardDeploy.tags = ['MemberCard']