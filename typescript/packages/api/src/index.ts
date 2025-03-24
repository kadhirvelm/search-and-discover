export interface SearchAndDiscoverConfigs {
	configs: SearchAndDiscoverConfigWithName[];
}

export interface SearchAndDiscoverConfigWithName {
	name: string;
	file: SearchAndDiscoverConfig;
}

export interface SearchAndDiscoverConfig {
	version: "1.0.0";
}
