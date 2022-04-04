import { AppProps } from "next/app";
import Head from "next/head";
import { FC } from "react";
import { ContextProvider } from "../contexts/ContextProvider";
import { AppBar } from "../components/AppBar";
import Notifications from "../components/Notification";

import { useRouter } from "next/router";

require("@solana/wallet-adapter-react-ui/styles.css");
require("../styles/globals.css");
require("react-toastify/dist/ReactToastify.css");

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const router = useRouter();
	return (
		<>
			<Head>
				<title>Solana Scaffold Lite</title>
			</Head>

			<ContextProvider>
				<div className="flex flex-col min-h-screen bg-gray-50">
					{router.pathname !== "/" && <AppBar />}

					<Component {...pageProps} />
				</div>
			</ContextProvider>
		</>
	);
};

export default App;
