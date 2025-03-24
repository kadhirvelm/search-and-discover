import { Controller, Get, Post } from "@nestjs/common";
// biome-ignore lint/style/useImportType: <explanation>
import { AppService } from "./app.service";
import type { SearchAndDiscoverConfigWithName } from "./config.service";

@Controller("app")
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get("get-configs")
	getConfigs() {
		return this.appService.getAllConfigFiles();
	}

	@Post("update-config")
	updateConfig(config: SearchAndDiscoverConfigWithName) {
		return this.appService.updateConfig(config.name, config.file);
	}
}
