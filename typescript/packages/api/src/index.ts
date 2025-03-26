export interface SearchAndDiscoverConfigs {
	configs: SearchAndDiscoverConfigWithName[];
}

export interface SearchAndDiscoverConfigWithName {
	name: string;
	file: SearchAndDiscoverConfig;
}

export interface SearchAndDiscoverConfig {
	entryBlock: Block;
	version: "1.0.0";
}

export type Block = LayoutRowBlock | LayoutColumnBlock | WidgetBlock;

export interface LayoutRowBlock {
	rows: Block[];
	type: "layout-row";
}

export interface LayoutColumnBlock {
	columns: Block[];
	type: "layout-column";
}

export interface WidgetBlock {
	description: string;
	type: "widget";
}
