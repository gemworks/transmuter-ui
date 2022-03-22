import create, { State } from "zustand";
import { Connection } from "@solana/web3.js";
import { SolanaProvider, Wallet } from "@saberhq/solana-contrib";
import { TransmuterSDK } from "@gemworks/transmuter-ts";
interface TransmuterStore extends State {
	transmuterClient: TransmuterSDK;
	initTransmuterClient: (wallet: Wallet, connection: Connection) => void;
}

const useTransmuterStore = create<TransmuterStore>((set, _get) => ({
	transmuterClient: null,
	initTransmuterClient: (wallet: Wallet, connection: Connection) => {


		const provider = SolanaProvider.init({
			connection,
			wallet,
		});
	
		let transmuterClient = TransmuterSDK.load({ provider });
		set((s) => {
			s.transmuterClient = transmuterClient;
		});
	},
}));

export default useTransmuterStore;
