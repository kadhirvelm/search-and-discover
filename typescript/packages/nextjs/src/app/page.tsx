import { Button } from "antd";
import styles from "./page.module.css";

export default function Home() {
	return (
		<div className={styles.page}>
			<Button>Hello world!</Button>
		</div>
	);
}
