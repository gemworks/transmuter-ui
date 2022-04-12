import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon, FilterIcon } from "@heroicons/react/outline";
import { PublicKey } from "@solana/web3.js";
import { TransmuterWrapper } from "@gemworks/transmuter-ts";
import { WhitelistType } from "@gemworks/gem-farm-ts";
import { Icon } from "./Icon";
import { WhiteListProps } from "../interfaces";
import { useInputState } from "../utils/hooks/hooks";
import { ToastContainer, toast } from "react-toastify";
import { formatPublickey } from "../utils/helpers";
import { useCopyToClipboard } from "usehooks-ts";
import InputField from "./InputField";
interface SlideOverProps {
	open: boolean;
	bankPk: string;
	bankLetter: string;
	transmuterWrapper: TransmuterWrapper;
	isTransmuterOwner: boolean;
	toggleState: () => void;
	addToWhitelist: () => void;
	removeFromWhitelist: () => void;
	addRarities: () => void;
}

import { parseWhitelistType } from "../utils/helpers";
import useGembankClient from "../hooks/useGemBankClient";
interface RadioButtonProps {
	whitelistType: WhitelistType;
	setWhitelistType: (e) => void;
}
export function RadioButtons({ whitelistType, setWhitelistType }: RadioButtonProps) {
	const notificationMethods = [
		{ id: "creator", value: 1 },
		{ id: "mint", value: 2 },
	];

	return (
		<div>
			<label htmlFor="email" className="block text-sm font-medium text-gray-700">
				Address Type
			</label>
			<p className="text-sm leading-5 text-gray-500"></p>
			<fieldset className="mt-4">
				<legend className="sr-only">Notification method</legend>
				<div className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10">
					{notificationMethods.map((notificationMethod, index) => (
						<div key={notificationMethod.id} className="flex items-center">
							<input
								defaultChecked={index === 0}
								value={notificationMethod.value}
								onClick={(e: any) => {
									setWhitelistType(e.target.value);
								}}
								id={notificationMethod.id}
								name="notification-method"
								type="radio"
								className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 transition-all duration-150 ease-in"
							/>
							<label htmlFor={notificationMethod.id} className="ml-3 block text-sm font-medium text-gray-700 capitalize">
								{notificationMethod.id}
							</label>
						</div>
					))}
				</div>
			</fieldset>
		</div>
	);
}

export default function BankSidebar({
	open,
	toggleState,
	bankPk,
	addToWhitelist,
	removeFromWhitelist,
	addRarities,
	transmuterWrapper,
	isTransmuterOwner,
	bankLetter,
}: SlideOverProps) {
	const gemBankClient = useGembankClient()
	const [whiteList, setWhiteList] = useState<WhiteListProps[]>([]);
	const [whitelistType, setWhitelistType] = useState<WhitelistType>(WhitelistType.Creator);
	const [publicKey, handlePublicKeyChange, setPublicKey, resetPublicKey] = useInputState("");
	const [clipBoardValue, copyToClipboard] = useCopyToClipboard();
	const [showItem, setShowItem] = useState(true);

	useEffect(() => {
		if (gemBankClient !== null && bankPk !== undefined && bankPk !== "") {
			main();
		}
	}, [bankPk]);

	async function main() {
		const pk = new PublicKey(bankPk);
		const whitelistPdas = await gemBankClient.fetchAllWhitelistProofPDAs(pk);
		const whitelistPdas_ = whitelistPdas.map((item) => {
			return {
				whiteListType: parseWhitelistType(item.account.whitelistType),
				publicKey: item.account.whitelistedAddress.toBase58(),
			};
		});

		setWhiteList(whitelistPdas_);
	}

	const removeFromBankWhitelist = async (mint: string) => {
		const { tx } = await transmuterWrapper.removeFromBankWhitelist(new PublicKey(bankPk), new PublicKey(mint));
		const { response } = await tx.confirm();

		if (response) {
			await main();
		}
	};

	async function addToWhiteList() {
		const { tx } = await transmuterWrapper.addToBankWhitelist(new PublicKey(bankPk), new PublicKey(publicKey), whitelistType);
		const { response } = await tx.confirm();
		resetPublicKey();
		if (response) {
			await main();
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
									<div className={`${isTransmuterOwner ? "h-2/4" : "h-1/5"} flex flex-col py-6 bg-white shadow-xl justify-evenly`}>
										<div className="px-4 sm:px-6">
											<div className="flex items-start justify-between">
												<Dialog.Title className="text-lg font-medium text-gray-900">
													<dt className="text-sm font-medium text-gray-500 truncate">Bank {bankLetter}</dt>
													<Transition
														show={showItem}
														enter="transform ease-out duration-500 transition origin-bottom"
														enterFrom="scale-95 translate-y-0.5 opacity-0"
														enterTo="scale-100 translate-y-0 opacity-100"
														leave="transition ease-in duration-100"
														leaveFrom="opacity-100"
														leaveTo="opacity-0"
													>
														<span className="absolute inset-x-0 bottom-full mb-2.5 flex justify-center">
															<span className="bg-gray-900 text-white rounded-md text-[0.625rem] leading-4 tracking-wide font-semibold uppercase py-1 px-3 filter drop-shadow-md">
																<svg aria-hidden="true" width="16" height="6" viewBox="0 0 16 6" className="text-gray-900 absolute top-full left-1/2 -mt-px -ml-2 ">
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
													<dd
														className="text-2xl font-semibold text-gray-900 uppercase hover:opacity-75 transition-all duration-150 ease-in cursor-pointer"
														onClick={() => {
															setShowItem(true);
															copyToClipboard(bankPk);
															setTimeout(() => {
																setShowItem(false);
															}, 500);
														}}
													>
														{formatPublickey(bankPk)}
													</dd>
												</Dialog.Title>
												<div className="ml-3 h-7 flex items-center ">
													<button
														type="button"
														className="bg-white rounded-md  text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
														onClick={() => {
															resetPublicKey();
															toggleState();
														}}
													>
														<span className="sr-only">Close panel</span>
														<XIcon className="h-6 w-6" aria-hidden="true" />
													</button>
												</div>
											</div>
										</div>

										<div>
											<div className=" relative flex-1 px-4 sm:px-6 overflow-hidden">
												{/* FORM */}
												{isTransmuterOwner && (
													<div className="space-y-10">
														<InputField
															inputFieldTitle={"Token Address"}
															publicKey={publicKey}
															handlePublicKeyChange={handlePublicKeyChange}
															setPublicKey={setPublicKey}
															resetPublicKey={resetPublicKey}
														/>

														<RadioButtons whitelistType={whitelistType} setWhitelistType={setWhitelistType} />

														<button
															onClick={() => {
																toast.promise(
																	addToWhiteList(),
																	{
																		pending: `Adding ${publicKey}`,
																		success: `Successfully added ${publicKey}`,
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
															disabled={publicKey.length < 15}
															className="disabled:opacity-25 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in"
														>
															Add Token
														</button>
													</div>
												)}

												{/* FORM END */}
												<div></div>
											</div>
											{/* /End replace */}
										</div>
									</div>

									<div className={`${isTransmuterOwner ? "h-2/4" : "h-4/5"} flex flex-col bg-white shadow-xl `}>
										<h3 className="font-medium text-gray-900  px-4 sm:px-6 py-4">Whitelisted Addresses</h3>
										<div className="flex-1 flex overflow-hidden">
											{whiteList.length > 0 ? (
												<div className="mt-2 relative px-4 sm:px-6  flex-1 overflow-y-auto">
													<div className="flex-1   ">
														{whiteList.map((item, index) => (
															<ul className="border-t border-b border-gray-200 divide-y divide-gray-200 w-full" key={index}>
																{" "}
																<Icon
																	isTransmuterOwner={isTransmuterOwner}
																	publicKey={item.publicKey}
																	whiteListType={item.whiteListType}
																	removeFromWhiteList={() => {
																		toast.promise(
																			removeFromBankWhitelist(item.publicKey),
																			{
																				pending: `Removing ${item.publicKey}`,
																				success: `Successfully removed ${item.publicKey}`,
																				error: "Something went wrong 😕",
																			},
																			{
																				position: "bottom-right",
																			}
																		);
																	}}
																/>
															</ul>
														))}
													</div>
												</div>
											) : (
												<div className="flex flex-col h-full w-full justify-center">
													{" "}
													<div className="text-center">
														<FilterIcon aria-hidden="true" className="w-10 h-10 mx-auto text-gray-400" />
														<h3 className="mt-2 text-sm font-medium text-gray-900">No whitelisted addresses found</h3>
													</div>{" "}
												</div>
											)}
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
