import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Injectable } from "@nestjs/common";

export interface SearchAndDiscoverConfig {
    version: "1.0.0";
}

export interface SearchAndDiscoverConfigWithName {
    name: string;
    file: SearchAndDiscoverConfig;
}

@Injectable()
export class ConfigService {
    private configDirectory = "./.search-and-discovery/config";

    public ensureConfigDirectory(): void {
        mkdirSync(this.configDirectory, { recursive: true });
        this.ensureExists("Example");
    }

    public ensureExists(fileName: string) {
        const fullPath = this.getFullPath(fileName);
        if (existsSync(fullPath)) {
            return;
        }

        return writeFileSync(fullPath, JSON.stringify(this.createExampleConfig(), null, 2));
    }

    public getAllConfigFiles(): SearchAndDiscoverConfigWithName[] {
        const allFiles = readdirSync(this.configDirectory);
        const exampleConfig = this.createExampleConfig();
    
        const currentVersion = allFiles.filter((file) => file.endsWith(`${exampleConfig.version}.json`));
        return currentVersion.map((file) => ({ file: JSON.parse(readFileSync(join(this.configDirectory, file), "utf-8")), name: file }) );
    }

    public updateConfig(fileName: string, config: SearchAndDiscoverConfig) {
        this.ensureExists(fileName);
        return writeFileSync(this.getFullPath(fileName), JSON.stringify(config, null, 2));
    }

    private createExampleConfig(): SearchAndDiscoverConfig {
        return {
            version: "1.0.0"
        }
    }

    private getFullPath = (fileName: string) => join(this.configDirectory, `${fileName}-${this.createExampleConfig().version}.json`);
}