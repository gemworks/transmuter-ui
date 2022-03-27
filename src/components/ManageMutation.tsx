/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { MutationWrapper, TransmuterWrapper, MutationData } from "@gemworks/transmuter-ts";
import { ToastContainer, toast } from "react-toastify";
import { parseString } from "../utils/helpers";
import useTransmuterStore from "../stores/useTransmuterStore";
import Link from "next/link";
import { XIcon, RefreshIcon, ClockIcon, BeakerIcon, TicketIcon, ArrowRightIcon } from "@heroicons/react/outline";
import moment from "moment";
import DestroyMutation from "../components/DestroyMutation";
interface MutationProps {
	mutationData: any;
	mutationPublicKey?: PublicKey;
	transmuterWrapper: TransmuterWrapper;
	getMutationsByTransmuter: () => void;
	open: boolean;
	toggleState: () => void;
}

export default function ManageMutation({ mutationData, mutationPublicKey, transmuterWrapper, open, toggleState, getMutationsByTransmuter }: MutationProps) {
	const transmuterClient = useTransmuterStore((s) => s.transmuterClient);
	const [receipts, setReceipts] = useState([]);
	const [mutationWrapper, setMutationWrapper] = useState<MutationWrapper>(null);
	useEffect(() => {
		if (mutationData) {
			setMutationWrapper(new MutationWrapper(transmuterClient, mutationPublicKey, mutationData?.transmuter, mutationData));
		}

		getReceipts();
	}, [mutationData]);

	async function getReceipts() {
		const receipts = await transmuterClient?.findAllReceipts(undefined, mutationPublicKey);
		if (receipts) {
			setReceipts(receipts);
		}
	}

	function getExecutionState(rawState: any): { color: string; state: string } {
		if (rawState.complete) {
			return {
				color: "green",
				state: "complete",
			};
		}
		if (rawState.pending) {
			return {
				color: "yellow",
				state: "pending",
			};
		}
		if (rawState.notStarted) {
			return {
				color: "gray",
				state: "not started",
			};
		}

		return {
			color: "gray",
			state: "-",
		};
	}

	async function destroyMutation() {
		const { tx } = await mutationWrapper.destroy(mutationData?.transmuter);
		const { signature } = await tx.confirm();
		if (signature) {
			toggleState();
			getMutationsByTransmuter();
		}
	}

	return (
		<>
			<ToastContainer theme="colored" />

			<Transition.Root show={open} as={Fragment}>
				<Dialog as="div" className="fixed inset-0 overflow-hidden" onClose={toggleState}>
					<div className="absolute inset-0 overflow-hidden">
						<Dialog.Overlay className="absolute inset-0" />

						<div className="fixed inset-y-0 right-0 pl-10 max-w-full flex sm:pl-16">
							<Transition.Child
								as={Fragment}
								enter="transform transition ease-in-out duration-500 sm:duration-700"
								enterFrom="translate-x-full"
								enterTo="translate-x-0"
								leave="transform transition ease-in-out duration-500 sm:duration-700"
								leaveFrom="translate-x-0"
								leaveTo="translate-x-full"
							>
								<div className="w-screen max-w-2xl">
									<div className={`h-1/3 py-6 bg-white shadow-xl`}>
										<div className="px-4 sm:px-6">
											<div className="flex items-start justify-between">
												<Dialog.Title>
													<dt className="text-sm font-medium text-gray-500 truncate">Mutation</dt>
													<dd className="mt-1 text-2xl font-semibold text-gray-900 uppercase">{parseString(mutationData?.name)}</dd>
												</Dialog.Title>
												<div className="ml-3 h-7 flex flex-col space-y-3 items-center ">
													<button
														type="button"
														className="bg-white rounded-md  text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
														onClick={() => {
															toggleState();
														}}
													>
														<span className="sr-only">Close panel</span>
														<XIcon className="h-6 w-6" aria-hidden="true" />
													</button>
													<DestroyMutation
														mutationName={parseString(mutationData?.name)}
														destroyMutation={() => {
															toast.promise(
																destroyMutation,
																{
																	pending: "Loading",
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
													/>
												</div>
											</div>
										</div>
										<div className="px-4 sm:px-6">
											<Link href={`/mutation/${mutationPublicKey?.toBase58()}`}>
												<div className="text-indigo-500 hover:text-indigo-300 duration-150 ease-in transition-all font-medium pt-2 pb-4 cursor-pointer flex space-x-2 items-center text-sm w-32">
													<div>go to Mutation</div>
													<ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
												</div>
											</Link>

											<div className="flex flex-col sm:flex-row items-center text-sm flex-wrap space-y-1 pt-6">
												<div className="flex items-center pr-4">
													<BeakerIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
													<span className="text-gray-800 font-medium pl-1.5">
														{mutationData?.totalUses.toNumber() - mutationData?.remainingUses.toNumber()}/{mutationData?.totalUses.toNumber()}
													</span>
													<span className="text-gray-400 pl-1">times used</span>
												</div>

												<div className="flex items-center pr-4">
													<ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
													<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.mutationDurationSec.toNumber()}s</span>
													<span className="text-gray-400 pl-1">to finish</span>
												</div>
												<div className="flex items-center pr-4">
													<RefreshIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
													<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.reversible ? "reversable" : "irreversible"}</span>
												</div>
												<div className="flex items-center pr-4">
													<img src="/images/solana.png" className="w-4 h-4" alt="solana_logo" />
													<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.price?.priceLamports.toNumber() / LAMPORTS_PER_SOL} SOL </span>
													<span className="text-gray-400 pl-1">to execute</span>
												</div>
												{mutationData?.config.reversible && (
													<div className="flex items-center pr-4">
														<img src="/images/solana.png" className="w-4 h-4" alt="solana_logo" />
														<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.price?.reversalPriceLamports.toNumber() / LAMPORTS_PER_SOL} SOL </span>
														<span className="text-gray-400 pl-1">to reverse</span>
													</div>
												)}
											</div>
										</div>
									</div>

									<div className="h-2/3 flex flex-col bg-white shadow-xl px-4 sm:px-6">
										<div>
											<label className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">Execution Receipts</label>
											<p className="text-gray-500 text-sm mt-1">View all mutation executions from users.</p>

											{receipts.length > 0 && (
												<p className="text-gray-500 text-sm mt-4 pb-1 flex items-center">
													<TicketIcon aria-hidden="true" className="w-5 h-5 mr-1 text-gray-400" />
													<span className="text-gray-800 font-medium mr-1">{receipts.length}</span> Receipt{receipts.length !== 1 && "s"} found
												</p>
											)}
										</div>

										{receipts.length > 0 ? (
											<div className="flex-1 flex overflow-hidden ">
												{" "}
												<div className="mt-2 relative px-4 sm:px-6  flex-1 overflow-y-auto ">
													<div className="flex-1">
														{receipts.map((item, index) => (
															<ul key={index} className="border-t border-gray-200  w-full flex py-3 items-center hover:opacity-60 duration-150 ease-in transition-all">
																{" "}
																<TicketIcon aria-hidden="true" className="w-7 h-7 mr-3 text-gray-400" />
																<div>
																	<div className="flex items-center">
																		<span
																			className={`text-xs inline-flex items-center px-2 py-0.5 rounded font-medium text-${getExecutionState(item.account.state).color}-800 bg-${
																				getExecutionState(item.account.state).color
																			}-100 `}
																		>
																			{getExecutionState(item.account.state).state}
																		</span>
																		{!item.account.state?.notStarted && (
																			<span className="text-gray-500 text-xs pl-1.5 font-medium flex items-center ">
																				<ClockIcon aria-hidden="true" className="w-5 h-5 pr-1" />
																				<div>{moment.unix(item.account.mutationCompleteTs.toNumber()).format("DD MM YYYY HH:mm")}
																				</div>
																		
																			</span>
																		)}
																	</div>

																	<p className="text-gray-400 font-medium text-xs pt-2">Taker</p>
																	<p className="text-gray-700 font-medium text-sm">{item.account.taker.toBase58()}</p>
																</div>
															</ul>
														))}
													</div>
												</div>{" "}
											</div>
										) : (
											<div className="flex flex-col h-full justify-center">
												{" "}
												<div className="text-center">
													<TicketIcon aria-hidden="true" className="w-10 h-10 mx-auto text-gray-400" />
													<h3 className="mt-2 text-sm font-medium text-gray-900">No receipts found</h3>
												</div>{" "}
											</div>
										)}
									</div>
								</div>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition.Root>
		</>
	);
}
