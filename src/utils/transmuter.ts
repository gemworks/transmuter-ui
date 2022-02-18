import { PublicKey } from "@solana/web3.js";

export interface Transmutation {
	authority: PublicKey;
	owner: PublicKey;
	authoritySeed: PublicKey;
	authorityBumpSeed: number[];
	bankA: PublicKey;
	bankB: PublicKey;
	bankC: PublicKey;
	reserved: number[];
	version: number;
}
