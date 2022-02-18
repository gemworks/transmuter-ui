import type { NextPage } from "next";
import Head from "next/head";
import { TransmutersView } from "../../views";

const Transmuters: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Solana Transmuters</title>

      </Head>
      <TransmutersView />
    </div>
  );
};

export default Transmuters;
