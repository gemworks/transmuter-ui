import create, { State } from "zustand";
import { Connection } from "@solana/web3.js";
import { SolanaProvider, Wallet } from "@saberhq/solana-contrib";
import { TransmuterSDK } from "@gemworks/transmuter-ts";
interface TransmuterStore extends State {
	sdk: TransmuterSDK;
	initSDK: (wallet: Wallet, connection: Connection) => void;
}

const useTransmuterStore = create<TransmuterStore>((set, _get) => ({
	sdk: null,
	initSDK: (wallet: Wallet, connection) => {
		let sdk = null;

		const provider = SolanaProvider.init({
			connection,
			wallet,
		});
		sdk = TransmuterSDK.load({ provider });
		set((s) => {
			s.sdk = sdk;
			console.log(`sdk updated`, s.sdk);
		});
	},
}));

export default useTransmuterStore;
