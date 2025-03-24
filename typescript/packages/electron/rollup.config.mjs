import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";

export default {
	input: "src/main.ts",
	output: {
		dir: "dist",
		format: "cjs",
	},
	plugins: [
		typescript(),
		copy({
			targets: [
				{ src: "src/index.html", dest: "dist" },
				{ src: "src/preload.js", dest: "dist" },
			],
		}),
	],
};
