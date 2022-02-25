// Next, React
import { FC, useEffect, useState } from "react";
import Link from "next/link";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Components
import { RequestAirdrop } from "../../components/RequestAirdrop";
import pkg from "../../../package.json";
import Slideover from "../../components/BankSidebar"
import TransferOwnership from "../../components/TransferOwnership";
import CreateMutationSidebar from "../../components/CreateMutationSidebar";
// Store
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import useTransmuterStore from "../../stores/useTransmuterStore";
import useGembankStore from "../../stores/useGembankStore";

import {prepareMutation} from "../../utils/mutations";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

import { PlusIcon, UsersIcon,  PlusSmIcon as PlusSmIconSolid } from "@heroicons/react/solid";
// import { SolanaProvider } from "@saberhq/solana-contrib";
import { useRouter } from "next/router";
import { SolanaProvider } from "@saberhq/solana-contrib";
import { MutationConfig, RequiredUnits, VaultAction, TakerTokenConfig, TransmuterSDK, TransmuterWrapper } from "@gemworks/transmuter-ts";
import { BN } from "@project-serum/anchor";
import { toBN } from "@gemworks/gem-farm-ts";
import BankSidebar from "../../components/BankSidebar";


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

	const [openBank, setOpenBank] = useState(false);
	const [openMutation, setMutation] = useState(true);
	const [mutationDraft, setMutationDraft] = useState(false);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [transmuterOwner, setTransmuterOwner] = useState<PublicKey>();


	const [mutations, setMutations] = useState<any[]>([]);

	function toggleMutation(): void {
		if (openMutation) {
			setMutation(false);
		} else {
			setMutation(true);
		}
	}
	function toggleBank(): void {
		if (openBank) {
			setOpenBank(false);
			if (mutationDraft) {
				setMutation(true);
			}
		} else {
			setOpenBank(true);
		}
	}

	function toggleModalOpen(): void {
		if (modalIsOpen) {
			setModalIsOpen(false);
		} else {
			setModalIsOpen(true);
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
			getMutationsByTransmuter(transmuterClient);

		}
	}, [transmuterClient])


	async function getTransmuter(transmuterClient: TransmuterSDK) {
		const transmuterPk = new PublicKey(transmuterPublicKey);
		const data = await transmuterClient.programs.Transmuter.account.transmuter.fetch(transmuterPk);
		const { bankA, bankB, bankC, owner } = data;
		console.log(wallet.publicKey.toBase58())
		console.log(owner.toBase58())
		setTransmuterOwner(owner);
		//WRAPPER
		const transmuterWrapper_ = new TransmuterWrapper(
			transmuterClient,
			transmuterPk,
			bankA,
			bankB,
			bankC,
			data
		);
		

		setTransmuterWrapper(transmuterWrapper_);

		setBanks([bankA.toBase58(), bankB.toBase58(), bankC.toBase58()]);


	}
	async function getMutationsByTransmuter(transmuterClient: TransmuterSDK) {
		const accounts = await transmuterClient.programs.Transmuter.account.mutation.all();
		const mutations = accounts.filter((account) => account.account.transmuter.toBase58() == transmuterPublicKey);
		// let {name} = mutations[2].account;
		// const str = String.fromCharCode.apply(null, new Uint8Array(name));
		setMutations(mutations);
		console.log(mutations)
	
		

	


	}
	


	async function createMutation() {
		try {
			await prepareMutation({
				sdk: transmuterClient,
				transmuter: transmuterWrapper,
				mutationName: "Solantasy Swap",
				owner: wallet.publicKey,
				vaultAction: VaultAction.Lock,
				mutationDurationSec: toBN(0),
				reversible: false, 
				uses: toBN(3),
				reversalPriceLamports: toBN(LAMPORTS_PER_SOL),
				makerMintA: new PublicKey("4LcBQBVK9Y2DMc2n9hbrY16hLzzpqucDCe3p4UFqLCku"),
				makerMintB: new PublicKey("DoPnWBVs8eHcCBPWnjeqhUATAekyAnmZXP8Sjn1Ma297"),
				// makerMintC: new PublicKey("DgUQD9WkJAfW1WDfHNKo6RiT58FZiosCKPgRfA9Xx59Z"),
				takerTokenB: {
					gemBank: transmuterWrapper.bankB,
					requiredAmount: toBN(5000),
					requiredUnits: RequiredUnits.RarityPoints,
					vaultAction: VaultAction.Lock
				},
				takerTokenC: {
					gemBank: transmuterWrapper.bankC,
					requiredAmount: toBN(5000),
					requiredUnits: RequiredUnits.RarityPoints,
					vaultAction: VaultAction.Lock
				},
				makerTokenAmount: toBN(15000),
				takerTokenAmount: toBN(5000),
				makerTokenAmountPerUse: toBN(5000),
				makerTokenBAmountPerUse: toBN(5000),
				// makerTokenCAmountPerUse: toBN(5000),
			
				
			});
		} catch(err) {
			console.log("ERROR", err)
		}
	}

	return (
		<div className="py-10">
			<BankSidebar
				open={openBank}
				bankPk={bank}
				isTransmuterOwner={transmuterOwner?.toBase58() === wallet.publicKey?.toBase58()}
				transmuterWrapper={transmuterWrapper}
				toggleState={() => { toggleBank() }}
				addToWhitelist={() => { }}
				removeFromWhitelist={() => { }}
				addRarities={() => { }}
			/>
			<CreateMutationSidebar
				banks={banks}
				open={openMutation}
				setBank={setBank}
				openBank={() => {	setOpenBank(true); setMutation(false); setMutationDraft(true)}}
				toggleState={() => toggleMutation()}
			/>
			<TransferOwnership
			transmuterWrapper={transmuterWrapper}
			isOpen={modalIsOpen}
			toggleModal={() => {toggleModalOpen()}}
			/>
			<header>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="space-y-2">
					<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${transmuterOwner?.toBase58() === wallet.publicKey?.toBase58() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
        {transmuterOwner?.toBase58() === wallet.publicKey?.toBase58()  ? "You're Transmuter Owner" : "Not the Transmuter Owner"}
      </span>
					<h1 className="text-2xl font-bold leading-tight text-gray-900">Transmuter {transmuterPublicKey}</h1>

					</div>



					{transmuterOwner?.toBase58() === wallet.publicKey?.toBase58() && (
		<button
		onClick={() => {		toggleModalOpen();}}
type="button"
className="leading-4 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-150 ease-in"
>
<UsersIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
Transfer Ownership
</button>
					)}
			
			
				</div>
			</header>
			<main>
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					{/* Replace with your content */}
					<h2 className="text-xl font-bold leading-tight text-gray-700">Banks</h2>

					<ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-6 xl:gap-x-8">

						{banks.map((bank, index) => (
							<BankCard bank={bank} key={index} setBank={() => { setBank(bank), toggleBank() }} />
						))}
					</ul>

					<h2 className="text-xl font-bold leading-tight text-gray-700">Mutations</h2>
					{transmuterOwner?.toBase58() === wallet.publicKey?.toBase58() && (
					<button
					onClick={() => {	toggleMutation()}}
        type="button"
        className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in"
      >
        <PlusSmIconSolid className="h-5 w-5" aria-hidden="true" />
      </button>
					)}
				</div>
			</main>
		</div>
	);
};
