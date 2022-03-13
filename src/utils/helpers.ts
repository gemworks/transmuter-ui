export function formatPublickey(publicKey: string): string {
	if (publicKey === undefined) {
		return "";
	}
	const length = publicKey.length;

	return publicKey.substring(0, 5) + ".." + publicKey.substring(length, length - 5);
}

export function parseString(unparsedString: number[]): string {
	return String.fromCharCode.apply(null, new Uint8Array(unparsedString));
}

export const parseWhitelistType = (numType: number) => {
	switch (numType) {
		case 1:
			return "Creator";
		case 2:
			return "Mint";
		case 3:
			return "Mint + Whitelist";
		default:
			return "unknown";
	}
};
