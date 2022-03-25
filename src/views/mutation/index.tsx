// Next, React
import { FC, useEffect, useState } from "react";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Components
import GradientAvatar from "components/GradientAvatar";

// Store

import { RefreshIcon, ClockIcon, BeakerIcon, TrendingUpIcon, TrendingDownIcon, CheckCircleIcon } from "@heroicons/react/outline";
import useTransmuterStore from "../../stores/useTransmuterStore";

import { Wallet } from "@saberhq/solana-contrib";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useRouter } from "next/router";
import { TransmuterWrapper, MutationWrapper, MutationData } from "@gemworks/transmuter-ts";
import useGembankStore from "../../stores/useGembankStore";
import { parseWhitelistType } from "../../utils/helpers";
import { findWhitelistProofPDA } from "@gemworks/gem-farm-ts";

import { ToastContainer, toast } from "react-toastify";
import { formatPublickey, parseSecondsToDate } from  "../../utils/helpers";
import { programs } from '@metaplex/js';
const { metadata: { Metadata } } = programs;
interface SelectedTokens {
	[takerVault: string]: { mint: string; type: string; creatorPk?: string; isFromWhiteList?: boolean };
}
interface VaultProps {
	mutationData: MutationData;
	takerBankWhitelist: { [key: string]: { publicKey: string; whiteListType: string }[] };
	connection: Connection;
	wallet: Wallet;
	selectedTokens: SelectedTokens;
	setSelectedTokens: (token: any) => void;
}

interface TokenBalanceProps {
	[bank: string]: {
		availableMints: { [mint: string]: { hasSufficientBalance: boolean; type: string; creatorPk?: string } };
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
							const ownedMints = [];
							//check if the whitelisted creator address matches the mint authority of the token
							for (const account of tokenAccounts.value) {
								const { value } = await connection.getParsedAccountInfo(new PublicKey(account.account.data["parsed"].info.mint));

								//if supply === 0 => assume NFT & compare against creator array; else => use mintAuthority
								if (parseInt(value.data["parsed"].info.supply) === 1) {
									const tokenMetadata = await Metadata.load(connection, new PublicKey(account.account.data["parsed"].info.mint));
									if (tokenMetadata.data.data.creators[0].address === whitelistedAddress.publicKey) {
										ownedMints.push(account.account.data["parsed"].info.mint);
									}
								} else {
									if (value.data["parsed"].info.mintAuthority === whitelistedAddress.publicKey) {
										ownedMints.push(account.account.data["parsed"].info.mint);
									}
								}
							}

							//check if the user has any of these tokens in his wallet
							let mintBalances = {};
							for (const mint of ownedMints) {
								const res = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
									mint: new PublicKey(mint),
								});

								if (res.value.length > 0) {
									mintBalances[mint] = {
										hasSufficientBalance: true,
										type: "creator",
										creatorPk: whitelistedAddress.publicKey,
									};
								} else {
									mintBalances[mint] = {
										hasSufficientBalance: false,
										type: "creator",
										creatorPk: whitelistedAddress.publicKey,
									};
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

			return aggregatedBalances;
		} catch (err) {
			return err;
		}
	}

	useEffect(() => {

		async function hasSufficientTokenBalance_() {
			const tokens = await hasSufficientTokenBalance(takerBankWhitelist);
			setAvailableTokens({ tokens });
		}

		toast.promise(
			hasSufficientTokenBalance_,
			{
				pending: `getting data`,
				error: "something went wrong",
				success: `successfully received data`,
			},
			{
				position: "bottom-right",
			}
		);
	}, []);

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
													<span className="text-gray-800 font-medium pl-1.5">{mutation[key].requiredAmount.toNumber()}</span>
													<span className="text-gray-400 pl-1 ">token{mutation[key].requiredAmount.toNumber() > 1 && "s"} required per use</span>
												</div>
											</div>

											<div className="pt-5">
												{availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints !== undefined &&
												Object.keys(availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints).length > 0 ? (
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
																<div className="space-x-2 flex items-center">
																	<GradientAvatar width={7} height={7} hash={key_} />

																	<span className="pl-2">{formatPublickey(key_)}</span>
																</div>

																{availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key_]?.hasSufficientBalance ? (
																	// <div className="text-green-500 text-xs">enough tokens</div>
																	<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">sufficient tokens</span>
																) : (
																	<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">insufficient tokens</span>
																)}
															</div>
														))}
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
										<div>
											<div className="py-5 border-b border-gray-200">
												<h3 className="text-lg leading-6 font-medium text-gray-900">
													<span className="uppercase">{new TextDecoder().decode(new Uint8Array(mutationData?.name))}</span> Vault {key.split("makerToken")[1]}
												</h3>
												<div className="flex items-center  text-sm mt-2 ">
													<TrendingUpIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
													<span className="text-gray-400 pl-1 ">You receive</span>
													<span className="text-gray-800 font-medium pl-1.5">{mutation[key].amountPerUse.toString()}</span>
													<span className="text-gray-400 pl-1 ">token{mutation[key].amountPerUse.toNumber() > 1 && "s"}</span>
												</div>
											</div>

											<div className="space-x-2 pt-5 flex items-center">
												<GradientAvatar width={7} height={7} hash={mutation[key].mint.toBase58()} />

												<span className="pl-2">{formatPublickey(mutation[key].mint.toBase58())}</span>
											</div>
										</div>
									)}
								</div>
							);
						}
					})}
				</div>
			</div>
		</>
	);
}

export const MutationView: FC = ({}) => {
	const wallet = useWallet();
	const { connection } = useConnection();
	const [transmuterWrapper, setTransmuterWrapper] = useState<TransmuterWrapper>(null);
	const [mutationWrapper, setMutationWrapper] = useState<MutationWrapper>(null);
	const [mutationData, setMutationData] = useState<MutationData>(null);
	const { initTransmuterClient } = useTransmuterStore();
	const router = useRouter();
	const transmuterClient = useTransmuterStore((s) => s.transmuterClient);
	const { mutationPublicKey } = router.query;
	const gemBankClient = useGembankStore((s) => s.gemBankClient);
	const { initGemBankClient } = useGembankStore();
	const [takerBankWhitelist, setTakerBankWhitelist] = useState(null);
	const [selectedTokens, setSelectedTokens] = useState<SelectedTokens>({});
	const [mutationOwner, setMutationOwner] = useState<PublicKey>(null);
	const [mutationReceipt, setMutationReceipt] = useState(null);
	const [timeLeft, setTimeLeft] = useState<{ raw: number; formatted: string }>({ raw: -99, formatted: "" });
	useEffect(() => {
		if (wallet.publicKey && connection) {
			if (transmuterClient === null) {
				initTransmuterClient(wallet, connection);
			}

			if (gemBankClient === null) {
				initGemBankClient(wallet, connection);
			}
		}
	}, [wallet.publicKey, connection]);

	useEffect(() => {
		if (transmuterClient && wallet.publicKey && gemBankClient) {
			getMutation();
		}
	}, [mutationPublicKey, transmuterClient, wallet.publicKey, gemBankClient]);
	async function getMutation() {
		const mutationPk = new PublicKey(mutationPublicKey);
		const mutationData = await transmuterClient.programs.Transmuter.account.mutation.fetch(mutationPk);
		setMutationData(mutationData);

		const mutationWrapper_ = new MutationWrapper(transmuterClient, mutationPk, mutationData.transmuter, mutationData);
		setMutationWrapper(mutationWrapper_);

		const transmuterData = await transmuterClient.programs.Transmuter.account.transmuter.fetch(mutationData.transmuter);
		const { bankA, bankB, bankC, owner } = transmuterData;
		setMutationOwner(owner);

		//WRAPPER
		const transmuterWrapper_ = new TransmuterWrapper(transmuterClient, mutationData.transmuter, bankA, bankB, bankC, transmuterData);

		//RECEIPT
		setTimeLeft({ raw: -99, formatted: "" });
		const receipts = await transmuterClient.findAllReceipts(undefined, mutationPk);
		const takerReceipt = receipts.filter((receipt) => receipt.account.taker.toBase58() === wallet.publicKey.toBase58());
		if (takerReceipt.length > 0) {
			const timeUntilFinished = takerReceipt[0].account.mutationCompleteTs.toNumber() - Math.floor(Date.now() / 1000);

			const formattedTime = parseSecondsToDate(timeUntilFinished);
			if (timeUntilFinished > 0) {
				setTimeLeft({ raw: timeUntilFinished, formatted: formattedTime });
			} else if (takerReceipt[0].account.state?.notStarted) {
				setTimeLeft({ raw: -99, formatted: "" });
			} else {
				setTimeLeft({ raw: 0, formatted: formattedTime });
			}

			setMutationReceipt(takerReceipt[0].account);
		}

		const bankAWhitelist = await getAllWhitelistedPDAs(bankA);
		const bankBWhitelist = await getAllWhitelistedPDAs(bankB);
		const bankCWhitelist = await getAllWhitelistedPDAs(bankC);

		setTakerBankWhitelist({
			[bankA.toBase58()]: bankAWhitelist,
			[bankB.toBase58()]: bankBWhitelist,
			[bankC.toBase58()]: bankCWhitelist,
		});

		setTransmuterWrapper(transmuterWrapper_);
	}

	useEffect(() => {
		// exit early when we reach 0
		if (!timeLeft.raw || timeLeft.raw === -99) return;

		// save intervalId to clear the interval when the
		// component re-renders
		const intervalId = setInterval(() => {
			const formattedTime = parseSecondsToDate(timeLeft.raw - 1);

			setTimeLeft({ raw: timeLeft.raw - 1, formatted: formattedTime });
		}, 1000);

		// clear interval on re-render to avoid memory leaks
		return () => clearInterval(intervalId);
		// add timeLeft as a dependency to re-rerun the effect
		// when we update it
	}, [timeLeft]);

	async function executeMutation() {
		//claim tokens
		if (mutationReceipt?.state?.pending && timeLeft.raw === 0) {
			//execute mutation
			const { tx } = await mutationWrapper.execute(wallet.publicKey, undefined, mutationOwner);
			await tx.confirm();
		}

		// reverse mutation
		if (mutationReceipt?.state?.complete && mutationData?.config.reversible) {
			const { tx } = await mutationWrapper.reverse(wallet.publicKey, mutationOwner);
			await tx.confirm();
		}

		//check if tokens were selected by user
		Object.keys(mutationData?.config).forEach((key) => {
			if (key.includes("takerToken") && mutationData?.config[key].requiredAmount.toNumber() > 0) {
				if (selectedTokens[mutationData?.config[key]?.gemBank.toBase58()] === undefined) {
					throw new Error("missing required tokens. please select tokens for each required vault.");
				}
			}
		});

		if (mutationWrapper && transmuterWrapper) {
			//@TODO
			//if taker vaults already initiated, fetch PDAs of existing vaults
			const vaultA = await mutationWrapper.initTakerVault(transmuterWrapper.bankA, wallet.publicKey);
			const vaultB = await mutationWrapper.initTakerVault(transmuterWrapper.bankB, wallet.publicKey);
			const vaultC = await mutationWrapper.initTakerVault(transmuterWrapper.bankC, wallet.publicKey);

			// //init all three taker vaults in one trx
			const largeTx = vaultA.tx.combine(vaultB.tx).combine(vaultC.tx);
			await largeTx.confirm();

			const { isFromWhiteList, mint, creatorPk } = selectedTokens[mutationData?.config.takerTokenA?.gemBank.toBase58()];

			const [mintProof, bump] = await findWhitelistProofPDA(transmuterWrapper.bankA, new PublicKey(mint));
			let creatorProof_;
			if (creatorPk !== undefined && creatorPk !== "") {
				const [creatorProof, bump2] = await findWhitelistProofPDA(transmuterWrapper.bankA, new PublicKey(creatorPk));
				creatorProof_ = creatorProof;
			}
			const ataTokenA = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
				mint: new PublicKey(mint),
			});

			await gemBankClient.depositGem(
				transmuterWrapper.bankA,
				vaultA.vault,
				wallet.publicKey,
				mutationData.config.takerTokenA.requiredAmount,
				new PublicKey(mint),
				ataTokenA.value[0].pubkey,
				isFromWhiteList && mintProof,
				// @TODO add metadata support
				undefined,
				isFromWhiteList && creatorProof_ && creatorProof_
			);

			if (selectedTokens[mutationData?.config.takerTokenB?.gemBank.toBase58()]?.mint !== undefined) {
				const { isFromWhiteList, mint, creatorPk } = selectedTokens[mutationData?.config.takerTokenB?.gemBank.toBase58()];
				const [mintProof, bump] = await findWhitelistProofPDA(transmuterWrapper.bankB, new PublicKey(mint));
				let creatorProof_;
				if (creatorPk !== undefined && creatorPk !== "") {
					const [creatorProof, bump2] = await findWhitelistProofPDA(transmuterWrapper.bankB, new PublicKey(creatorPk));
					creatorProof_ = creatorProof;
				}
				const ataTokenB = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
					mint: new PublicKey(mint),
				});

				await gemBankClient.depositGem(
					transmuterWrapper.bankB,
					vaultB.vault,
					wallet.publicKey,
					mutationData.config.takerTokenB.requiredAmount,
					new PublicKey(mint),
					ataTokenB.value[0].pubkey,
					isFromWhiteList && mintProof,

					// @TODO add metadata support
					undefined,
					isFromWhiteList && creatorProof_ && creatorProof_
				);
			}

			if (selectedTokens[mutationData?.config.takerTokenC?.gemBank.toBase58()]?.mint !== undefined) {
				const { isFromWhiteList, mint, creatorPk } = selectedTokens[mutationData?.config.takerTokenC?.gemBank.toBase58()];
				const [mintProof, bump] = await findWhitelistProofPDA(transmuterWrapper.bankC, new PublicKey(mint));
				let creatorProof_;
				if (creatorPk !== undefined && creatorPk !== "") {
					const [creatorProof, bump2] = await findWhitelistProofPDA(transmuterWrapper.bankC, new PublicKey(creatorPk));
					creatorProof_ = creatorProof;
				}

				const ataTokenC = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
					mint: new PublicKey(mint),
				});
				await gemBankClient.depositGem(
					transmuterWrapper.bankC,
					vaultC.vault,
					wallet.publicKey,
					mutationData.config.takerTokenC.requiredAmount,
					new PublicKey(mint),
					ataTokenC.value[0].pubkey,
					isFromWhiteList && mintProof,

					// @TODO add metadata support
					undefined,
					isFromWhiteList && creatorProof_ && creatorProof_
				);
			}

			//execute mutation
			const { tx } = await mutationWrapper.execute(wallet.publicKey, undefined, mutationOwner);
			const { signature } = await tx.confirm();

			if (signature) {
				await getMutation();
			}
		}
	}

	async function getAllWhitelistedPDAs(bank: PublicKey) {
		const whitelistPdas = await gemBankClient?.fetchAllWhitelistProofPDAs(bank);
		const whitelistPdas_ = whitelistPdas?.map((item) => {
			return {
				whiteListType: parseWhitelistType(item.account.whitelistType),
				publicKey: item.account.whitelistedAddress.toBase58(),
			};
		});

		return whitelistPdas_;
	}

	return (
		<div className="py-10">
			<ToastContainer theme="colored" />
			<header>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
					<h1 className="text-3xl font-bold leading-tight text-gray-900 uppercase ">{new TextDecoder().decode(new Uint8Array(mutationData?.name))}</h1>

					<div className="flex flex-col sm:flex-row items-center text-sm flex-wrap justify-start sm:space-x-4">
						<div className="flex items-center ">
							<BeakerIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							<span className="text-gray-800 font-medium pl-1.5">
								{mutationData?.totalUses.toNumber() - mutationData?.remainingUses.toNumber()}/{mutationData?.totalUses.toNumber()}
							</span>
							<span className="text-gray-400 pl-1">times used</span>
						</div>

						<div className="flex items-center">
							<ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.mutationDurationSec.toNumber()}s</span>
							<span className="text-gray-400 pl-1">to finish</span>
						</div>
						<div className="flex items-center">
							<RefreshIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
							<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.reversible ? "reversable" : "irreversible"}</span>
						</div>
						<div className="flex items-center">
							<img src="/images/solana.png" className="w-4 h-4" alt="solana_logo" />
							<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.price?.priceLamports.toNumber() / LAMPORTS_PER_SOL} SOL </span>
							<span className="text-gray-400 pl-1">to execute</span>
						</div>
						{mutationData?.config.reversible && (
							<div className="flex items-center">
								<img src="/images/solana.png" className="w-4 h-4" alt="solana_logo" />
								<span className="text-gray-800 font-medium pl-1.5">{mutationData?.config?.price?.reversalPriceLamports.toNumber() / LAMPORTS_PER_SOL} SOL </span>
								<span className="text-gray-400 pl-1">to reverse</span>
							</div>
						)}
					</div>

					{(mutationReceipt?.state?.complete || mutationReceipt?.state?.pending) && (
						<div className=" flex items-center text-sm text-gray-800 font-medium sm:mr-6 sm:mt-0">
							{mutationReceipt?.state?.pending && timeLeft.raw > 0 && (
								<>
									{" "}
									<ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-400" aria-hidden="true" />
									{timeLeft.formatted} <span className="text-gray-400 pl-1.5">until the Mutation is finished</span>
								</>
							)}
							{mutationReceipt?.state?.pending && timeLeft.raw === 0 && (
								<>
									{" "}
									<ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-yellow-400" aria-hidden="true" />
									Mutation is complete, claim your tokens
								</>
							)}

							{mutationReceipt?.state?.complete && (
								<>
									{" "}
									<CheckCircleIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" aria-hidden="true" />
									Mutation is complete
								</>
							)}
						</div>
					)}

					<button
						onClick={() => {
							toast.promise(
								executeMutation,
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
						disabled={!wallet.publicKey || (mutationReceipt?.state?.pending && timeLeft.raw > 0) || (mutationReceipt?.state?.complete && !mutationData?.config.reversible)}
						type="button"
						className="disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 duration-150 transition-all ease-in"
					>
						<BeakerIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />
						{mutationReceipt?.state?.pending && timeLeft.raw > 0 && `Mutation is pending`}
						{mutationReceipt?.state?.pending && timeLeft.raw === 0 && `Claim tokens`}
						{mutationReceipt?.state?.complete && mutationData?.config.reversible && `Reverse mutation`}
						{mutationReceipt?.state?.complete && !mutationData?.config.reversible && `Can't reverse mutation`}
						{timeLeft.raw === -99 && (!mutationReceipt || mutationReceipt?.state?.notStarted) && "Start mutation"}
					</button>
				</div>
			</header>
			<main>
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					{/* Replace with your content */}
					<div className="px-4 py-8 sm:px-0 ">
						{/* MAKER VAULTS */}

						{mutationData !== null && takerBankWhitelist !== null && (
							<Vaults
								selectedTokens={selectedTokens}
								wallet={wallet}
								mutationData={mutationData}
								takerBankWhitelist={takerBankWhitelist}
								connection={connection}
								setSelectedTokens={setSelectedTokens}
							/>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};
