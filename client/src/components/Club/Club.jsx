import React from "react";

import { Heading, Image, VStack } from "@chakra-ui/react";

export const Club = () => {
	return (
		<VStack width="50%" margin="auto">
			<Heading size="lg">Congratulations!</Heading>
			<Heading size="md">You're part of the stargazers club</Heading>
			<Image paddingTop="50px" src="/nyan-cat.gif" />
		</VStack>
	);
};
