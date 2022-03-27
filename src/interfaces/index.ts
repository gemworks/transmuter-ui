export interface WhiteListProps {
	whiteListType: string;
	publicKey: string;
}

export interface SelectedTokens {
	[takerVault: string]: { mint: string; type: string; creatorPk?: string; isFromWhiteList?: boolean };
}
