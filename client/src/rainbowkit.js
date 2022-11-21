import '@rainbow-me/rainbowkit/styles.css';
import {
    connectorsForWallets,
    RainbowKitProvider,
    ConnectButton,
} from '@rainbow-me/rainbowkit';
import {
    injectedWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import {
    chain
} from 'wagmi';

const { REACT_APP_SUPPORTED_CHAIN } = process.env;

// eslint-disable-next-line eqeqeq
const supportedChain = Object.keys(chain).find(x => chain[x].id == REACT_APP_SUPPORTED_CHAIN);

const chains = [chain[supportedChain]];

const connectors = connectorsForWallets([
    {
        groupName: 'Supported',
        wallets: [
            injectedWallet({ chains }),
            walletConnectWallet({ chains }),
        ],
    },
]);

export { connectors, RainbowKitProvider, ConnectButton };