import { useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import useGembankStore from "stores/useGembankStore";

export default function useGembankClient() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const gemBankClient = useGembankStore((s) => s.gemBankClient);
  const { initGemBankClient } = useGembankStore();
  console.log({ gemBankClient });

  useEffect(() => {
    if (wallet.publicKey && connection && gemBankClient === null) {
      initGemBankClient(wallet, connection);
    }
  }, [wallet.publicKey, connection]);

  return gemBankClient;
}
