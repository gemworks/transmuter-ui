import { useEffect, useState } from "react"
import { TrendingUpIcon } from "@heroicons/react/outline";
import GradientAvatar from "components/GradientAvatar";
import { useConnection } from "@solana/wallet-adapter-react";

import { formatPublickey } from "../utils/helpers";

export function MakerToken({ token, mutationData, vaultId}) {
  const {connection} = useConnection()
	const {mint, amountPerUse} = token
	const [decimals, setDecimals] = useState(null)

	useEffect(() => {
		const fetchDecimals = async() => {
			const {value} = await connection.getParsedAccountInfo(mint)
			setDecimals(value?.data?.["parsed"].info?.decimals)
		}
		fetchDecimals()
	}, [])


	

	return (
		<div>
			<div className="py-5 border-b border-gray-200">
				<h3 className="text-lg leading-6 font-medium text-gray-900">
					<span className="uppercase">{new TextDecoder().decode(new Uint8Array(mutationData?.name))}</span> Vault {vaultId}
				</h3>
				<div className="flex items-center  text-sm mt-2 ">
					<TrendingUpIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
					<span className="text-gray-400 pl-1 ">You receive</span>
					<span className="text-gray-800 font-medium pl-1.5">{amountPerUse /  Math.pow(10, decimals)}</span>
					<span className="text-gray-400 pl-1 ">token{amountPerUse.toNumber() > 1 && "s"}</span>
				</div>
			</div>

			<div className="space-x-2 pt-5 flex items-center">
				<GradientAvatar width={7} height={7} hash={mint.toBase58()} />

				<span className="pl-2">{formatPublickey(mint.toBase58())}</span>
			</div>
		</div>
	)
}