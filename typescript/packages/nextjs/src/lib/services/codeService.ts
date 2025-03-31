import type { InvalidPythonCode, TransformedCode, ValidPythonCode } from "api";

class CodeService {
	public async checkValidPythonCode(
		code: string,
	): Promise<ValidPythonCode | InvalidPythonCode> {
		const rawResponse = await fetch("http://localhost:3001/app/check-python", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ code }),
		});
		const isValid = await rawResponse.json();

		return isValid;
	}

    public async transformPythonCode(code: string): Promise<TransformedCode> {
        const rawResponse = await fetch("http://localhost:3001/app/transform-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ code }),
        });
        const transformedCode = await rawResponse.json();

        return transformedCode;
    }
}

export const codeService = new CodeService();
