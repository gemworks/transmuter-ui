import GradientAvatar from "./GradientAvatar";
import { RadioGroup } from "@headlessui/react";
interface VaultProps {
	name: string;
	type: "Maker" | "Taker";
	tokenMintAddress?: string;
	setTokenMintAddress?: (e) => void;
	handleTokenMintAddressChange?: (e: any) => void;
	amountPerUse: number;
	setAmountPerUse: (e) => void;
	handleAmountPerUseChange: (e: any) => void;
	totalFunding?: number;
	setTotalFunding?: (e) => void;
	handleTotalFundingChange?: (e: any) => void;
	setEscrowAccountAction?: (e: any) => void;
	setBank?: () => void;
	openBank?: () => void;
	escrowAccountAction?: string;
}
function classNames(...classes) {
	return classes.filter(Boolean).join(" ");
}

export default function Vault({
	name,
	type,
	tokenMintAddress,
	setTokenMintAddress,
	handleTokenMintAddressChange,
	amountPerUse,
	handleAmountPerUseChange,
	totalFunding,
	setTotalFunding,
	handleTotalFundingChange,
	setBank,
	openBank,
	setAmountPerUse,
	setEscrowAccountAction,
	escrowAccountAction,
}: VaultProps) {
	function formatPublickey(publicKey: string): string {
		if (publicKey === undefined) {
			return "";
		}
		const length = publicKey.length;

		return publicKey.substring(0, 5) + ".." + publicKey.substring(length, length - 5);
	}

	const vaulOptions = [
		{
			value: "do-nothing",
			title: "Do Nothing",
			description: "Omits this property",
		},
		{
			value: "lock",
			title: "Lock",
			description: "Locks the tokens, deposited by the taker.",
		},
		{
			value: "change-owner",
			title: "Change Owner",
			description: "Lets you reassign the tokens, deposited by the taker, to yourself",
		},
	];
	return (
		<div className="space-y-3 py-5">
			<label htmlFor="project-name" className="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2 px-4  sm:px-6">
				{type} Vault
			</label>
			<div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6">
				<div>
					<label htmlFor="project-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
						{type === "Maker" ? "Token Mint Address" : "Bank Config"}
					</label>
				</div>
				<div className="sm:col-span-2">
					{type === "Maker" ? (
						<input
							value={tokenMintAddress}
							onChange={(e) => {
								handleTokenMintAddressChange(e);
							}}
							onPaste={(e) => {
								const pastedText = e.clipboardData.getData("Text");
								setTokenMintAddress(pastedText);
								e.preventDefault();
							}}
							onCut={(e: any) => {
								setTokenMintAddress(e.target.value);
							}}
							type="text"
							name="project-name"
							id="project-name"
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					) : (
						<div
							className="flex items-center hover:opacity-75 transition-all duration-150 ease-in text-sm font-medium text-gray-700 sm:pt-2 cursor-pointer"
							onClick={() => {
								setBank();
								openBank();
							}}
						>
							<GradientAvatar width={7} height={7} hash={name} />
							<span className="pl-2">{formatPublickey(name)}</span>
						</div>
					)}
				</div>
			</div>
			{type === "Maker" && (
				<div className=" px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6">
					<div>
						<label htmlFor="project-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
							Total Funding
						</label>
					</div>
					<div className="sm:col-span-2">
						<input
							value={totalFunding}
							onChange={(e) => {
								handleTotalFundingChange(e);
							}}
							onPaste={(e) => {
								const pastedText = e.clipboardData.getData("Text");
								setTotalFunding(pastedText);
								e.preventDefault();
							}}
							onCut={(e: any) => {
								setTotalFunding(e.target.value);
							}}
							type="number"
							name="project-name"
							id="project-name"
							className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
						/>
					</div>
				</div>
			)}

			<div className="px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6">
				<div>
					<label htmlFor="project-name" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
						Amount per use
					</label>
				</div>
				<div className="sm:col-span-2">
					<input
						value={amountPerUse}
						onChange={(e) => {
							handleAmountPerUseChange(e);
						}}
						onPaste={(e) => {
							const pastedText = e.clipboardData.getData("Text");
							setAmountPerUse(pastedText);
							e.preventDefault();
						}}
						type="number"
						name="project-name"
						id="project-name"
						className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
					/>
				</div>
			</div>

			{/* Vault Action */}

			{type === "Taker" && (
				<fieldset>
					<div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
						<div>
							<legend className="text-sm font-medium text-gray-700">Escrow Account Action</legend>
						</div>
						<div className="space-y-5 sm:col-span-2">
							<div className="space-y-5 sm:mt-0">
								<RadioGroup value={escrowAccountAction} onChange={setEscrowAccountAction}>
									{vaulOptions.map((vaultOption) => (
										<div className="relative flex items-start">
											<div className="absolute flex h-5 items-center">
												<RadioGroup.Option
													key={vaultOption.value}
													value={vaultOption.value}
													// className={({ active, checked }) =>
													// 	classNames(active && checked ? "ring ring-indigo-500" : "", checked ? "ring ring-indigo-500" : "", "h-4 w-4 border border-gray-300  rounded-full ")
													// }
													className={({ active, checked }) =>
														classNames(
															checked ? "bg-indigo-600 border-transparent" : "bg-white border-gray-300",
															active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
															"h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center"
														)
													}
												>
													<span className="rounded-full bg-white w-1.5 h-1.5" />
													<RadioGroup.Label as="p" className="sr-only">
														{vaultOption.title}
													</RadioGroup.Label>
												</RadioGroup.Option>
											</div>
											<div className="pl-7 text-sm">
												<label htmlFor="public-access" className="font-medium text-gray-900">
													{vaultOption.title}
												</label>
												<p id="public-access-description" className="text-gray-500">
													{vaultOption.description}
												</p>
											</div>
										</div>
									))}
								</RadioGroup>
							</div>
						</div>
					</div>
				</fieldset>
			)}
		</div>
	);
}
