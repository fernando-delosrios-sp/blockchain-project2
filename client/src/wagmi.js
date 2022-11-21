import {
    chain,
    configureChains,
    WagmiConfig,
    createClient
} from 'wagmi';
// import { alchemyProvider } from 'wagmi/providers/alchemy';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'

const { REACT_APP_INFURA_KEY, REACT_APP_SUPPORTED_CHAIN } = process.env;

// eslint-disable-next-line eqeqeq
const supportedChain = Object.keys(chain).find(x => chain[x].id == REACT_APP_SUPPORTED_CHAIN);

const { chains, provider } = configureChains(
    [chain[supportedChain]],
    [
        // alchemyProvider({ apiKey: REACT_APP_ALCHEMY_ID }),
        infuraProvider({ apiKey: REACT_APP_INFURA_KEY }),
        publicProvider()
    ]
);

const connectors = [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
        chains, options: {
            qrcode: true,
        },
    }),
];

const getProviderByType = (provider, type) => {
    const providerHolder = provider.providerConfigs.find(p => p.provider.constructor.name === type);
    if (providerHolder) return providerHolder.provider;
}

export { WagmiConfig, createClient, chains, provider, connectors, getProviderByType };