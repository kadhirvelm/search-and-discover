import type { InvalidPythonCode, ValidPythonCode } from "api";
import { useEffect, useState } from "react";
import { codeService } from "../services/codeService";

export function useValidatePython(startingCode: string) {
	const [localCopy, setLocalCopy] = useState(startingCode);
	const [isValid, setIsValid] = useState<
		ValidPythonCode | InvalidPythonCode | undefined
	>();

	const onReset = () => setLocalCopy(startingCode);

	const maybeSetIsValid = (
		code: string,
		valid: ValidPythonCode | InvalidPythonCode,
	) => {
		if (code !== localCopy) {
			return;
		}

		setIsValid(valid);
	};

	const checkPythonCode = async (
		code: string,
		setIsValid: (
			code: string,
			valid: ValidPythonCode | InvalidPythonCode,
		) => void,
	) => {
		const result = await codeService.checkValidPythonCode(code);
		setIsValid(code, result);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (localCopy === "") {
			return;
		}

		checkPythonCode(localCopy, maybeSetIsValid);
	}, [localCopy]);

	return {
		localCopy,
		setLocalCopy,
		isValid,
		onReset,
		canDiscard: localCopy !== startingCode,
	};
}
