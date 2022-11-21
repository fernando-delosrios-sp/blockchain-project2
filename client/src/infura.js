import { SDK, Auth, TEMPLATES } from '@infura/sdk';

const { REACT_APP_INFURA_KEY, REACT_APP_INFURA_SECRET, REACT_APP_SUPPORTED_CHAIN } = process.env;

const getInfuraSDK = (provider) => {
    const auth = new Auth({
        projectId: REACT_APP_INFURA_KEY,
        secretId: REACT_APP_INFURA_SECRET,
        provider: provider,
        chainId: Number.parseInt(REACT_APP_SUPPORTED_CHAIN),
    });

    return new SDK(auth);
}

export default getInfuraSDK;