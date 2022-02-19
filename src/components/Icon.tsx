import { useState, useEffect } from "react";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import avatar from 'gradient-avatar'
export const Icon = (props: { mint: string }) => {
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

	const token = tokenMap.get(props.mint);
	if (!token || !token.logoURI) {
		const svgAvatar = avatar(props.mint);
		

		return (
			<div className="flex space-x-2 items-center">


				<img className="rounded-full w-9 h-9 object-scale-none" src={`data:image/svg+xml;utf8,${encodeURIComponent(svgAvatar)}`} />
				<div>

					<p className="text-gray-500 font-medium text-sm">{props.mint}</p>
				</div>
			</div>

		);
	}
	return (
		<div className="flex space-x-2 items-center">
			<img className="rounded-full w-9 h-9" src={token.logoURI} />
			<div>
				<p className="text-gray-400 font-medium text-sm">
					{token.name} ({token.symbol})
				</p>
				<p className="text-gray-500 font-medium text-sm">{token.address}</p>
			</div>
		</div>
	);
};
