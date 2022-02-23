import { SolanaProvider } from "@saberhq/solana-contrib";
import { MutationConfig, RequiredUnits, VaultAction, TakerTokenConfig } from "@gemworks/transmuter-ts";
import { LAMPORTS_PER_SOL, PublicKey, Keypair } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { TransmuterSDK, TransmuterWrapper } from "@gemworks/transmuter-ts";
import { toBN } from "@gemworks/gem-farm-ts";
import { getATAAddress } from "@saberhq/token-utils";

export const prepareMutation = async ({
	sdk,
	transmuter,
	mutationName = "default",
	owner,
	vaultAction = VaultAction.Lock,
	mutationDurationSec = toBN(0),
	takerTokenB = null,
	takerTokenC = null,
	makerTokenAmountPerUse = toBN(0),
	makerTokenBAmountPerUse = null,
	makerTokenCAmountPerUse = null,
	reversible = false,
	uses = toBN(1),
	mutationInitError = undefined,
	reversalPriceLamports = toBN(LAMPORTS_PER_SOL),
	makerMintA,
	makerMintB,
	makerMintC,
	makerTokenAmount = toBN(0),
	takerTokenAmount = toBN(0),

}: {
	sdk: TransmuterSDK;
	transmuter: TransmuterWrapper;
	mutationName: string;
	owner: PublicKey;
	vaultAction?: any;
	mutationDurationSec?: BN;
	takerTokenB?: TakerTokenConfig;
	takerTokenC?: TakerTokenConfig;
	makerTokenAmountPerUse: BN;
	makerTokenBAmountPerUse?: BN;
	makerTokenCAmountPerUse?: BN;
	reversible?: boolean;
	uses?: BN;
	mutationInitError?: string;
	reversalPriceLamports?: BN;
	makerMintA: PublicKey;
	makerMintB?: PublicKey;
	makerMintC?: PublicKey;
	makerTokenAmount: BN;
	takerTokenAmount: BN;

}) => {
	// create any relevant maker mints
	let rest: any;
	// [makerMintA, rest]  = await sdk.createMintAndATA(makerTokenAmount);
	// if (makerTokenBAmountPerUse) {
	// 	[makerMintB, rest] = await sdk.createMintAndATA(makerTokenBAmountPerUse.mul(uses));
	// }
	// if (makerTokenCAmountPerUse) {
	// 	[makerMintC, rest] = await sdk.createMintAndATA(makerTokenCAmountPerUse.mul(uses));
	// }

	// makerMintA = await getATAAddress({
	// 	mint: makerMintA,
	// 	owner: owner,
	// });


	


	// if (makerMintB) {
	// 	makerMintB = await getATAAddress({
	// 		mint: makerMintB,
	// 		owner: owner,
	// 	});
	// }
	// if (makerMintC) {
	// 	makerMintB = await getATAAddress({
	// 		mint: makerMintC,
	// 		owner: owner,
	// 	});
	// }


	// console.log({a: makerMintA.toBase58(), b: makerMintB.toBase58(), c: makerMintC.toBase58()})
	const config: MutationConfig = {
		takerTokenA: {
			gemBank: transmuter.bankA,
			requiredAmount: takerTokenAmount,
			requiredUnits: RequiredUnits.RarityPoints,
			vaultAction,
		},
		takerTokenB,
		takerTokenC,
		makerTokenA: {
			mint: makerMintA,
			totalFunding: makerTokenAmount,
			amountPerUse: makerTokenAmountPerUse,
		},
		makerTokenB: makerTokenBAmountPerUse
			? {
					mint: makerMintB,
					totalFunding: makerTokenBAmountPerUse.mul(uses),
					amountPerUse: makerTokenBAmountPerUse,
			  }
			: null,
		makerTokenC: makerTokenCAmountPerUse
			? {
					mint: makerMintC,
					totalFunding: makerTokenCAmountPerUse.mul(uses),
					amountPerUse: makerTokenCAmountPerUse,
			  }
			: null,
		price: {
			priceLamports: toBN(LAMPORTS_PER_SOL),
			reversalPriceLamports,
		},
		mutationDurationSec,
		reversible,
	};
	console.log("config",config);
	//thesis: true
	console.log("test", config.makerTokenB && config.makerTokenB.mint);
	const { mutationWrapper, tx } = await sdk.initMutation(config, transmuter.key, uses, owner, mutationName);
	console.log("mutation", { mutationWrapper, tx });

	const res = await tx.confirm();
	console.log("res", res);
	// setup & fill up any relevant taker vaults
	// ({ vault: takerVaultA, takerMint: takerMintA, takerAcc: takerAccA } = await prepareTakerVaults(transmuter.bankA));
	// if (takerTokenB) {
	// 	({ vault: takerVaultB, takerMint: takerMintB, takerAcc: takerAccB } = await prepareTakerVaults(transmuter.bankB));
	// }
	// if (takerTokenC) {
	// 	({ vault: takerVaultC, takerMint: takerMintC, takerAcc: takerAccC } = await prepareTakerVaults(transmuter.bankC));
	// }
};
