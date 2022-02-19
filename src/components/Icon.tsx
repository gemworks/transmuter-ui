import { useState, useEffect } from "react";
import {WhiteListProps} from "../interfaces";
import { TokenListProvider, TokenInfo } from "@solana/spl-token-registry";
import avatar from 'gradient-avatar'

interface IconProps extends WhiteListProps {
	removeFromWhiteList: () => void
}

export const Icon = (props: IconProps) => {
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

	const token = tokenMap.get(props.publicKey);
	if (!token || !token.logoURI) {
		const svgAvatar = avatar(props.publicKey);
		

		return (
	
<div className="flex justify-between max-w-lg items-center py-3">
<div className="flex items-center">
	<img className="rounded-full w-9 h-9 object-scale-none mr-3" src={`data:image/svg+xml;utf8,${encodeURIComponent(svgAvatar)}`} />
	<div>
	<span className="text-xs inline-flex items-center px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-500 mb-2">
        {props.whiteListType} Address
      </span>
		<p className="text-gray-500 font-medium text-sm">{props.publicKey}</p>
	</div>

</div>



<button
	onClick={props.removeFromWhiteList}
	type="button"
	className="ml-6 bg-white rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
>
	Remove
</button>
</div>
		);
	}
	return (
		<div className="flex justify-between max-w-lg items-center py-3">
			<div className="flex items-center">
			<img className="rounded-full w-9 h-9 mr-3" src={token.logoURI} />
			<div>
			<span className="text-xs inline-flex items-center px-2 py-0.5 rounded font-medium bg-gray-100 text-gray-500 mb-2">
        {props.whiteListType} Address
      </span>
				<p className="text-gray-400 font-medium text-sm">
					{token.name} ({token.symbol})
				</p>
				<p className="text-gray-500 font-medium text-sm">{token.address}</p>
			</div>

				</div>
		
		

			<button
						onClick={props.removeFromWhiteList}
                            type="button"
                            className="ml-6 bg-white rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Remove
                          </button>
		</div>
	);
};
