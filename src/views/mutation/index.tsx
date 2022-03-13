// Next, React
import { FC, useEffect, useState } from "react";
import Link from "next/link";

// Wallet
import { useWallet, useConnection } from "@solana/wallet-adapter-react";

// Components
import { RequestAirdrop } from "../../components/RequestAirdrop";
import pkg from "../../../package.json";

// Store
import useUserSOLBalanceStore from "../../stores/useUserSOLBalanceStore";
import { PlusIcon } from "@heroicons/react/solid";
import useTransmuterStore from "../../stores/useTransmuterStore";

import { SolanaProvider, Wallet } from "@saberhq/solana-contrib";
import { Connection, PublicKey, Transaction, TransactionInstruction, LAMPORTS_PER_SOL } from "@solana/web3.js";

import { useRouter } from "next/router";
import { MutationConfig, RequiredUnits, VaultAction, TakerTokenConfig, TransmuterSDK, TransmuterWrapper, MutationWrapper, MutationData } from "@gemworks/transmuter-ts";
import useGembankStore from "../../stores/useGembankStore";
import { parseWhitelistType } from "../../utils/helpers";
import { GemBankClient } from "@gemworks/gem-farm-ts";
import { ToastContainer, toast } from "react-toastify";

interface VaultProps {
	mutationData: MutationData;
	takerBankWhitelist: { [key: string]: { publicKey: string; whiteListType: string }[] };
	connection: Connection;
	wallet: Wallet;
}

interface TokenBalanceProps {
	[bank: string]: {
		availableMints: { [mint: string]: { hasSufficientBalance: boolean; type: string } };
		whiteListLength: number;
	};
}
interface TokenBalance {
	tokens: TokenBalanceProps;
}

export function Vaults({ mutationData, takerBankWhitelist, connection, wallet }: VaultProps) {
	const [availableTokens, setAvailableTokens] = useState<TokenBalance>({
		tokens: {},
	});
	const [mutation, setMutation] = useState(mutationData.config);

	async function hasSufficientTokenBalance(takerBankWhitelist: { [key: string]: { publicKey: string; whiteListType: string }[] }): Promise<TokenBalanceProps> {
		try {
			let aggregatedBalances = {};

			for await (const [key, bank] of Object.entries(takerBankWhitelist)) {
				//just push the key if no address is whitelisted

				if (bank.length === 0) {
					aggregatedBalances[key] = { availableMints: {}, whiteListLength: 0 };
				} else {
					for await (const whitelistedAddress of bank) {
						if (whitelistedAddress.whiteListType.toLowerCase() === "creator") {
							//get all tokens inside the creators wallet
							const { value } = await connection.getParsedTokenAccountsByOwner(new PublicKey(whitelistedAddress.publicKey), {
								programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
							});

							const ownedMints = [];
							//check if the whitelisted creator address matches the mint authority of the token
							for (const account of value) {
								const { value } = await connection.getParsedAccountInfo(new PublicKey(account.account.data["parsed"].info.mint));

								if (value.data["parsed"].info.mintAuthority === whitelistedAddress.publicKey) {
									ownedMints.push(account.account.data["parsed"].info.mint);
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
										type: "mint",
									};
								} else {
									mintBalances[mint] = {
										hasSufficientBalance: false,
										type: "mint",
									};
								}

								//push tokens created by the specified address to the array
								aggregatedBalances[key] = { availableMints: mintBalances, whiteListLength: ownedMints.length };
							}
						} else {
							//check if the user has sufficient tokens in his wallet
							//@TODO check if required amount for mutation matches user's current token balance

							const { value } = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") });
							let ownedTokensCount = 0;
							if (value.length > 0) {
								value.forEach((account) => {
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
						}
					}
				}
			}

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
			hasSufficientTokenBalance_(),
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
			<div className=" text-gray-900 flex flex-col text-sm space-y-2">
				{Object.keys(mutation).map((key, index) => {
					// const bank = mutationData.config[key].gemBank.toBase58();
					return (
						<div key={index}>
							{key.includes("makerToken") && (
								<div className="bg-blue-100">
									<div>receive per use: {mutation[key].amountPerUse.toString()}</div>
									<div>token mint receive on use: {mutation[key].mint.toBase58()}</div>
								</div>
							)}
							{key.includes("takerToken") && (
								<div className="bg-green-100">
									<div>deposit per use: {mutation[key].requiredAmount.toString()}</div>
									{/* <div className="text-gray-900"> {availableTokens.tokens[mutationData.config[key].gemBank.toBase58()].availableMints}</div> */}
									<div className="text-red-400 text-xl">{availableTokens.tokens[mutation[key].gemBank.toBase58()]?.whiteListLength}</div>

									<div>
										{Object.keys(availableTokens.tokens).length > 0 ? (
											<div>
												{availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints !== undefined &&
												Object.keys(availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints).length > 0 ? (
													<div>
														{Object.keys(availableTokens.tokens[mutation[key].gemBank.toBase58()]?.availableMints).map((key, index) => (
															<div key={index}>
																<div>KEY: {key}</div>

																{availableTokens.tokens[mutation[key]?.gemBank.toBase58()]?.availableMints[key]?.hasSufficientBalance === false ? (
																	<div className="text-red-500">no enough tokens</div>
																) : (
																	<div className="text-green-500">enough tokens</div>
																)}
															</div>
														))}
													</div>
												) : (
													<div>you don't own any of the required tokens</div>
												)}
											</div>
										) : (
											<div>no tokens</div>
										)}
									</div>
								</div>
							)}
						</div>
					);
				})}
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
		if (transmuterClient) {
			getMutation();
		}
	}, [mutationPublicKey, transmuterClient]);
	async function getMutation() {
		const mutatonPk = new PublicKey(mutationPublicKey);
		const mutationData = await transmuterClient.programs.Transmuter.account.mutation.fetch(mutatonPk);
		setMutationData(mutationData);

		const mutationWrapper_ = new MutationWrapper(transmuterClient, mutatonPk, mutationData.transmuter, mutationData);
		setMutationWrapper(mutationWrapper_);
		console.log("wrapper", mutationWrapper_);
		console.log("mutation_data", mutationData);
		console.log("transmuter_wrapper", transmuterWrapper);

		const transmuterData = await transmuterClient.programs.Transmuter.account.transmuter.fetch(mutationData.transmuter);
		const { bankA, bankB, bankC } = transmuterData;

		//WRAPPER
		const transmuterWrapper_ = new TransmuterWrapper(transmuterClient, mutationData.transmuter, bankA, bankB, bankC, transmuterData);

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

	async function executeMutation() {
		if (mutationWrapper && transmuterWrapper) {
			console.log(mutationWrapper);
			const trxA = await mutationWrapper.initTakerVault(transmuterWrapper.bankA, wallet.publicKey);
			const trxB = await mutationWrapper.initTakerVault(transmuterWrapper.bankB, wallet.publicKey);
			const trxC = await mutationWrapper.initTakerVault(transmuterWrapper.bankC, wallet.publicKey);

			//init all three taker vaults in one trx
			const largeTx = trxA.tx.combine(trxB.tx).combine(trxC.tx);
			const res = await largeTx.confirm();
			console.log("initiated vaults", res);
			//deposit coins / nfts

			//get required gem amount [x]

			//const res = await gemBankClient.depositGem(transmuterWrapper.bankA, trxA.vault, wallet.publicKey, mutationData.config.takerTokenA.requiredAmount, ACCEPTED_TAKER_MINT, )

			//execute mutation
			const { tx } = await mutationWrapper.execute(wallet.publicKey);
			const data = await tx.confirm();
			console.log("executed mutation", data);
		}
	}
	async function getAllWhitelistedPDAs(bank: PublicKey) {
		const whitelistPdas = await gemBankClient.fetchAllWhitelistProofPDAs(bank);
		const whitelistPdas_ = whitelistPdas.map((item) => {
			return {
				whiteListType: parseWhitelistType(item.account.whitelistType),
				publicKey: item.account.whitelistedAddress.toBase58(),
			};
		});

		return whitelistPdas_;
	}

	return (
		<div className="py-10">
			<header>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<h1 className="text-3xl font-bold leading-tight text-gray-900">
						{new TextDecoder().decode(new Uint8Array(mutationData?.name))} Mutation {new TextDecoder().decode(new Uint8Array(mutationData?.reserved))}
					</h1>
					<div className="text-gray-900 flex justify-between">
						<div>remaining uses {mutationData?.remainingUses.toNumber()}</div>
						<div>total uses {mutationData?.totalUses.toNumber()}</div>
						<div>mutation duration in seconds {mutationData?.config?.mutationDurationSec.toNumber()}</div>
						<div>reversible? {mutationData?.config.reversible ? "yes" : "no"}</div>
						<div>reversalPrice {mutationData?.config?.price?.reversalPriceLamports.toNumber() / LAMPORTS_PER_SOL}</div>
						<div>execution price {mutationData?.config?.price?.priceLamports.toNumber() / LAMPORTS_PER_SOL}</div>
					</div>

					<button
						onClick={() => {
							executeMutation();
						}}
						disabled={!wallet.publicKey}
						type="button"
						className="mt-10 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 disabled:opacity-75 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
					>
						<PlusIcon className="-ml-1 mr-3 h-5 w-5" aria-hidden="true" />x
					</button>
				</div>
			</header>
			<main>
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					{/* Replace with your content */}
					<div className="px-4 py-8 sm:px-0">
						<div className="flex justify-between ">
							{/* MAKER VAULTS */}
							<div className="flex flex-col">
								{mutationData !== null && takerBankWhitelist !== null && (
									<Vaults wallet={wallet} mutationData={mutationData} takerBankWhitelist={takerBankWhitelist} connection={connection} />
								)}
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};
