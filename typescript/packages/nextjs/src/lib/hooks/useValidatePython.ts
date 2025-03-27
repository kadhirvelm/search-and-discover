import type { InvalidPythonCode, ValidPythonCode } from "api";
import { debounce } from "lodash-es";
import { useEffect, useState } from "react";
import { configService } from "../services/configService";

const checkPythonCode = async (
	code: string,
	setIsValid: (
		code: string,
		valid: ValidPythonCode | InvalidPythonCode,
	) => void,
) => {
	const result = await configService.checkValidPythonCode(code);
	setIsValid(code, result);
};

const debouncedCheckPython = debounce(checkPythonCode, 100);

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

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		debouncedCheckPython(localCopy, maybeSetIsValid);
	}, [localCopy]);

	return {
		localCopy,
		setLocalCopy,
		isValid,
		onReset,
		canDiscard: localCopy !== startingCode,
	};
}
