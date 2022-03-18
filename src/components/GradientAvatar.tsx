import avatar from "gradient-avatar";
import { useState, useEffect } from "react";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
interface GradientAvatarProps {
	hash: string;
	width?: number;
	height?: number;
	cssClasses?: string;
}
export default function GradientAvatar({ hash, width, height, cssClasses }: GradientAvatarProps) {
	const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
	useEffect(() => {
		new TokenListProvider().resolve().then((tokens) => {
			const tokenList = tokens.filterByChainId(101).getList();

			setTokenMap(
				tokenList.reduce((map, item) => {
					map.set(item.address, item);
					return map;
				}, new Map())
			);
		});
	}, [setTokenMap]);
	const token = tokenMap.get(hash);
	if (!token || !token.logoURI) {
		const svgAvatar = avatar(hash === undefined ? "" : hash);
		return (
			<img
				className={`rounded-full w-${width ? width : 9} h-${height ? height : 9} object-scale-none ${cssClasses && cssClasses}`}
				src={`data:image/svg+xml;utf8,${encodeURIComponent(svgAvatar)}`}
			/>
		);
	} else {
		return <img className={`rounded-full w-${width ? width : 9} h-${height ? height : 9} object-scale-none ${cssClasses && cssClasses}`} src={token.logoURI} />;
	}
}
