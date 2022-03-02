import { useState } from "react";

export const useInputState = (initiaVal: any): any => {
	const [input, setInput] = useState(initiaVal);
	const handleChange = (e: { target: { value: any } }) => {
	
		setInput(e.target.value);
	};
	const reset = () => {
		if (typeof initiaVal === "string") {
			setInput("");
		} else if (typeof initiaVal === "number") {
			setInput(0);
		} else {
			setInput(null);
		}
	};
	return [input, handleChange, setInput, reset] as const;
};
