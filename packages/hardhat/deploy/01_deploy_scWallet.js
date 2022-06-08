// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

// const sleep = (ms) =>
//   new Promise((r) =>
//     setTimeout(() => {
//       console.log(`waited for ${(ms / 1000).toFixed(3)} seconds`);
//       r();
//     }, ms)
//   );

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();
  const scWalletFactory = await ethers.getContract("ScWalletFactory", deployer)
  const scWalletFactory_address = scWalletFactory.address;

  await deploy("ScWallet", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
      chainId,
      ["0xa53A6fE2d8Ad977aD926C485343Ba39f32D3A3F6"],
      1,
      scWalletFactory_address
    ],
    log: true,
    waitConfirmations: 5,
  });

};
module.exports.tags = ["ScWallet"];
