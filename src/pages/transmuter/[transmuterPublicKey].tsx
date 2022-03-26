import type { NextPage } from "next";
import Head from "next/head";
import { TransmuterView } from "../../views";
import { useRouter } from "next/router";
import { formatPublickey } from "../../utils/helpers";
const Transmuter: NextPage = (props) => {
	const router = useRouter();

	let { transmuterPublicKey } = router.query;
	transmuterPublicKey = transmuterPublicKey as string;
	return (
		<div>
			<Head>
				<title>Transmuter {transmuterPublicKey}</title>
				<meta name="og:title" content={`GemWorks - Transmuter ${formatPublickey(transmuterPublicKey)}`} key="ogtitle" />
				<meta name="description" content="GemWorks - Transmuter   ${formatPublickey(transmuterPublicKey)}" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https:/transmuter.gg/transmuters" />
				<meta property="og:title" content={`GemWorks - Transmuter ${formatPublickey(transmuterPublicKey)}`} />
				<meta property="og:description" content={`GemWorks - Transmuter ${formatPublickey(transmuterPublicKey)}`} />
				{/* <meta property="og:image" content="/images/_.png" data-rh="true" /> */}

				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url" content="https:/transmuter.gg/transmuters" />
				<meta property="twitter:title" content={`GemWorks - Transmuter ${formatPublickey(transmuterPublicKey)}`} />
				<meta property="twitter:description" content={`GemWorks - Transmuter ${formatPublickey(transmuterPublicKey)}`} />
				{/* <meta property="twitter:image" content="/images/_.png" /> */}
			</Head>
			<TransmuterView />
		</div>
	);
};

export default Transmuter;
