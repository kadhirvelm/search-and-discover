import { useRunPython } from "@/lib/hooks/useRunPython";
import { convertBox } from "@/lib/utils/convertBox";
import { Button, Flex, Spin } from "antd";
import type { WidgetBlock } from "api";
import styles from "./ViewWidget.module.scss";
import { ResizedStream } from "./stream/ResizedStream";

export const ViewWidget = ({ widget }: { widget: WidgetBlock }) => {
	const { sessionLogs, result, isRunning, onStartRun, streamUrl } = useRunPython(
		widget.dataScript,
	);

	const renderFrame = () => {
		if (streamUrl === undefined) {
			return (
				<Flex
					className={styles.waiting}
					flex={1}
					justify="center"
					align="center"
				>
					Waiting...
				</Flex>
			);
		}

		const maybeBox = result?.type === "crop" ? convertBox(result.box) : undefined;
		console.log({ maybeBox });
		return <ResizedStream boundingBox={maybeBox} streamUrl={streamUrl} />;
	};

	return (
		<div className={styles.widget} style={{ flex: widget.space ?? 1 }}>
			<Flex flex={3}>{renderFrame()}</Flex>
			<Flex
				className={styles.logs}
				flex={1}
				vertical
				gap={10}
				style={{ padding: "10px" }}
			>
				<Flex justify="space-between" align="center">
					<Button disabled={isRunning} onClick={onStartRun} type="primary">
						Run widget
					</Button>
					{isRunning && <Spin />}
				</Flex>
				<Flex vertical gap={10}>
					{sessionLogs
						.split("\n")
						.filter((line) => line !== "")
						.map((line, index) => {
							const splitByIndicator = line.split("]");
							const typeOfLog = `${splitByIndicator[0]}]`;
							const log = splitByIndicator.slice(1).join("]");

							return (
								<Flex key={index} gap={10}>
									<Flex className={styles.typeOfLog}>{typeOfLog}</Flex>
									<Flex>{log}</Flex>
								</Flex>
							);
						})}
				</Flex>
			</Flex>
		</div>
	);
};
