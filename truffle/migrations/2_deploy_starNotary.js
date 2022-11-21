const name = "StarNotary"
let contract = artifacts.require(name)

module.exports = async (deployer) => {
  await deployer.deploy(contract)
}