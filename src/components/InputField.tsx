interface InputFieldProps {
	publicKey: string;
	inputFieldTitle: string;
	setPublicKey: (e) => void;
	handlePublicKeyChange: (e: any) => void;
	resetPublicKey: () => void;
}
export default function InputField({ publicKey, handlePublicKeyChange, setPublicKey, resetPublicKey, inputFieldTitle }: InputFieldProps) {
	return (
		<div>
			<label htmlFor="email" className="block text-sm font-medium text-gray-700">
				{inputFieldTitle}
			</label>
			<div className="mt-1 relative rounded-md shadow-sm max-w-lg">
				<input
					value={publicKey}
					type="text"
					name="publicKey"
					id="publicKey"
					onChange={(e) => {
						handlePublicKeyChange(e);
					}}
					onPaste={(e) => {
						const pastedText = e.clipboardData.getData("Text");
						setPublicKey(pastedText);
						e.preventDefault();
					}}
					onCut={(e: any) => {
						setPublicKey(e.target.value);
					}}
					className="text-gray-700 font-medium shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md transition-all duration-150 ease-in"
					placeholder=""
					aria-invalid="true"
					aria-describedby="publickey-error"
				/>
			</div>
		</div>
	);
}