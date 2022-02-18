// Next, React
import { FC, useEffect, useState } from "react";
import Link from "next/link";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Components
import { RequestAirdrop } from "../../components/RequestAirdrop";
import pkg from "../../../package.json";
import Slideover from "../../componnents/SlideOver"
// Store
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import useTransmuterStore from "../../stores/useTransmuterStore";
import { PlusIcon } from "@heroicons/react/solid";
// import { SolanaProvider } from "@saberhq/solana-contrib";
import { useRouter } from "next/router";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { MutationConfig, RequiredUnits, VaultAction, TakerTokenConfig } from "@gemworks/transmuter-ts";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {TransmuterSDK} from "@gemworks/transmuter-ts";
import { BN } from "@project-serum/anchor";
import { toBN } from "@gemworks/gem-farm-ts";


import {Transmutation} from "../utils/transmuter";

//existing transmuters
interface BankCardProps {
	banks: PublicKey[];
}
export function BankCard({ banks }: BankCardProps) {
	return (
		<ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-6 xl:gap-x-8">
			{banks.map((item, index) => (
				<li key={index} className="relative">
				
						<div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-gray-200 text-gray-500 hover:opacity-75 focus-within:ring-2  transiton-all duration-150 ease-in focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
							<h2 className="pl-4 pt-4 text-lg font-semibold">Bank {index}</h2>
							<button type="button" className="absolute inset-0 focus:outline-none">
								<span className="sr-only">View details for Bank</span>
							</button>
						</div>
		
				</li>
			))}
		</ul>
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

export const TransmuterView: FC = ({}) => {
	const wallet = useWallet();
	const { connection } = useConnection();
	const router = useRouter();
	const { transmuterPublicKey } = router.query;
	const { initSDK } = useTransmuterStore();
	const sdk = useTransmuterStore((s) => s.sdk);

	const [transmuter, setTransmuter] = useState<Transmutation>({});
	const [banks, setBanks] = useState<PublicKey[]>([]);

	const [open, setOpen] = useState(false);
	

	function toggleOpen(): void {
		if (open) {
			setOpen(false);
		} else {
			setOpen(true);
		}
	}

	useEffect(() => {
		if (wallet.publicKey && sdk === null) {
			initSDK(wallet, connection);
		}
	}, [wallet.publicKey, connection]);


	useEffect(() => {
		if (sdk) {
			getTransmuter(sdk);
		}
	}, [sdk])


	async function getTransmuter(sdk_: TransmuterSDK) {
		const transmuterPk = new PublicKey(transmuterPublicKey);
		const res = await sdk_.programs.Transmuter.account.transmuter.fetch(transmuterPk);
		setTransmuter(res);
		setBanks([transmuter.bankA, transmuter.bankB, transmuter.bankC]);
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


	return (
		<div className="py-10">
			<Slideover
			open={open}
			toggleState={() => toggleOpen() }
			/>
			<header>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-bold leading-tight text-gray-900">Transmuter {transmuterPublicKey}</h1>

					<button
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

					<BankCard banks={banks}/>
				</div>
			</main>
		</div>
	);
};
