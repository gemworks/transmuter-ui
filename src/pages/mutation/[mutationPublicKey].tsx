import type { NextPage } from "next";
import Head from "next/head";
import { MutationView } from "../../views";
import { useRouter } from "next/router";
const Mutation: NextPage = (props) => {
	const router = useRouter();

	const { mutationPublicKey } = router.query;
	return (
		<div>
			<Head>
				<title>Mutation {mutationPublicKey}</title>
			</Head>
			<MutationView />
		</div>
	);
};

export default Mutation;
