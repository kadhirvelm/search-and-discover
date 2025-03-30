import type { Block } from "api";
import { ViewWidget } from "../widget/ViewWidget";
import styles from "./ViewBlock.module.scss";

export const ViewBlock = ({ block }: { block: Block }) => {
	if (block.type === "layout-row") {
		return (
			<div className={styles.layoutRows} style={{ flex: block.space ?? 1 }}>
				{block.rows.map((c, index) => (
					<ViewBlock block={c} key={`column-${index}`} />
				))}
			</div>
		);
	}

	if (block.type === "layout-column") {
		return (
			<div className={styles.layoutColumns} style={{ flex: block.space ?? 1 }}>
				{block.columns.map((c, index) => (
					<ViewBlock block={c} key={`column-${index}`} />
				))}
			</div>
		);
	}

	return <ViewWidget widget={block} />;
};
