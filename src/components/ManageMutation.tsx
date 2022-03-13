/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
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
interface MutationProps {
	account: any;
	publicKey?: PublicKey;
	transmuterWrapper: TransmuterWrapper;
	open: boolean;
	toggleState: () => void;
}

export default function ManageMutation({ account, publicKey, transmuterWrapper, open, toggleState }: MutationProps) {
	useEffect(() => {
		console.log("account", account);
	}, [account]);
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
										<div>{/* /End replace */}</div>
									</div>

									<div className={`h-4/5 flex flex-col bg-white shadow-xl px-4 sm:px-6 space-y-4`}>
										{account?.remainingUses?.toNumber() > 0 ? (
											<h3 className="font-medium text-gray-900 ">mutations available: {account?.remainingUses?.toNumber()}</h3>
										) : (
											<h3 className="font-medium text-gray-900">mutation exhausted - no more usages left</h3>
										)}

										<h1 className="text-gray-900">price per mutation: {account?.config.price?.priceLamports.toNumber() / LAMPORTS_PER_SOL} </h1>
										<h1 className="text-gray-900">{publicKey?.toBase58()}</h1>
										{account?.config?.reversible && (
											<h1 className="text-gray-900">price per reversal: {account?.config.price?.reversalPriceLamports.toNumber() / LAMPORTS_PER_SOL} </h1>
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
