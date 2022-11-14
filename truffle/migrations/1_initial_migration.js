const name = "Migrations"
const contract = artifacts.require(name)

module.exports = (deployer) => {
    deployer.deploy(contract)
}