// Next, React
import { FC, useEffect, useState } from "react";
import Link from "next/link";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Components
import { RequestAirdrop } from "../../components/RequestAirdrop";
import pkg from "../../../package.json";
import Slideover from "../../components/SlideOver"
// Store
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import useTransmuterStore from "../../stores/useTransmuterStore";
import useGembankStore from "../../stores/useGembankStore";




import { PlusIcon } from "@heroicons/react/solid";
// import { SolanaProvider } from "@saberhq/solana-contrib";
import { useRouter } from "next/router";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { MutationConfig, RequiredUnits, VaultAction, TakerTokenConfig } from "@gemworks/transmuter-ts";
import { PublicKey } from "@solana/web3.js";
import { TransmuterSDK, TransmuterWrapper } from "@gemworks/transmuter-ts";
import { BN } from "@project-serum/anchor";
import { toBN } from "@gemworks/gem-farm-ts";


//existing transmuters
interface BankCardProps {
	bank: string;
	setBank: () => void;

}
export function BankCard({ bank, setBank }: BankCardProps) {






	return (

		<li className="relative">

			<div
				onClick={setBank}
				className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-200 text-gray-500 hover:opacity-75 focus-within:ring-2  transiton-all duration-150 ease-in focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
				<h2 className="pl-4 pt-4 text-lg font-semibold">Bank {bank}</h2>
				<button type="button" className="absolute inset-0 focus:outline-none">
					<span className="sr-only">View details for Bank</span>
				</button>
			</div>

		</li>

	);
}

//create new transmuter

export function CreateTransmuterCard() {
	return (
		<Link href={`/transmuter/create`}>
			{/* <div className="text-center group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-indigo-500 text-indigo-50 hover:opacity-75 focus-within:ring-2  transiton-all duration-150 ease-in focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">

            <h2 className="pl-4 pt-4 text-md break-words font-semibold">Create New Transmuter </h2>
      
            <button type="button" className="absolute inset-0 focus:outline-none">
              <span className="sr-only">View details for </span>
            </button>
          </div> */}
			<button
				type="button"
				className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
			>
				<PlusIcon className=" mr-3 h-10 w-10" aria-hidden="true" />
				Create New Transmuter
			</button>
		</Link>
	);
}

export const TransmuterView: FC = ({ }) => {
	const wallet = useWallet();
	const { connection } = useConnection();
	const router = useRouter();
	const { transmuterPublicKey } = router.query;
	const { initTransmuterClient } = useTransmuterStore();
	const transmuterClient = useTransmuterStore((s) => s.transmuterClient);
	const gemBankClient = useGembankStore((s) => s.gemBankClient);
	const { initGemBankClient } = useGembankStore();

	const [transmuterWrapper, setTransmuterWrapper] = useState<TransmuterWrapper>(null);
	const [banks, setBanks] = useState<string[]>([]);
	const [bank, setBank] = useState<string>();

	const [open, setOpen] = useState(false);

	function toggleOpen(): void {
		if (open) {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}

	useEffect(() => {
		if (wallet.publicKey && transmuterClient === null) {
			initTransmuterClient(wallet, connection);
			initGemBankClient(wallet, connection);


		}
	}, [wallet.publicKey, connection]);


	useEffect(() => {
		if (transmuterClient) {
			getTransmuter(transmuterClient);

		}
	}, [transmuterClient])


	async function getTransmuter(sdk_: TransmuterSDK) {
		const transmuterPk = new PublicKey(transmuterPublicKey);
		const data = await sdk_.programs.Transmuter.account.transmuter.fetch(transmuterPk);
		const { bankA, bankB, bankC } = data;

		//WRAPPER
		const transmuterWrapper_ = new TransmuterWrapper(
			sdk_,
			transmuterPk,
			bankA,
			bankB,
			bankC,
			data
		);
		// const x = await wrapper.reloadData();


		setTransmuterWrapper(transmuterWrapper_);

		setBanks([bankA.toBase58(), bankB.toBase58(), bankC.toBase58()]);


	}




	async function initClient() {
		const bankPk = new PublicKey("AwDPzG9rSPyeHh8TgXdteMY4tFQghF8CvtVe1eZ2bQnu");
		const res = await gemBankClient.bankProgram.account.bank.fetch(bankPk);
		console.log("bank Account: ", res);

		const res_two = await gemBankClient.fetchAllWhitelistProofPDAs(bankPk);
		console.log("whitelist pdas", res_two);
	}

	// async function getMutations(sdk_: any) {
	// 	const transmuter = new PublicKey(transmuterPublicKey);
	// 	const accounts = await sdk_.programs.Transmuter.account.mutation.fetch(transmuter);
	// 	console.log("accounts",accounts);

	// 	// const transmuters = accounts.filter((account) => account.account.owner.toBase58() == wallet.publicKey.toBase58());
	// 	// setTransmuters(transmuters);
	// }

	// async function initMutaton_() {
	// 	const config = {
	// 		takerTokenA:
	// 		makerTokenA:
	// 	}
	// 	const res = await sdk.initMutation(
	// 		"",
	// 		transmuter: new PublicKey(transmuterPublicKey),
	// 		10,

	// 		)
	// }





	//@TODO 
	//		get the bank using its PK []
	//		bank []


	return (
		<div className="py-10">
			<Slideover
				open={open}
				bankPk={bank}
				transmuterWrapper={transmuterWrapper}
				toggleState={() => { toggleOpen() }}
				addToWhitelist={() => { }}
				removeFromWhitelist={() => { }}
				addRarities={() => { }}
			/>
			<header>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-bold leading-tight text-gray-900">Transmuter {transmuterPublicKey}</h1>

					<button
						onClick={() => {
							toggleOpen();
						}}
						type="button"
						className="mt-10 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
						Button text
					</button>
				</div>
			</header>
			<main>
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					{/* Replace with your content */}
					<h2 className="text-xl font-bold leading-tight text-gray-700">Banks</h2>

					<ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-6 xl:gap-x-8">

						{banks.map((bank, index) => (
							<BankCard bank={bank} key={index} setBank={() => { setBank(bank), toggleOpen() }} />
						))}
					</ul>

				</div>
			</main>
		</div>
	);
};
