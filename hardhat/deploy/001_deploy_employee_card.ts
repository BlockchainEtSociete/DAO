import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const employeeCardDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();

  // SBT contract deployment.
  const employeeCard = await deploy('EmployeeCard', {
      contract: 'EmployeeCard',
      from: deployer,
      args: ['Alyra Employee Card', 'AEC'],
      log: true,
  });

  // ERC 20 token contract deployment.
  const widContract = await deploy('WID', {
    contract: 'WID',
    from: deployer,
    args: [],
    log: true,
  })

  // Governance contract requires both WID contract and EmployeeCard contract to have been deployed.
  const Governance = await deploy('Governance', {
    contract: 'Governance',
    from: deployer,
    args: [widContract.address, employeeCard.address],
    log: true,
  })
};

export default employeeCardDeploy;
employeeCardDeploy.tags = ['EmployeeCard']