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
	executionPriceLamports = toBN(LAMPORTS_PER_SOL),
	makerMintA,
	makerMintB,
	makerMintC,
	makerTokenAmount = toBN(0),
	takerTokenAmount = toBN(0),
	takerTokenUnits = RequiredUnits.Gems,
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
	takerTokenUnits: any;
	executionPriceLamports?: BN;
}) => {
	const config: MutationConfig = {
		takerTokenA: {
			gemBank: transmuter.bankA,
			requiredAmount: takerTokenAmount,
			requiredUnits: takerTokenUnits,
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
			priceLamports: executionPriceLamports,
			reversalPriceLamports,
		},
		mutationDurationSec,
		reversible,
	};

	const { mutationWrapper, tx } = await sdk.initMutation(config, transmuter.key, uses, owner, mutationName);

	const {signature} = await tx.confirm();
	return signature;

	// setup & fill up any relevant taker vaults
	// ({ vault: takerVaultA, takerMint: takerMintA, takerAcc: takerAccA } = await prepareTakerVaults(transmuter.bankA));
	// if (takerTokenB) {
	// 	({ vault: takerVaultB, takerMint: takerMintB, takerAcc: takerAccB } = await prepareTakerVaults(transmuter.bankB));
	// }
	// if (takerTokenC) {
	// 	({ vault: takerVaultC, takerMint: takerMintC, takerAcc: takerAccC } = await prepareTakerVaults(transmuter.bankC));
	// }
};
