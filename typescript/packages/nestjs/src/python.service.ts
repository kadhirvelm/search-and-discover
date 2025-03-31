import { execSync } from "node:child_process";
import { Injectable } from "@nestjs/common";
import type { InvalidPythonCode, ValidPythonCode } from "api";

const checkPythonCode = (code: string) => `
import ast

try:
    ast.parse('''${code.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/"/g, '\\"')}''')
    print('PASS')
except SyntaxError as e:
    print('FAIL', e)
`;

@Injectable()
export class PythonService {
	public isValidPythonCode(code: string): ValidPythonCode | InvalidPythonCode {
		try {
			const transformedCode = this.standardTransform(code);

			// Use Python's ast module to validate the code
			const response = execSync(
				`python -c "${checkPythonCode(transformedCode)}"`,
				{ encoding: "utf-8" },
			);

			if (response.includes("PASS")) {
				return { isValid: true, error: undefined };
			}

			return { isValid: false, error: response.replace("FAIL", "").trim() };
		} catch (e) {
			return { isValid: false, error: JSON.stringify(e) };
		}
	}

	public transformPythonCode(code: string): string {
		return this.standardTransform(code);
	}

	private standardTransform(code: string) {
		const withTabs = code.replaceAll(/\n/g, "\n    ");

		return `
import json

def main():
    ${withTabs}
result = main()
print("[START_RESULT]")
print(json.dumps(result))
print("[END_RESULT]")`;
	}
}
