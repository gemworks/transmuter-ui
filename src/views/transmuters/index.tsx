// Next, React
import { FC, useEffect, useState } from "react";
import Link from "next/link";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Store
import { PlusSmIcon as PlusSmIconSolid, LibraryIcon } from "@heroicons/react/outline";
import useTransmuterStore from "../../stores/useTransmuterStore";
import { TransmuterSDK } from "@gemworks/transmuter-ts";
import { formatPublickey } from "../../utils/helpers";
import { ToastContainer, toast } from "react-toastify";
import SkeletonGridCards from "../../components/SkeletonGridCards";
interface TransmuterCardProps {
	items: any[];
}
export function TransmuterCard({ items }: TransmuterCardProps) {
	return (
		<ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6 lg:grid-cols-6 xl:gap-x-8">
			{items.map((item, index) => (
				<li className="relative" key={index}>
					<Link href={`/transmuter/${item?.publicKey.toBase58()}`}>
						<div className="group block w-full aspect-w-10 aspect-h-7 rounded-lg bg-white shadow-sm   hover:opacity-75 focus-within:ring-2  transiton-all duration-150 ease-in focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
							<div className="p-4">
								<div className="flex justify-center">
									<LibraryIcon className="w-8 h-8 text-gray-400" aria-hidden="true" />
								</div>
								<h3 className="text-sm my-0.5 font-medium text-gray-500 truncate">Transmuter</h3>
								<h2 className=" font-semibold text-gray-900">{formatPublickey(item?.publicKey.toBase58())}</h2>
							</div>

							<button type="button" className="absolute inset-0 focus:outline-none">
								<span className="sr-only">View details for Transmuter</span>
							</button>
						</div>
					</Link>
				</li>
			))}
		</ul>
	);
}

export const TransmutersView: FC = ({}) => {
	const wallet = useWallet();
	const { connection } = useConnection();

	const transmuterClient = useTransmuterStore((s) => s.transmuterClient);

	const [transmuters, setTransmuters] = useState<any[]>([]);
	const { initTransmuterClient } = useTransmuterStore();
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		setIsLoading(true);
		if (wallet.publicKey) {
			initTransmuterClient(wallet, connection);
		}
	}, [wallet.publicKey, connection]);

	useEffect(() => {
		if (transmuterClient && wallet.publicKey && transmuterClient !== null) {
			getTransmuters(transmuterClient);
			setIsLoading(false);
		}
	}, [transmuterClient, wallet.publicKey, connection]);

	async function getTransmuters(sdk_: TransmuterSDK) {
		const accounts = await sdk_.programs.Transmuter.account.transmuter.all();
		const transmuters = accounts.filter((account) => account.account.owner.toBase58() == wallet.publicKey.toBase58());

		if (transmuters.length === 0) {
			setIsLoading(false);
			return;
		}

		setTransmuters(transmuters);

		setIsLoading(false);
	}

	async function initTransmuter_() {
		const { tx } = await transmuterClient.initTransmuter(wallet.publicKey);

		const res = await tx.confirm();
		if (res?.signature) {
			getTransmuters(transmuterClient);
		}
	}

	return (
		<div className="py-10">
			<ToastContainer />

			<header>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-bold leading-tight text-gray-900">Transmuters</h1>
					{transmuters.length > 0 && !isLoading && (
						<button
							onClick={() => {
								toast.promise(
									initTransmuter_,
									{
										pending: "loading",
										success: "Success!🎉",
										error: {
											render({ data }) {
												//@ts-expect-error
												return data.message;
											},
										},
									},
									{
										position: "bottom-right",
									}
								);
							}}
							disabled={!wallet.publicKey}
							type="button"
							className="leading-4 inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all duration-150 ease-in mt-8"
						>
							<PlusSmIconSolid className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
							Create Transmuter
						</button>
					)}
				</div>
			</header>

			<main>
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					<div className="px-4 py-8 sm:px-0">
						{isLoading ? (
							<SkeletonGridCards numberOfCards={12} showCard={isLoading} />
						) : (
							<>
								{transmuters.length > 0 ? (
									<TransmuterCard items={transmuters} />
								) : (
									<button
										type="button"
										onClick={() => {
											toast.promise(
												initTransmuter_,
												{
													pending: "loading",
													success: "Success!🎉",
													error: {
														render({ data }) {
															//@ts-expect-error
															return data.message;
														},
													},
												},
												{
													position: "bottom-right",
												}
											);
										}}
										className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
									>
										<LibraryIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
										<span className="mt-2 block text-sm font-medium text-gray-900">Create a new Transmuter</span>
									</button>
								)}
							</>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};
