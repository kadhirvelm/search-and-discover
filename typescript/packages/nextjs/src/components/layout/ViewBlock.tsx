import type { Block } from "api";
import SyntaxHighlighter from "react-syntax-highlighter";
import styles from "./ViewBlock.module.scss";

export const ViewBlock = ({ block }: { block: Block }) => {
	if (block.type === "layout-row") {
		return (
			<div className={styles.layoutRows}>
				{block.rows.map((c, index) => (
					<ViewBlock block={c} key={`column-${index}`} />
				))}
			</div>
		);
	}

	if (block.type === "layout-column") {
		return (
			<div className={styles.layoutColumns}>
				{block.columns.map((c, index) => (
					<ViewBlock block={c} key={`column-${index}`} />
				))}
			</div>
		);
	}

	return <div className={styles.widget}><SyntaxHighlighter language="python">{block.dataScript}</SyntaxHighlighter></div>;
};
