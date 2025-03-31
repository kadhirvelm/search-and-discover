import { BadRequestException, Injectable } from "@nestjs/common";
import type {
	InvalidPythonCode,
	SearchAndDiscoverConfig,
	SearchAndDiscoverConfigWithName,
	SearchAndDiscoverConfigs,
	TransformedCode,
	ValidPythonCode,
} from "api";
// biome-ignore lint/style/useImportType: <explanation>
import { ConfigService } from "./config.service";
// biome-ignore lint/style/useImportType: <explanation>
import { PythonService } from "./python.service";

@Injectable()
export class AppService {
	public constructor(
		private configService: ConfigService,
		private pythonService: PythonService,
	) {
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

	public renameConfig(
		old: SearchAndDiscoverConfigWithName,
		newConfig: SearchAndDiscoverConfigWithName,
	) {
		this.configService.deleteConfig(old.name);
		this.updateConfig(newConfig.name, newConfig.file);

		return { status: "ok" };
	}

	public checkValidPythonCode(
		code: string,
	): ValidPythonCode | InvalidPythonCode {
		return this.pythonService.isValidPythonCode(code);
	}

	public transformPythonCode(code: string): TransformedCode {
		return { transformedCode: this.pythonService.transformPythonCode(code) };
	}
}
