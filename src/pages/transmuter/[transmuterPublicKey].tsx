import type { NextPage } from "next";
import Head from "next/head";
import { TransmuterView } from "../../views";
import { useRouter } from "next/router";
const Transmuters: NextPage = (props) => {
  const router = useRouter();

  const {transmuterPublicKey} = router.query;
  return (
    <div>
      <Head>
        <title>Transmuter {transmuterPublicKey}</title>

      </Head>
      <TransmuterView />
    </div>
  );
};

export default Transmuters;
