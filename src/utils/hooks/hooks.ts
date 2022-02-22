import { useState } from "react";

export const useInputState = (initiaVal: string): any => {
	const [input, setInput] = useState(initiaVal);
	const handleChange = (e: { target: { value: any } }) => {
		setInput(e.target.value);
	};
	const reset = () => {
		setInput("");
	};
	return [input, handleChange, setInput, reset] as const;
};
