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

export function parseSecondsToDate(seconds_: number): string {
	const days = Math.floor(seconds_ / 86400);
	const hours = Math.floor(seconds_ / 3600);
	const minutes = Math.floor((seconds_ % 3600) / 60);
	const seconds = Math.floor((seconds_ % 3600) % 60);

	let remainingTime = "";

	if (days > 0) {
		remainingTime = ("0" + days).slice(-2) + " days ";
	}

	if (hours > 0) {
		remainingTime += ("0" + hours).slice(-2) + " hours ";
	}
	if (minutes > 0) {
		remainingTime += ("0" + minutes).slice(-2) + " minutes ";
	}
	if (seconds > 0) {
		remainingTime += ("0" + seconds).slice(-2) + " seconds";
	}
	return remainingTime;
}
