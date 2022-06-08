// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";


module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  await deploy("ScWalletFactory", {
    from: deployer,
    log: true,
    waitConfirmations: 5,
  });

};
module.exports.tags = ["ScWalletFactory"];
