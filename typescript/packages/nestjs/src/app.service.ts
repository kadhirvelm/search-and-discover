import { BadRequestException, Injectable } from "@nestjs/common";
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService, SearchAndDiscoverConfig, SearchAndDiscoverConfigWithName } from "./config.service";

export interface SearchAndDiscoverConfigs {
  configs: SearchAndDiscoverConfigWithName[];
}

@Injectable()
export class AppService {
	public constructor(private configService: ConfigService) {
		this.configService.ensureConfigDirectory();
	}

	public getAllConfigFiles(): SearchAndDiscoverConfigs {
    const allFiles = this.configService.getAllConfigFiles();
    return {
      configs: allFiles
    };
  }
  
  public updateConfig(configName: string, config: SearchAndDiscoverConfig) {
    if (config.version !== "1.0.0") {
      throw new BadRequestException("Invalid version");
    }

    this.configService.updateConfig(configName, config);
    return { status: "ok" };
  }
}
