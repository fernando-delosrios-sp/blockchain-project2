let starNotary = artifacts.require('StarNotary')

module.exports = async (deployer) => {
  let deployStarNotary = await deployer.deploy(starNotary)
}