import type { SearchAndDiscoverConfigWithName, SearchAndDiscoverConfigs } from "api";

// Keep this in sync with app.controller.ts in nestjs
class ConfigService {
	public async getConfigs(): Promise<SearchAndDiscoverConfigs> {
		const rawResponse = await fetch("http://localhost:3001/app/get-configs");
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

		return rawResponse;
	}
}

export const configService = new ConfigService();
