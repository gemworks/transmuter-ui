import type { NextPage } from "next";
import Head from "next/head";
import { MutationView } from "../../views";
import { useRouter } from "next/router";
import { formatPublickey } from "../../utils/helpers";
const Mutation: NextPage = (props) => {
	const router = useRouter();

	let { mutationPublicKey } = router.query;
	mutationPublicKey = mutationPublicKey as string;
	return (
		<div>
			<Head>
				<title>Mutation {mutationPublicKey}</title>
				<meta name="og:title" content={`GemWorks - Mutation ${formatPublickey(mutationPublicKey)}`} key="ogtitle" />
				<meta name="description" content={`GemWorks - Mutation ${formatPublickey(mutationPublicKey)}`} />
				<meta property="og:type" content="website" />
				<meta property="og:url" content={`https:/transmuter.gg/mutation/${mutationPublicKey}`} />
				<meta property="og:title" content={`GemWorks - Mutation ${formatPublickey(mutationPublicKey)}`} />
				<meta property="og:description" content={`GemWorks - Mutation ${formatPublickey(mutationPublicKey)}`} />
				{/* <meta property="og:image" content="/images/_.png" data-rh="true" /> */}

				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url"content={`https:/transmuter.gg/mutation/${mutationPublicKey}`} />
				<meta property="twitter:title" content={`GemWorks - Mutation ${formatPublickey(mutationPublicKey)}`} />
				<meta property="twitter:description" content={`GemWorks - Mutation ${formatPublickey(mutationPublicKey)}`} />
				{/* <meta property="twitter:image" content="/images/_.png" /> */}
			</Head>
			<MutationView />
		</div>
	);
};

export default Mutation;
