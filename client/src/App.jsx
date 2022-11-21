import {
	Spacer,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useContractEvent, useContract, useProvider, useAccount } from "wagmi";
import Browser from "./components/Browser";
import Club from "./components/Club";
import Mint from "./components/Mint";
import StarNotary from "./contracts/StarNotary.json";
import { ConnectButton } from "./rainbowkit";
import getInfuraSDK from "./infura";
import { getProviderByType } from "./wagmi";
import { useNavigate } from "react-router-dom";
const { REACT_APP_ADDRESS, REACT_APP_SUPPORTED_CHAIN } = process.env;
const tabOrder = ["/browser", "/mint", "/club"];

const App = () => {
	const [stars, setStars] = useState([]);
	const [tabIndex, setTabIndex] = useState(0);
	const toast = useToast();
	const { address, isConnected } = useAccount();
	const navigate = useNavigate();

	const provider = useProvider({
		chainId: REACT_APP_SUPPORTED_CHAIN,
	});

	const notary = useContract({
		address: REACT_APP_ADDRESS,
		abi: StarNotary.abi,
		signerOrProvider: provider,
	});

	useContractEvent({
		address: REACT_APP_ADDRESS,
		abi: StarNotary.abi,
		eventName: "Transfer",
		listener(src, dst, tokenId) {
			toast({
				title: `${dst} registered a new star`,
				status: "info",
				description: `Star #${tokenId} was registered`,
				duration: 20000,
				isClosable: true,
			});
		},
	});

	const sdk = getInfuraSDK(getProviderByType(provider, "InfuraProvider")); //InfuraProvider StaticJsonRpcProvider

	const handleTabsChange = (index) => {
		setTabIndex(index);
		navigate(tabOrder[index]);
	};

	const isStarHolder = () => {
		return isConnected &&
			stars.find((star) => star.owner.toUpperCase() === address.toUpperCase())
			? true
			: false;
	};

	const processNFT = async (nft) => {
		const { metadata, tokenId } = nft;
		return notary.ownerOf(tokenId).then((owner) => {
			const star = { id: tokenId, owner };
			if (metadata) {
				star.name = metadata.name;
				star.description = metadata.description;
				star.image = metadata.image;
			} else {
				star.name = "Not available";
				star.description = "Error reading metadata";
			}
			return star;
		});
	};

	const loadStars = async () => {
		sdk
			.getNFTsForCollection({ contractAddress: REACT_APP_ADDRESS })
			.then(({ assets }) => {
				return assets.map(processNFT);
			})
			.then((promises) => Promise.all(promises))
			.then((stars) =>
				stars.sort((a, b) => {
					return a.id - b.id;
				})
			)
			.then(setStars);
	};

	function addToast(
		title,
		status = "success",
		description = "",
		duration = 2000,
		isClosable = true
	) {
		toast({
			title,
			status,
			description,
			duration,
			isClosable,
		});
	}

	useEffect(() => {
		if (address) {
			setTabIndex(tabOrder.indexOf(window.location.pathname));
		} else {
			navigate(tabOrder[0]);
		}
		loadStars()
			.then(() => addToast("List of stars successfully loaded."))
			.catch((e) => addToast("Error fetching stars", "error", e));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Tabs index={tabIndex} onChange={handleTabsChange}>
			<TabList>
				<Tab>Browser</Tab>
				<Tab isDisabled={!isConnected}>Mint</Tab>
				<Tab isDisabled={!isStarHolder()}>Club</Tab>
				<Spacer />
				<ConnectButton />
			</TabList>
			<TabPanels>
				<TabPanel>
					<Browser stars={stars} />
				</TabPanel>
				<TabPanel>
					<Mint />
				</TabPanel>
				<TabPanel>
					<Club />
				</TabPanel>
			</TabPanels>
		</Tabs>
	);
};

export default App;
