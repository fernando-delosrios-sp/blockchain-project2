const { REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_SECRET_API_KEY, REACT_APP_NFT_IMAGE_HASH } = process.env
const pinataSDK = require('@pinata/sdk')
const pinata = new pinataSDK(REACT_APP_PINATA_API_KEY, REACT_APP_PINATA_SECRET_API_KEY)

const BASE_URI = 'https://gateway.pinata.cloud/ipfs'
const DESCRIPTION = 'Udacity Blockchain developer project 2'

const isPinataAuthenticated = async () => {
    return (await pinata.testAuthentication()).authenticated
}

const generateTokenURI = async (message) => {
    let options = {
        pinataMetadata: {
            name: 'Star image'
        }
    }
    const ipfsImageHash = REACT_APP_NFT_IMAGE_HASH
    const metadata = {
        name: message,
        description: DESCRIPTION,
        image: `${BASE_URI}/${ipfsImageHash}`
    }
    options = {
        pinataMetadata: {
            name: `${DESCRIPTION}: ${message}`
        }
    }
    // console.log('Metadata generated for NFT...')
    // console.log(metadata)

    const response = await pinata.pinJSONToIPFS(metadata, options)

    return `ipfs://${response.IpfsHash}`
}

module.exports = {
    isPinataAuthenticated,
    // pinImage,
    generateTokenURI
}