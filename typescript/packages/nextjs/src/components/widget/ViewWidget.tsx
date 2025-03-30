import { browserAgentService } from "@/lib/services/browserAgentService";
import { Button, Flex, Spin } from "antd";
import type { WidgetBlock } from "api";
import { useRef, useState } from "react";
import styles from "./ViewWidget.module.scss";

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

	return {
		sessionLogs,
		isRunning,
		onStartRun,
		streamUrl: browserAgentService.streamSession(sessionId),
	};
}

export const ViewWidget = ({ widget }: { widget: WidgetBlock }) => {
	const { sessionLogs, isRunning, onStartRun, streamUrl } = useRunPython(
		widget.dataScript,
	);

	return (
		<div className={styles.widget} style={{ flex: widget.space ?? 1 }}>
			<Flex flex={3}>
				{streamUrl === undefined || isRunning ? (
					<Spin />
				) : (
					<iframe
						title="datascript"
						src={streamUrl}
						style={{
							display: "flex",
							flex: 1,
							height: "100%",
							width: "100%",
						}}
					/>
				)}
			</Flex>
			<Flex flex={1} vertical gap={10} style={{ padding: "10px" }}>
				<Flex>
					{isRunning ? <Spin /> : <Button onClick={onStartRun}>Run</Button>}
				</Flex>
				<Flex vertical>
					{sessionLogs.split("\n").map((line, index) => (
						<Flex key={index}>{line}</Flex>
					))}
				</Flex>
			</Flex>
		</div>
	);
};
