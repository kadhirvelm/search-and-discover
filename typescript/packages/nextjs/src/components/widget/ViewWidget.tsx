import { useRunPython } from "@/lib/hooks/useRunPython";
import { convertBox } from "@/lib/utils/convertBox";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Flex, Spin } from "antd";
import type { WidgetBlock } from "api";
import clsx from "clsx";
import { useState } from "react";
import { Resizer } from "../general/Resizer";
import styles from "./ViewWidget.module.scss";
import { ResizedStream } from "./stream/ResizedStream";

export const ViewWidget = ({ widget }: { widget: WidgetBlock }) => {
	const { sessionLogs, result, isRunning, onStartRun, onRunCode, streamUrl } =
		useRunPython(widget.dataScript, widget.startingUrl);

	const [isViewingLogs, setIsViewingLogs] = useState(false);

	const renderFrame = () => {
		if (streamUrl === undefined || isRunning) {
			return (
				<Flex
					className={clsx(styles.waiting, { [styles.loading]: isRunning })}
					flex={1}
					justify="center"
					align="center"
				>
					{!isRunning ? <Button
						disabled={isRunning}
						onClick={onStartRun}
						type={isRunning ? "default" : "primary"}
					>
						Run widget
					</Button> : <div />}
				</Flex>
			);
		}

		const maybeBox =
			result?.type === "crop" ? convertBox(result.box) : undefined;
		return <ResizedStream boundingBox={maybeBox} streamUrl={streamUrl} onRunCode={onRunCode} />;
	};

	const maybeRenderSessionLogs = () => {
		if (sessionLogs.length === 0) {
			return <Flex flex={1} justify="center" align="center" className={styles.noLogs}>No logs</Flex>;
		}

		return sessionLogs
			.split("\n")
			.filter((line) => line !== "")
			.map((line, index) => {
				if (!line.startsWith("[")) {
					const logByNewLine = line.split("\\n");
					return (
						<Flex
							className={styles.logLine}
							align="baseline"
							justify="space-between"
							key={index}
							gap={5}
						>
							<Flex vertical gap={3}>
								{logByNewLine.map((logLine, logIndex) => (
									<Flex className={styles.singleLogLine} key={logIndex}>
										{logLine}
									</Flex>
								))}
							</Flex>
						</Flex>
					)
				}

				const splitByIndicator = line.split("]");
				const typeOfLog = `${splitByIndicator[0]}]`;
				const log = splitByIndicator.slice(1).join("]");

				const logByNewLine = log.split("\\n");

				return (
					<Flex
						className={styles.logLine}
						align="baseline"
						justify="space-between"
						key={index}
						gap={5}
					>
						<Flex vertical gap={3}>
							{logByNewLine.map((logLine, logIndex) => (
								<Flex className={styles.singleLogLine} key={logIndex}>
									{logLine}
								</Flex>
							))}
						</Flex>
						<Flex className={styles.typeOfLog}>{typeOfLog}</Flex>
					</Flex>
				);
			});
	};

	const maybeRenderLogs = () => {
		if (!isViewingLogs) {
			return (
				<Flex className={styles.logsToggle} onClick={() => setIsViewingLogs(true)}>
					<LeftOutlined />
				</Flex>
			);
		}

		return (
			<Resizer>
				{({ height }) => (
					<Flex flex={1}>
						<Flex className={styles.logsToggle} onClick={() => setIsViewingLogs(false)} style={{ padding: "5px" }}>
							<RightOutlined />
						</Flex>
						<Flex
							className={styles.logContainer}
							flex={1}
							vertical
							style={{ height }}
						>
							{maybeRenderSessionLogs()}
						</Flex>
					</Flex>
				)}
			</Resizer>
		);
	};

	return (
		<div className={styles.widget} style={{ flex: widget.space ?? 1 }}>
			<Flex flex={1}>{renderFrame()}</Flex>
			<Flex
				className={clsx(styles.logs, { [styles.noShowLogs]: !isViewingLogs, [styles.showLogs]: isViewingLogs })}
				flex={1}
				style={isViewingLogs ? { width: "90%" } : { width: "auto", opacity: 0.5 }}
			>
				{maybeRenderLogs()}
			</Flex>
		</div>
	);
};
