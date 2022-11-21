import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { WagmiConfig, chains, provider, createClient } from "./wagmi";
import { RainbowKitProvider, connectors } from "./rainbowkit";
import { ChakraProvider } from "@chakra-ui/react";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

const browser = <App tab="browser" />;
const mint = <App tab="mint" />;
const club = <App tab="club" />;
const redirect = <Navigate to="/browser" />;
const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
	<React.StrictMode>
		<ChakraProvider>
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider chains={chains} modalSize="compact">
					<BrowserRouter>
						<Routes>
							<Route path="/browser" element={browser}></Route>
							<Route path="/mint" element={mint}></Route>
							<Route path="/club" element={club}></Route>
							<Route path="*" element={redirect}></Route>
						</Routes>
					</BrowserRouter>
				</RainbowKitProvider>
			</WagmiConfig>
		</ChakraProvider>
	</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
