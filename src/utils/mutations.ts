import { SolanaProvider } from "@saberhq/solana-contrib";
import { MutationConfig, RequiredUnits, VaultAction, TakerTokenConfig } from "@gemworks/transmuter-ts";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import { TransmuterSDK, TransmuterWrapper } from "@gemworks/transmuter-ts";
import { toBN } from "@gemworks/gem-farm-ts";

export const prepareMutation = async ({
	sdk,
	transmuter,
	mutationName = "default",
	vaultAction = VaultAction.Lock,
	mutationDurationSec = toBN(0),
	takerTokenB = null,
	takerTokenC = null,
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
	makerTokenAmountPerUse = toBN(0),
}: {
	sdk: TransmuterSDK;
	transmuter: TransmuterWrapper;
	mutationName: string;
	vaultAction?: any;
	mutationDurationSec?: BN;
	takerTokenB?: TakerTokenConfig;
	takerTokenC?: TakerTokenConfig;
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
	makerTokenAmountPerUse: BN;
}) => {
	// create any relevant maker mints
	let rest: any;
	[makerMintA, rest]  = await sdk.createMintAndATA(makerTokenAmount);
	if (makerTokenBAmountPerUse) {
		[makerMintB, rest] = await sdk.createMintAndATA(makerTokenBAmountPerUse.mul(uses));
	}
	if (makerTokenCAmountPerUse) {
		[makerMintC, rest] = await sdk.createMintAndATA(makerTokenCAmountPerUse.mul(uses));
	}

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
					mint: new PublicKey(makerMintB),
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

	const { mutationWrapper, tx } = await sdk.initMutation(config, transmuter.key, uses, undefined, mutationName);
	console.log("mutation", { mutationWrapper, tx });
	await tx.confirm();
	// setup & fill up any relevant taker vaults
	// ({ vault: takerVaultA, takerMint: takerMintA, takerAcc: takerAccA } = await prepareTakerVaults(transmuter.bankA));
	// if (takerTokenB) {
	// 	({ vault: takerVaultB, takerMint: takerMintB, takerAcc: takerAccB } = await prepareTakerVaults(transmuter.bankB));
	// }
	// if (takerTokenC) {
	// 	({ vault: takerVaultC, takerMint: takerMintC, takerAcc: takerAccC } = await prepareTakerVaults(transmuter.bankC));
	// }
};
