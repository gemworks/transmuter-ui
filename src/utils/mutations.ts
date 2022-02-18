import { SolanaProvider } from "@saberhq/solana-contrib";
import { MutationConfig, RequiredUnits, VaultAction, TakerTokenConfig } from "@gemworks/transmuter-ts";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor";
import {
	toBN,
  } from "@gemworks/gem-farm-ts";
async function prepareMutation({
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
	makerMintA = null,
	makerMintB = null,
	makerMintC = null,
}: {
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
	makerMintB: PublicKey;
	makerMintC: PublicKey;
}) {
	// record uses
	this.uses = uses;

	// create any relevant maker mints
	[this.makerMintA] = await this.sdk.createMintAndATA(this.makerTokenAmount);
	if (makerTokenBAmountPerUse) {
		[this.makerMintB] = await this.sdk.createMintAndATA(makerTokenBAmountPerUse.mul(uses));
	}
	if (makerTokenCAmountPerUse) {
		[this.makerMintC] = await this.sdk.createMintAndATA(makerTokenCAmountPerUse.mul(uses));
	}

	const config: MutationConfig = {
		takerTokenA: {
			gemBank: this.transmuter.bankA,
			requiredAmount: this.takerTokenAmount,
			requiredUnits: RequiredUnits.RarityPoints,
			vaultAction,
		},
		takerTokenB,
		takerTokenC,
		makerTokenA: {
			mint: this.makerMintA,
			totalFunding: this.makerTokenAmount,
			amountPerUse: this.makerTokenAmountPerUse,
		},
		makerTokenB: makerTokenBAmountPerUse
			? {
					mint: new PublicKey(this.makerMintB),
					totalFunding: makerTokenBAmountPerUse.mul(uses),
					amountPerUse: makerTokenBAmountPerUse,
			  }
			: null,
		makerTokenC: makerTokenCAmountPerUse
			? {
					mint: this.makerMintC,
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

	const { mutationWrapper, tx } = await this.sdk.initMutation(config, this.transmuter.key, uses);

	// setup & fill up any relevant taker vaults
	({ vault: this.takerVaultA, takerMint: this.takerMintA, takerAcc: this.takerAccA } = await this.prepareTakerVaults(this.transmuter.bankA));
	if (takerTokenB) {
		({ vault: this.takerVaultB, takerMint: this.takerMintB, takerAcc: this.takerAccB } = await this.prepareTakerVaults(this.transmuter.bankB));
	}
	if (takerTokenC) {
		({ vault: this.takerVaultC, takerMint: this.takerMintC, takerAcc: this.takerAccC } = await this.prepareTakerVaults(this.transmuter.bankC));
	}
}
