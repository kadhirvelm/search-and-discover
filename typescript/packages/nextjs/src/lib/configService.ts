import type { SearchAndDiscoverConfigs } from "api";

// Keep this in sync with app.controller.ts in nestjs
class ConfigService {
	public async getConfigs(): Promise<SearchAndDiscoverConfigs> {
		const rawResponse = await fetch("http://localhost:3001/app/get-configs");
		const allFiles = await rawResponse.json();

		console.log(allFiles);

		return allFiles;
	}
}

export const configService = new ConfigService();
