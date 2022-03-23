/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, TicketIcon, ClockIcon } from "@heroicons/react/outline";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TransmuterWrapper } from "@gemworks/transmuter-ts";
import { RarityConfig, WhitelistType } from "@gemworks/gem-farm-ts";
import { Icon } from "./Icon";
import useGembankStore from "../stores/useGembankStore";
import { WhiteListProps } from "../interfaces";
import { useInputState } from "../utils/hooks/hooks";
import { ToastContainer, toast } from "react-toastify";
import InputField from "./InputField";
import { parseString } from "../utils/helpers";
import useTransmuterStore from "../stores/useTransmuterStore";
import moment from "moment";
interface MutationProps {
	account: any;
	mutationPublicKey?: PublicKey;
	transmuterWrapper: TransmuterWrapper;
	open: boolean;
	toggleState: () => void;
}

export default function ManageMutation({ account, mutationPublicKey, transmuterWrapper, open, toggleState }: MutationProps) {
	const transmuterClient = useTransmuterStore((s) => s.transmuterClient);
	const [receipts, setReceipts] = useState([]);
	useEffect(() => {
		console.log("account", account);
		getReceipts();
	}, [account]);

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
									<div className={`h-1/5 flex flex-col py-6 bg-white shadow-xl justify-between`}>
										<div className="px-4 sm:px-6">
											<div className="flex items-start justify-between">
												<Dialog.Title className="text-lg font-medium text-gray-900">Mutation {parseString(account?.name)}</Dialog.Title>
												<div className="ml-3 h-7 flex items-center ">
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
												</div>
											</div>
										</div>
										<div className="px-4 sm:px-6">
											{account?.remainingUses?.toNumber() > 0 ? (
												<h3 className="font-medium text-gray-900 ">mutations available: {account?.remainingUses?.toNumber()}</h3>
											) : (
												<h3 className="font-medium text-gray-900">mutation exhausted - no more usages left</h3>
											)}

											<h1 className="text-gray-900">price per mutation: {account?.config.price?.priceLamports.toNumber() / LAMPORTS_PER_SOL} </h1>
											<h1 className="text-gray-900">{mutationPublicKey?.toBase58()}</h1>
											{account?.config?.reversible && (
												<h1 className="text-gray-900">price per reversal: {account?.config.price?.reversalPriceLamports.toNumber() / LAMPORTS_PER_SOL} </h1>
											)}
										</div>
									</div>

									<div className="h-4/5 flex flex-col bg-white shadow-xl px-4 sm:px-6">
										<div>
											<label htmlFor="project-name" className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
												Execution Receipts
											</label>
											<p id="private-access-description" className="text-gray-500 text-sm mt-1">
												View all mutation executions from users.
											</p>
										</div>
										<div className="flex-1 flex overflow-hidden">
											<div className="mt-2 relative px-4 sm:px-6  flex-1 overflow-y-scroll">
												<div className="flex-1   ">
													{receipts.map((item, index) => (
														<ul key={index} className="border-t border-b border-gray-200  w-full flex py-2 items-center">
															{" "}
															<TicketIcon aria-hidden="true" className="w-7 h-7 mr-3 text-gray-400" />
															<div>
																<div className="flex items-center">
																	<span
																		className={`text-xs inline-flex items-center px-2 py-0.5 rounded font-medium text-${getExecutionState(item.account.state).color}-500 bg-${
																			getExecutionState(item.account.state).color
																		}-100 `}
																	>
																		{getExecutionState(item.account.state).state}
																	</span>
																	{!item.account.state?.pending && !item.account.state?.notStarted && (
																		<span className="text-gray-500 text-xs pl-1.5 font-medium flex items-center ">
																			<ClockIcon aria-hidden="true" className="w-5 h-5 pr-1" />
																			<div>{moment.unix(item.account.mutationCompleteTs.toNumber()).format("DD MM YYYY HH:mm")}</div>
																		</span>
																	)}
																</div>

																<p className="text-gray-400 font-medium text-xs pt-2">Taker</p>
																<p className="text-gray-700 font-medium text-sm">{item.account.taker.toBase58()}</p>
															</div>
														</ul>
													))}
												</div>
											</div>
										</div>
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
