const { expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup.js');
const { isPinataAuthenticated, generateTokenURI } = require('../scripts/pinata.js')
const chai = require('chai')
const BN = require('bn.js')

// Enable and inject BN dependency
chai.use(require('chai-bn')(BN));

const StarNotary = artifacts.require("StarNotary")
const Star = artifacts.require("Star")

contract('StarNotary', (accounts) => {
    const starsByOwner = {}
    const owner = accounts[0]
    const starGazer = accounts[1]
    const starBuyer1 = accounts[2]
    const starBuyer2 = accounts[3]
    const name = "Udacity Star"
    const symbol = "USTR"
    let notary

    const saveStarRegistry = (address, tokenId) => {
        const currentStars = starsByOwner[address] ? starsByOwner[address] : []
        starsByOwner[address] = currentStars.concat([tokenId])
    }

    before(async () => {
        notary = await StarNotary.deployed()
    })

    it('Pinata is authenticated', async () => {
        expect(await isPinataAuthenticated(), 'Cannot connect to Pinata. Make sure you updated your .env file appropriately.').to.be.true
    })

    it('Check contract name and symbol', async () => {
        //Check contract name
        expect(await notary.name.call()).to.equal(name)
        //Check contract symbol
        expect(await notary.symbol.call()).to.equal(symbol)
    })

    it('User can mint a new star', async () => {
        const balance = web3.utils.toBN('1')
        const tokenURI = await generateTokenURI('My awesome star!')

        const tx = await notary.createStar(tokenURI, { from: starGazer })
        //Check dynamic tokenId
        const tokenId = tx.logs[0].args.tokenId
        expect(tokenId, 'TokenId not defined').not.equal(undefined)

        //Check transfer event
        expectEvent(tx, 'Transfer', { from: constants.ZERO_ADDRESS, to: starGazer, tokenId })
        //Check token balance
        chai.expect(await notary.balanceOf.call(starGazer)).to.be.a.bignumber.that.gte(balance)
        //Check star owner
        expect(await notary.ownerOf.call(tokenId)).to.equal(starGazer)
        //Check tokenURI (star name)
        expect(await notary.tokenURI.call(tokenId)).to.equal(tokenURI)

        starsByOwner[starGazer] = tokenId
    })

    it('Put up previous star for sale for 1 ETH', async () => {
        const tokenId = starsByOwner[starGazer]
        const price = web3.utils.toWei("1", "ether")
        const balance = web3.utils.toBN('1')
        await notary.putStarUpForSale(tokenId, price, { from: starGazer })
        // console.log('Published price: ' + await notary.getStarPrice(tokenId))

        //Check star is up for sale
        expect(await notary.isStarUpForSale.call(tokenId)).to.equal(true)
    })

    it('Cannot put it up again', async () => {
        const tokenId = starsByOwner[starGazer]
        const price = web3.utils.toWei(".05", "ether")
        const balance = web3.utils.toBN('1')

        //Check star cannot be put up for sale again
        expectRevert(notary.putStarUpForSale(tokenId, price, { from: starGazer }), 'The star is already up for sale')
    })

    it('Buy previous star with 5 ETH', async () => {
        const tokenId = starsByOwner[starGazer]
        const price = await notary.getStarPrice(tokenId)
        const balance = web3.utils.toWei("5", "ether")
        const starBuyer1InitialETH = await web3.eth.getBalance(starBuyer1)

        const tx = await notary.buyStar(tokenId, { value: balance, from: starBuyer1 })

        const starBuyer1FinalETH = await web3.eth.getBalance(starBuyer1)
        const gasUsed = tx.receipt.gasUsed
        // console.log(tx)
        // console.log(Number(starBuyer1InitialETH))
        // console.log(Number(starBuyer1FinalETH))
        // console.log(Number(price))
        // console.log(Number(gasUsed))
        // console.log(Number(starBuyer1InitialETH - (starBuyer1FinalETH)))

        //Check balances are correct
        expect(Number(starBuyer1FinalETH) + Number(price)).to.lt(Number(starBuyer1InitialETH), "Initial and final balances don't match")
        starsByOwner[starBuyer1] = tokenId
    })

    it('Cannot buy previous star again', async () => {
        const tokenId = starsByOwner[starBuyer1]
        const price = await notary.getStarPrice.call(tokenId)
        const balance = web3.utils.toWei("5", "ether")

        //Check star is not up for sale
        await expectRevert(notary.buyStar(tokenId, { value: balance, from: starBuyer2 }), 'The star must be up for sale')
    })

    it('User star exchange', async () => {
        const user1 = starGazer
        const user2 = starBuyer1

        const tokenURI = await generateTokenURI('My replacement star!')

        const tx1 = await notary.createStar(tokenURI, { from: user1 })
        const tokenId1 = tx1.logs[0].args.tokenId
        const tokenId2 = starsByOwner[user2]

        const tx2 = await notary.exchangeStars(tokenId1, tokenId2, { from: user1 })

        //Check first star owner
        expect(await notary.ownerOf.call(tokenId1)).to.equal(user2)
        //Check second star owner
        expect(await notary.ownerOf.call(tokenId2)).to.equal(user1)

        starsByOwner[user1] = tokenId2
        starsByOwner[user2] = tokenId1
    })

    it('Star transfer', async () => {
        const tokenId = starsByOwner[starGazer]

        const tx = await notary.transferStar(starBuyer2, tokenId, { from: starGazer })

        //Check star new owner
        expect(await notary.ownerOf.call(tokenId)).to.equal(starBuyer2)

        delete starsByOwner[starGazer]
        starsByOwner[starBuyer2] = tokenId
    })

})