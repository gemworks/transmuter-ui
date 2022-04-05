// Next, React
import { FC, useEffect, useState } from "react";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { ToastContainer, toast } from "react-toastify";
// Components
import TransferTransmuterOwnership from "../../components/TransferTransmuterOwnership";
import CreateMutationSidebar from "../../components/CreateMutationSidebar";
import ManageMutation from "../../components/ManageMutation";
// Store
import useTransmuterStore from "../../stores/useTransmuterStore";
import { PublicKey } from "@solana/web3.js";
import { UsersIcon, PlusSmIcon as PlusSmIconSolid, LibraryIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { TransmuterSDK, TransmuterWrapper } from "@gemworks/transmuter-ts";
import BankSidebar from "../../components/BankSidebar";
import { formatPublickey, parseString } from "../../utils/helpers";
import { useCopyToClipboard } from "usehooks-ts";
import { Transition } from "@headlessui/react";
import { BeakerIcon } from "@heroicons/react/outline";
import SkeletonGridCards from "../../components/SkeletonGridCards";

//existing transmuters
interface BankCardProps {
	bank: { publicKey: string; letter: string };
	setBank: () => void;
}
export function BankCard({ bank, setBank }: BankCardProps) {
	return (
		<li className="relative">
			<div
				onClick={setBank}
				className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-white shadow-sm   hover:opacity-75 focus-within:ring-2  transiton-all duration-150 ease-in focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden"
			>
				<div className="p-4">
					<div className="flex justify-center">
						<LibraryIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
					</div>
					<h3 className="text-sm my-0.5 font-medium text-gray-500 truncate">Bank {bank.letter}</h3>
					<h2 className=" font-semibold text-gray-900">{formatPublickey(bank.publicKey)}</h2>
				</div>

				<button type="button" className="absolute inset-0 focus:outline-none">
					<span className="sr-only">View details for Bank</span>
				</button>
			</div>
		</li>
	);
}

export const TransmuterView: FC = ({}) => {
	const wallet = useWallet();
	const { connection } = useConnection();
	const router = useRouter();
	const { transmuterPublicKey } = router.query;

	const { initTransmuterClient } = useTransmuterStore();
	const transmuterClient = useTransmuterStore((s) => s.transmuterClient);
	const [transmuterWrapper, setTransmuterWrapper] = useState<TransmuterWrapper>(null);
	const [banks, setBanks] = useState<{ publicKey: string; letter: string }[]>([]);
	const [bank, setBank] = useState<string>();

	const [openBank, setOpenBank] = useState(false);
	const [openMutation, setMutation] = useState(false);
	const [mutationDraft, setMutationDraft] = useState(false);
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [transmuterOwner, setTransmuterOwner] = useState<PublicKey>();

	const [openMutationManager, setOpenMutationManager] = useState(false);
	const [selectedMutation, setSelectedMutation] = useState<any>(null);
	const [selectedMutationPk, setSelectedMutationPk] = useState<PublicKey>();
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingTwo, setIsLoadingTwo] = useState(false);

	const [mutations, setMutations] = useState<any[]>([]);
	const [clipBoardValue, copyToClipboard] = useCopyToClipboard();
	const [showItem, setShowItem] = useState(false);
	function toggleMutationManager(): void {
		if (openMutationManager) {
			setOpenMutationManager(false);
		} else {
			setOpenMutationManager(true);
		}
	}
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
		setIsLoading(true);
		if (wallet.publicKey) {
			initTransmuterClient(wallet, connection);
		}
	}, [wallet.publicKey, connection]);

	useEffect(() => {
		if (transmuterClient && transmuterPublicKey && wallet.publicKey) {
			getTransmuter(transmuterClient);
			getMutationsByTransmuter(transmuterClient);

			setIsLoading(false);
		}
	}, [transmuterClient, connection, wallet.publicKey]);

	async function getTransmuter(transmuterClient: TransmuterSDK) {
		const transmuterPk = new PublicKey(transmuterPublicKey);
		const data = await transmuterClient.programs.Transmuter.account.transmuter.fetch(transmuterPk);
		const { bankA, bankB, bankC, owner } = data;

		setTransmuterOwner(owner);
		//WRAPPER
		const transmuterWrapper_ = new TransmuterWrapper(transmuterClient, transmuterPk, bankA, bankB, bankC, data);
		setTransmuterWrapper(transmuterWrapper_);

		setBanks([
			{ publicKey: bankA.toBase58(), letter: "A" },
			{ publicKey: bankB.toBase58(), letter: "B" },
			{ publicKey: bankC.toBase58(), letter: "C" },
		]);
	}
	async function getMutationsByTransmuter(transmuterClient: TransmuterSDK, loading?: boolean) {
		if (loading) {
			setIsLoadingTwo(true);
		}
		const accounts = await transmuterClient.programs.Transmuter.account.mutation.all();
		const mutations = accounts.filter((account) => account.account.transmuter.toBase58() == transmuterPublicKey);

		setMutations(mutations);
		if (loading) {
			setIsLoadingTwo(false);
		}
	}

	function getBankLetter(bankPk: string): string {
		const bank = banks.find((item) => item.publicKey === bankPk);
		if (bank) {
			return bank.letter;
		}
		return "";
	}

	return (
		<div className="py-10">
			<ToastContainer theme="colored" />
			<BankSidebar
				open={openBank}
				bankPk={bank}
				bankLetter={getBankLetter(bank)}
				isTransmuterOwner={transmuterOwner?.toBase58() === wallet.publicKey?.toBase58()}
				transmuterWrapper={transmuterWrapper}
				toggleState={() => {
					toggleBank();
				}}
				addToWhitelist={() => {}}
				removeFromWhitelist={() => {}}
				addRarities={() => {}}
			/>
			<CreateMutationSidebar
				banks={banks}
				open={openMutation}
				setBank={setBank}
				openBank={() => {
					setOpenBank(true);
					setMutation(false);
					setMutationDraft(true);
				}}
				getMutationsByTransmuter={() => {
					getMutationsByTransmuter(transmuterClient, true);
				}}
				transmuterWrapper={transmuterWrapper}
				toggleState={() => toggleMutation()}
			/>
			<TransferTransmuterOwnership
				transmuterWrapper={transmuterWrapper}
				isOpen={modalIsOpen}
				toggleModal={() => {
					toggleModalOpen();
				}}
			/>
			<ManageMutation
				mutationData={selectedMutation}
				mutationPublicKey={selectedMutationPk}
				transmuterWrapper={transmuterWrapper}
				open={openMutationManager}
				getMutationsByTransmuter={() => {
					getMutationsByTransmuter(transmuterClient, true);
				}}
				toggleState={() => toggleMutationManager()}
			/>
			<header>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="space-y-1">
						{isLoading ? (
							<div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-200 w-20 text-gray-200 animate-pulse ">
								gm
							</div>
						) : (
							<span
								className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
									transmuterOwner?.toBase58() === wallet.publicKey?.toBase58() ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
								}`}
							>
								{transmuterOwner?.toBase58() === wallet.publicKey?.toBase58() ? "You're the Owner" : "Not the Owner"}
							</span>
						)}

						<div>
							<h2 className="text-lg font-medium text-gray-500 truncate ">Transmuter</h2>
							<Transition
								show={showItem}
								enter="transform ease-out duration-500 transition origin-bottom"
								enterFrom="scale-95 translate-y-0.5 opacity-0"
								enterTo="scale-100 translate-y-0 opacity-100"
								leave="transition ease-in duration-100"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<span className="absolute inset-x-0 bottom-full mb-2 flex">
									<span className="bg-gray-900 text-white rounded-md text-[0.625rem] leading-4 tracking-wide font-semibold uppercase py-1 px-3 filter drop-shadow-md">
										<svg
											aria-hidden="true"
											width="16"
											height="6"
											viewBox="0 0 16 6"
											className="text-gray-900 absolute top-full left-1/2 -mt-px -ml-2 "
										>
											<path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M15 0H1V1.00366V1.00366V1.00371H1.01672C2.72058 1.0147 4.24225 2.74704 5.42685 4.72928C6.42941 6.40691 9.57154 6.4069 10.5741 4.72926C11.7587 2.74703 13.2803 1.0147 14.9841 1.00371H15V0Z"
												fill="currentColor"
											></path>
										</svg>
										Copied!
									</span>
								</span>
							</Transition>
							<h1
								className="text-2xl font-semibold text-gray-900 uppercase hover:opacity-75 transition-all duration-150 ease-in cursor-pointer w-64"
								onClick={() => {
									setShowItem(true);

									copyToClipboard(transmuterPublicKey as string);
									setTimeout(() => {
										setShowItem(false);
									}, 500);
								}}
							>
								{formatPublickey(transmuterPublicKey as string)}
							</h1>
						</div>
					</div>

					{transmuterOwner?.toBase58() === wallet.publicKey?.toBase58() && (
						<div className="flex space-x-4 my-4">
							<button
								onClick={() => {
									toggleModalOpen();
								}}
								disabled={isLoading}
								type="button"
								className="leading-4 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-500 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-150 ease-in disabled:opacity-75 disabled:cursor-not-allowed"
							>
								<UsersIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
								Transfer Ownership
							</button>
						</div>
					)}
				</div>
			</header>
			<main>
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					<h2 className="text-xl font-bold leading-tight text-gray-700 mb-4">Banks</h2>
					{isLoading ? (
						<SkeletonGridCards numberOfCards={3} showCard={isLoading} />
					) : (
						<ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-6 xl:gap-x-8">
							{banks.map((bank, index) => (
								<BankCard
									bank={bank}
									key={index}
									setBank={() => {
										setBank(bank.publicKey), toggleBank();
									}}
								/>
							))}
						</ul>
					)}

					<h2 className="text-xl font-bold leading-tight text-gray-700 my-4">Mutations</h2>
					{transmuterOwner?.toBase58() === wallet.publicKey?.toBase58() && (
						<button
							onClick={() => {
								toggleMutation();
							}}
							type="button"
							disabled={isLoading}
							className="leading-4 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all duration-150 ease-in mb-4 disabled:opacity-75 disabled:cursor-not-allowed"
						>
							<PlusSmIconSolid className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
							Create Mutation
						</button>
					)}
					{isLoading || isLoadingTwo ? (
						<SkeletonGridCards numberOfCards={5} showCard={isLoading} />
					) : (
						<>
							{mutations.length > 0 ? (
								<ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-6 xl:gap-x-8">
									{mutations.map((mutation, index) => (
										<li
											key={index}
											onClick={() => {
												setSelectedMutation(mutation.account);
												setSelectedMutationPk(mutation.publicKey);
												if (selectedMutation !== null) {
													toggleMutationManager();
												}
											}}
											className="relative"
										>
											<div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-white shadow-sm   hover:opacity-75 focus-within:ring-2  transiton-all duration-150 ease-in focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
												<div className="p-4">
													<div className="flex justify-center">
														<BeakerIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
													</div>
													<h3 className="text-sm my-0.5 font-medium text-gray-500 truncate">
														{formatPublickey(mutation.publicKey.toBase58())}
													</h3>

													<h2 className=" font-semibold text-gray-900 uppercase">{parseString(mutation.account.name)}</h2>
												</div>

												<button type="button" className="absolute inset-0 focus:outline-none">
													<span className="sr-only">View details for Mutation</span>
												</button>
											</div>
										</li>
									))}
								</ul>
							) : (
								<button
									type="button"
									onClick={() => {
										toggleMutation();
									}}
									className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									<BeakerIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
									<span className="mt-2 block text-sm font-medium text-gray-900">Create a new Mutation</span>
								</button>
							)}{" "}
						</>
					)}
				</div>
			</main>
		</div>
	);
};
