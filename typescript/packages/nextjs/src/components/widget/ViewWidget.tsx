import { browserAgentService } from "@/lib/services/browserAgentService";
import { Button, Flex, Spin } from "antd";
import type { WidgetBlock } from "api";
import { useRef, useState } from "react";
import styles from "./ViewWidget.module.scss";
import { ResizedStream } from "./stream/ResizedStream";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function useRunPython(code: string) {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionLogs, setSessionLogs] = useState<string>("");

	const [isRunning, setIsRunning] = useState(false);
	const runningRef = useRef(false);

	const onStartRun = async () => {
		setIsRunning(true);
		runningRef.current = true;

		const { session_id: sessionId } =
			await browserAgentService.createNewSession();
		setSessionId(sessionId);

		pollForLogs(sessionId);

		await browserAgentService.startClient(sessionId);
		await browserAgentService.runCode(sessionId, code);

		setIsRunning(false);
		runningRef.current = false;
	};

	const pollForLogs = async (sessionId: string) => {
		const { logs } = await browserAgentService.getSessionLogs(sessionId);
		setSessionLogs(logs);
		await delay(100);

		if (!runningRef.current) {
			return;
		}

		pollForLogs(sessionId);
	};

	const canViewStream = sessionLogs.includes("[Entering screenshot mode]");

	return {
		sessionLogs,
		isRunning,
		onStartRun,
		streamUrl: canViewStream
			? browserAgentService.streamSession(sessionId)
			: undefined,
	};
}

export const ViewWidget = ({ widget }: { widget: WidgetBlock }) => {
	const { sessionLogs, isRunning, onStartRun, streamUrl } = useRunPython(
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

		return <ResizedStream streamUrl={streamUrl} />;
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
