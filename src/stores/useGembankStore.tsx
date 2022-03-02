import create, { State } from "zustand";
import { Connection, PublicKey } from "@solana/web3.js";
import { Wallet } from "@saberhq/solana-contrib";
import { GemBankClient } from "@gemworks/gem-farm-ts";
import { Idl } from "@project-serum/anchor";
import gemBankIdl from "../utils/misc/idl/gem_bank.json";

const gemBankProgramId = new PublicKey("bankHHdqMuaaST4qQk6mkzxGeKPHWmqdgor6Gs8r88m");

interface GembankStore extends State {
	gemBankClient: GemBankClient;
	initGemBankClient: (wallet: Wallet, connection: Connection) => void;
}

const useGembankStore = create<GembankStore>((set, _get) => ({
	gemBankClient: null,
	initGemBankClient: (wallet: Wallet, connection: Connection) => {
		let gemBankClient = new GemBankClient(connection, wallet as any, gemBankIdl as any, gemBankProgramId);
		set((s) => {
			s.gemBankClient = gemBankClient;
		});
	},
}));

export default useGembankStore;
