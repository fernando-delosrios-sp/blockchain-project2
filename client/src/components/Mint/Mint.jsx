import {
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormHelperText,
	FormLabel,
	Heading,
	Input,
	useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useContract, useSigner } from "wagmi";
import StarNotary from "../../contracts/StarNotary.json";
import { generateTokenURI } from "../../pinata";
const { REACT_APP_ADDRESS } = process.env;
const DEFAULT_MESSAGE = "This name will appear forever in the blockchain.";

export const Mint = () => {
	const toast = useToast();
	const { data: signer } = useSigner();
	const [name, setName] = useState("");
	const [message, setMessage] = useState(DEFAULT_MESSAGE);
	const notary = useContract({
		address: REACT_APP_ADDRESS,
		abi: StarNotary.abi,
		signerOrProvider: signer,
	});

	const invalidName = name === "";

	const handleNameChange = (e) => setName(e.target.value);

	const sendSuccess = (message) => {
		toast({
			title: message,
			status: "success",
			duration: 2000,
			isClosable: true,
		});
	};

	const sendError = (message) => {
		toast({
			title: message,
			status: "error",
			description: "There was an error registering star",
			duration: 2000,
			isClosable: true,
		});
	};

	const handleSubmit = async (e) => {
		setMessage("Building metadata...");
		generateTokenURI(name).then((uri) => {
			setMessage(uri);
			notary
				.createStar(uri)
				.then(() => sendSuccess("Star registered successfully"))
				.catch(({ reason }) => {
					sendError(reason);
				})
				.finally(() => setMessage(DEFAULT_MESSAGE));
		});
		e.preventDefault();
	};

	useEffect(() => {}, []);

	return (
		<FormControl isInvalid={invalidName} width="50%" margin="auto">
			<Heading size="lg" marginBottom={5} textAlign="center">
				Submit a new star
			</Heading>
			<FormLabel>Name</FormLabel>
			<Flex gap={2}>
				<Input type="text" value={name} onChange={handleNameChange} />
				<Button isDisabled={invalidName} onClick={handleSubmit}>
					Submit
				</Button>
			</Flex>
			{!invalidName ? (
				<FormHelperText>{message}</FormHelperText>
			) : (
				<FormErrorMessage>Your star needs a name.</FormErrorMessage>
			)}
		</FormControl>
	);
};
