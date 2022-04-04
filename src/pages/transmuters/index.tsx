import type { NextPage } from "next";
import Head from "next/head";
import { TransmutersView } from "../../views";

const Transmuters: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>GemWorks - Transmuter</title>
        <meta name="og:title" content={`GemWorks - Transmuters`} key="ogtitle" />
				<meta name="description" content="GemWorks - Transmuters" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https:/transmuter.gg/transmuters" />
				<meta property="og:title" content={`GemWorks - Transmuters`} />
				<meta property="og:description" content="GemWorks - Transmuters" />
				{/* <meta property="og:image" content="/images/_.png" data-rh="true" /> */}

				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url" content="https:/transmuter.gg/transmuters" />
				<meta property="twitter:title" content={`GemWorks - Transmuters`} />
				<meta property="twitter:description" content="GemWorks - Transmuters" />
				{/* <meta property="twitter:image" content="/images/_.png" /> */}

      </Head>
      <TransmutersView />
    </div>
  );
};

export default Transmuters;
