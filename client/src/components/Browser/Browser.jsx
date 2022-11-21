import {
	Box,
	Card,
	CardBody,
	CardHeader,
	Heading,
	HStack,
	Image,
	Tag,
	Text,
	VStack,
	Flex,
	Spacer,
	Badge,
	Switch,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useAccount } from "wagmi";

export const Browser = ({ stars }) => {
	const { address } = useAccount();

	const [onlyOwner, setOnlyOwner] = useState(false);

	return (
		<>
			<VStack width="50%" margin="auto">
				<HStack alignContent="center" width="100%">
					<Heading>Currently sighted stars</Heading>
					<Spacer />
					<Text>Owned only</Text>
					<Switch
						onChange={({ target }) => setOnlyOwner(target.checked)}
						isDisabled={!address}
					/>
				</HStack>
				{stars &&
					stars.map((star) => (
						<Card
							width="100%"
							key={star.id}
							display={
								onlyOwner && star.owner.toUpperCase() !== address.toUpperCase()
									? "none"
									: "inherit"
							}
						>
							<CardHeader alignItems="center">
								<HStack alignItems="center">
									<Box w="40px">
										<Tag>{star.id}</Tag>
									</Box>
									<Box>
										<Heading size="lg">{star.name}</Heading>
									</Box>
								</HStack>
							</CardHeader>
							<CardBody>
								<HStack gap="10px">
									<Image
										boxSize="100px"
										src={star.image}
										fallbackSrc="/star.png"
										alt={
											star.image
												? "Star icons created by Freepik - Flaticon"
												: "Star icons created by mim_studio - Flaticon"
										}
									/>
									<Text as="b">{star.description}</Text>
								</HStack>
								<Flex>
									<Spacer />
									<Badge textAlign="right">{star.owner}</Badge>
								</Flex>
							</CardBody>
						</Card>
					))}
			</VStack>
		</>
	);
};
