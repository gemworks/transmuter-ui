// Next, React
import { useEffect, useState } from "react";

// Store

import { TrendingDownIcon } from "@heroicons/react/outline";

import { Wallet } from "@saberhq/solana-contrib";
import { Connection, PublicKey } from "@solana/web3.js";

import { ToastContainer, toast } from "react-toastify";

// Components
import GradientAvatar from "components/GradientAvatar";
import { formatPublickey } from "../utils/helpers";
import { MakerToken } from "./MakerToken";
import { programs } from "@metaplex/js";
import axios from "axios";
const {
	metadata: { Metadata },
} = programs;
import { SelectedTokens } from "../interfaces/index";


interface VaultProps {
	mutationData: any;
	takerBankWhitelist: { [key: string]: { publicKey: string; whiteListType: string }[] };
	connection: Connection;
	wallet: Wallet;
	selectedTokens: SelectedTokens;
	setSelectedTokens: (token: any) => void;
}

interface TokenBalanceProps {
	[bank: string]: {
		availableMints: {
			[mint: string]: {
				hasSufficientBalance: boolean;
				type: string;
				creatorPk?: string;
				metadata?: {
					name: string;
					image: string;
				};
			};
		};
		whiteListLength: number;
	};
}
interface TokenBalance {
	tokens: TokenBalanceProps;
}

export function Vaults({ mutationData, takerBankWhitelist, connection, wallet, selectedTokens, setSelectedTokens }: VaultProps) {
	const [availableTokens, setAvailableTokens] = useState<TokenBalance>({
		tokens: {},
	});
	const [mutation, setMutation] = useState(mutationData.config);
	const [isLoading, setIsLoading] = useState(true);

	async function hasSufficientTokenBalance(takerBankWhitelist: { [key: string]: { publicKey: string; whiteListType: string }[] }): Promise<TokenBalanceProps> {
		try {
			let aggregatedBalances = {};
			const others = [];

			for await (const [key, bank] of Object.entries(takerBankWhitelist)) {
				//just push the key if no address is whitelisted

				if (bank.length === 0) {
					aggregatedBalances[key] = { availableMints: {}, whiteListLength: 0 };
				} else {
					//get all token accounts
					const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") });

					for await (const whitelistedAddress of bank) {
						if (whitelistedAddress.whiteListType.toLowerCase() === "creator") {
							const ownedMints: { mint: string; metadata?: string }[] = [];
							//check if the whitelisted creator address matches the mint authority of the token
							for (const account of tokenAccounts.value) {
								const { value } = await connection.getParsedAccountInfo(new PublicKey(account.account.data["parsed"].info.mint));

								//if supply === 0 => assume NFT & compare against creator array; else => use mintAuthority
								const currentTokensInWallet = parseInt(account.account.data["parsed"].info.tokenAmount.amount);
								if (currentTokensInWallet > 0) {
							
							
								if (parseInt(value.data["parsed"].info.supply) === 1) {
									const metadataPDA = await Metadata.getPDA(new PublicKey(account.account.data["parsed"].info.mint));
									const tokenMetadata = await Metadata.load(connection, metadataPDA);

									if (tokenMetadata.data.data.creators[0].address === whitelistedAddress.publicKey) {
										ownedMints.push({ mint: account.account.data["parsed"].info.mint, metadata: tokenMetadata.data.data.uri });
									}
								} else {
									if (value.data["parsed"].info.mintAuthority === whitelistedAddress.publicKey) {
										ownedMints.push({ mint: account.account.data["parsed"].info.mint });
									}
								}
							}
							}

							//check if the user has any of these tokens in his wallet
							let mintBalances = {};
							for (const token of ownedMints) {
								const res = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
									mint: new PublicKey(token.mint),
								});

								if (res.value.length > 0) {
									if (token?.metadata) {
										const { data } = await axios.get(token?.metadata);
										const { name, image } = data;
										mintBalances[token.mint] = {
											hasSufficientBalance: true,
											type: "creator",
											creatorPk: whitelistedAddress.publicKey,
											metadata: {
												name,
												image,
											},
										};
									} else {
										mintBalances[token.mint] = {
											hasSufficientBalance: true,
											type: "creator",
											creatorPk: whitelistedAddress.publicKey,
										};
									}
								} else {
									if (token?.metadata) {
										const { data } = await axios.get(token?.metadata);
										const { name, image } = data;
										mintBalances[token.mint] = {
											hasSufficientBalance: false,
											type: "creator",
											creatorPk: whitelistedAddress.publicKey,
											metadata: {
												name,
												image,
											},
										};
									} else {
										mintBalances[token.mint] = {
											hasSufficientBalance: false,
											type: "creator",
											creatorPk: whitelistedAddress.publicKey,
										};
									}
								}

								//push tokens created by the specified address to the array
								aggregatedBalances[key] = { availableMints: mintBalances, whiteListLength: ownedMints.length };
							}
						} else {
							//check if the user has sufficient tokens in his wallet
							//@TODO
							//check if required amount for mutation matches user's current token balance []
							//display all tokens available tokens for each vault, even if the user doesn't own enough []

							let ownedTokensCount = 0;
							if (tokenAccounts.value.length > 0) {
								tokenAccounts.value.forEach((account) => {
									if (account.account.data["parsed"].info.mint === whitelistedAddress.publicKey) {
										ownedTokensCount++;
										aggregatedBalances[key] = {
											whiteListLength: ownedTokensCount,
											availableMints: {
												[whitelistedAddress.publicKey]: {
													hasSufficientBalance: true,
													type: "mint",
												},
											},
										};
									}
								});
							} else {
								aggregatedBalances[key] = {
									whiteListLength: ownedTokensCount,
									availableMints: {
										[whitelistedAddress.publicKey]: {
											hasSufficientBalance: false,
											type: "mint",
										},
									},
								};
							}

							if (aggregatedBalances[key]?.availableMints[whitelistedAddress.publicKey] === undefined) {
								others.push({
									key,

									whiteListLength: ownedTokensCount,
									mint: whitelistedAddress.publicKey,
									hasSufficientBalance: false,
									type: "mint",
								});
							}
						}
					}
				}
			}

			others.forEach((item) => {
				if (aggregatedBalances[item.key] !== undefined) {
					aggregatedBalances[item.key]["availableMints"][item.mint] = {
						hasSufficientBalance: item.hasSufficientBalance,
						type: item.type,
					};
				} else {
					aggregatedBalances[item.key] = {
						whiteListLength: 0,
						availableMints: {
							[item.mint]: {
								hasSufficientBalance: item.hasSufficientBalance,
								type: item.type,
							},
						},
					};
				}
			});
			setIsLoading(false);
			return aggregatedBalances;
		} catch (err) {
			setIsLoading(false);
			return err;
		}
	}

	useEffect(() => {
		setIsLoading(true);
		if (wallet.publicKey && mutationData !== null) {
			async function hasSufficientTokenBalance_() {
				const tokens = await hasSufficientTokenBalance(takerBankWhitelist);
				setAvailableTokens({ tokens });
			}
	
			toast.promise(
				hasSufficientTokenBalance_,
				{
					pending: `getting data`,
					error: {
						render({ data }) {
							//@ts-expect-error
							return data.message;
						},
					},
					success: `successfully received data`,
				},
				{
					position: "bottom-right",
				}
			);

		}
	
	}, [wallet.publicKey, mutationData]);

	return (
		<>
			<ToastContainer theme="colored" />
			<div className=" text-gray-900 flex justify-evenly flex-wrap">
				{/* TAKER VAULTS */}
				<div className="flex flex-col space-y-2 sm:space-y-6 max-w-md w-full">
					{Object.keys(mutation).map((key, index) => {
						if (key.includes("takerToken") && mutation[key].requiredAmount.toNumber() > 0) {
							return (
								<div key={key}>
									{key.includes("takerToken") && mutation[key].requiredAmount.toNumber() > 0 && (
										<div>
											<div className="py-5 border-b border-gray-200">
												<h3 className="text-lg leading-6 font-medium text-gray-900">Vault {key.split("takerToken")[1]}</h3>
												<div className="flex items-center  text-sm mt-2 ">
													<TrendingDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
													<span className="text-gray-400 pl-1 ">Requires</span>
													<span className="text-gray-800 font-medium pl-1.5">{mutation[key].requiredAmount.toNumber()}</span>
													<span className="text-gray-400 pl-1 ">token{mutation[key].requiredAmount.toNumber() > 1 && "s"} per use</span>
												</div>
											</div>

											<div className="pt-5">
												{isLoading ? (
													<div className="space-y-2">
														{[...Array(3)].map((e, index) => {
															return (
																<div key={index} className="p-2 rounded-md border border-gray-200 bg-white flex justify-between items-center animate-pulse">
																	<div className="space-x-2 flex items-center">
																		<div className="object-scale-none w-7 h-7 rounded-full bg-gray-300" />

																		<span
																			className="pl-2 inline-flex text-xs leading-5 
																rounded-full bg-gray-200 text-gray-200"
																		>
																			gmgmgmgmgmgm
																		</span>
																	</div>

																	<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-100">gmgmgmgmgmgm</span>
																</div>
															);
														})}
													</div>
												) : (
													<>
														{" "}
														{availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints !== undefined &&
														Object.keys(availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints).length > 0 ? (
															<div>
																<h4 className="text-gray-800 font-medium text-sm pb-2">Select any token</h4>
																<div className="space-y-2">
																	{Object.keys(availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints).map((key_, index) => (
																		<div
																			key={index}
																			onClick={() => {
																				if (availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.hasSufficientBalance) {
																					setSelectedTokens((prevState) => ({
																						...prevState,
																						[mutation[key].gemBank.toBase58()]: {
																							mint: key_,
																							type: availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.type,
																							isFromWhiteList: true,
																							creatorPk:
																								availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.creatorPk === undefined
																									? ""
																									: availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.creatorPk,
																						},
																					}));
																				}
																			}}
																			className={`${selectedTokens[mutation[key].gemBank.toBase58()]?.mint === key_ ? "border-indigo-500" : "border-gray-200"} 
															
															${!availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.hasSufficientBalance && "opacity-50 cursor-not-allowed hover:opacity-50"}
															flex p-2 rounded-md hover:opacity-75 transition-all duration-150 ease-in border  bg-white items-center relative cursor-pointer focus:outline-none sm:text-sm justify-between `}
																		>
																			{availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.metadata ? (
																				<div className="space-x-2 flex items-center">
																					<img
																						src={availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.metadata.image}
																						className="object-scale-none w-7 h-7 rounded-full"
																					/>
																					<span className="pl-2">{availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.metadata.name}</span>
																				</div>
																			) : (
																				<div className="space-x-2 flex items-center">
																					<GradientAvatar width={7} height={7} hash={key_} />

																					<span className="pl-2">{formatPublickey(key_)}</span>
																				</div>
																			)}

																			{availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.hasSufficientBalance ? (
																				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">sufficient tokens</span>
																			) : (
																				<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">insufficient tokens</span>
																			)}
																		</div>
																	))}
																</div>
															</div>
														) : (
															<div>
																<input
																	placeholder="use any token mint"
																	value={selectedTokens[mutation[key].gemBank.toBase58()]?.mint || ""}
																	onChange={(e: any) => {
																		if (Object.keys(selectedTokens).length === 0) {
																			setSelectedTokens({ [mutation[key].gemBank.toBase58()]: { mint: e.target.value, type: "mint", isFromWhiteList: false } });
																		} else {
																			setSelectedTokens((prevState) => ({
																				...prevState,
																				[mutation[key].gemBank.toBase58()]: { mint: e.target.value, type: "mint", isFromWhiteList: false },
																			}));
																		}
																	}}
																	onPaste={(e: any) => {
																		e.preventDefault();
																		const pastedText = e.clipboardData.getData("Text");
																		if (Object.keys(selectedTokens).length === 0) {
																			setSelectedTokens({ [mutation[key].gemBank.toBase58()]: { mint: pastedText, type: "mint", isFromWhiteList: false } });
																		} else {
																			setSelectedTokens((prevState) => ({
																				...prevState,
																				[mutation[key].gemBank.toBase58()]: { mint: pastedText, type: "mint", isFromWhiteList: false },
																			}));
																		}
																	}}
																	onCut={(e: any) => {
																		setSelectedTokens((prevState) => ({
																			...prevState,
																			[mutation[key].gemBank.toBase58()]: { mint: e.target.value, type: "mint", isFromWhiteList: false },
																		}));
																	}}
																	type="text"
																	name="project-name"
																	id="project-name"
																	className="block p-2 rounded-md border-gray-300  focus:border-indigo-500 focus:ring-indigo-500  transition-all duration-150 ease-in  sm:text-sm w-full"
																/>
															</div>
														)}
													</>
												)}
											</div>
										</div>
									)}
								</div>
							);
						}
					})}
				</div>
				{/* MAKER VAULTS */}

				<div className="flex flex-col space-y-2 sm:space-y-6 max-w-md w-full">
					{Object.keys(mutation).map((key, index) => {
						if (key.includes("makerToken")) {
							return (
								<div key={key}>
									{key.includes("makerToken") && mutation[key]?.amountPerUse.toNumber() > 0 && (
										<MakerToken token={mutation[key]} vaultId={key.split("makerToken")[1]} mutationData={mutationData} />
									)}
								</div>
							);
						}
					})}
				</div>
			</div>
		</>
	);
};
