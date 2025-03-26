import { BadRequestException, Injectable } from "@nestjs/common";
import type { SearchAndDiscoverConfig, SearchAndDiscoverConfigWithName, SearchAndDiscoverConfigs } from "api";
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from "./config.service";

@Injectable()
export class AppService {
	public constructor(private configService: ConfigService) {
		this.configService.ensureConfigDirectory();
	}

	public getAllConfigFiles(): SearchAndDiscoverConfigs {
		const allFiles = this.configService.getAllConfigFiles();
		return {
			configs: allFiles,
		};
	}

	public updateConfig(configName: string, config: SearchAndDiscoverConfig) {
		if (config.version !== "1.0.0") {
			throw new BadRequestException("Invalid version");
		}

		this.configService.updateConfig(configName, config);
		return { status: "ok" };
	}

	public createNewConfig(): SearchAndDiscoverConfigWithName {
		return this.configService.createNewDashboard();
	}

	public renameConfig(old: SearchAndDiscoverConfigWithName, newConfig: SearchAndDiscoverConfigWithName) {
		this.configService.deleteConfig(old.name);
		this.updateConfig(newConfig.name, newConfig.file);

		return { status: "ok" };
	}
}
