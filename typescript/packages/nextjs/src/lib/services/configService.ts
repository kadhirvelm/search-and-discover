import type {
	InvalidPythonCode,
	SearchAndDiscoverConfigWithName,
	SearchAndDiscoverConfigs,
	ValidPythonCode,
} from "api";

// Keep this in sync with app.controller.ts in nestjs
class ConfigService {
	public async getConfigs(): Promise<SearchAndDiscoverConfigs> {
		const rawResponse = await fetch("http://localhost:3001/app/get-configs", {
			headers: {
				"Content-Type": "application/json",
			},
		});
		const allFiles = await rawResponse.json();

		return allFiles;
	}

	public async updateConfig(config: SearchAndDiscoverConfigWithName) {
		const rawResponse = await fetch("http://localhost:3001/app/update-config", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(config),
		});

		return rawResponse.json();
	}

	public async createNewConfig(): Promise<SearchAndDiscoverConfigWithName> {
		const rawResponse = await fetch("http://localhost:3001/app/new-config", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
		const newConfig = await rawResponse.json();

		return newConfig;
	}

	public async renameConfig(
		old: SearchAndDiscoverConfigWithName,
		newConfig: SearchAndDiscoverConfigWithName,
	) {
		const rawResponse = await fetch("http://localhost:3001/app/rename-config", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ old, new: newConfig }),
		});

		return rawResponse.json();
	}

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
}

export const configService = new ConfigService();
