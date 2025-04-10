import { Body, Controller, Get, Post } from "@nestjs/common";
import type { SearchAndDiscoverConfigWithName } from "api";
// biome-ignore lint/style/useImportType: <explanation>
import { AppService } from "./app.service";

@Controller("app")
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get("get-configs")
	getConfigs() {
		return this.appService.getAllConfigFiles();
	}

	@Post("update-config")
	updateConfig(@Body() config: SearchAndDiscoverConfigWithName) {
		return this.appService.updateConfig(config.name, config.file);
	}

	@Post("new-config")
	newConfig() {
		return this.appService.createNewConfig();
	}

	@Post("rename-config")
	renameConfig(@Body() config: { old: SearchAndDiscoverConfigWithName; new: SearchAndDiscoverConfigWithName }) {
		return this.appService.renameConfig(config.old, config.new);
	}

	@Post("check-python")
	checkPython(@Body() code: { code: string }) {
		return this.appService.checkValidPythonCode(code.code);
	}

	@Post("transform-code")
	transformCode(@Body() code: { code: string }) {
		return this.appService.transformPythonCode(code.code);
	}
}
