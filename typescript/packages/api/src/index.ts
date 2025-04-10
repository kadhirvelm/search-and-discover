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
	space?: number;
	type: "layout-row";
}

export interface LayoutColumnBlock {
	columns: Block[];
	space?: number;
	type: "layout-column";
}

export interface WidgetBlock {
	description: string;
	dataScript: string;
	space?: number;
	startingUrl?: string;
	type: "widget";
}

export interface ValidPythonCode {
	isValid: true;
	error: undefined;
}

export interface InvalidPythonCode {
	isValid: false;
	error: string;
}

export interface TransformedCode {
	transformedCode: string;
}

export interface BoundingBox {
    top: number;
    left: number;
    width: number;
    height: number;
}
