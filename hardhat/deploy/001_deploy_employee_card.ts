import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const employeeCardDeploy: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const {deployments, getNamedAccounts} = hre;
  const {deploy} = deployments;
  const {deployer} = await getNamedAccounts();

  await deploy('EmployeeCard', {
      contract: 'EmployeeCard',
      from: deployer,
      args: ['Alyra Employee Card', 'AEC'],
      log: true,
  });
};

export default employeeCardDeploy;
employeeCardDeploy.tags = ['EmployeeCard']