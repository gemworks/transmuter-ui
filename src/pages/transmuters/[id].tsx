import type { NextPage } from "next";
import Head from "next/head";
import { TransmuterView } from "../../views";
import { useRouter } from "next/router";
const Transmuters: NextPage = (props) => {
    const router = useRouter();

    const {id} = router.query;
  return (
    <div>
      <Head>
        <title>Solana Transmuters</title>

      </Head>
        <div>
           <h1 className="text-gray-900">id: {id}</h1> 
        </div>
    </div>
  );
};

export default Transmuters;
