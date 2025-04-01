import { useEffect, useRef, useState } from "react";
import { browserAgentService } from "../services/browserAgentService";
import { codeService } from "../services/codeService";
import { delay } from "../utils/delay";

export interface CropView {
	type: "crop",
	box: string;
}

export type PythonResult = CropView | undefined;

function parseForResult(logs: string): PythonResult {
	const withoutCommands = logs.replaceAll("[USER_COMMAND]", "");
	const maybeResult = withoutCommands.match(/\[START_RESULT\]([\s\S]*?)\[END_RESULT\]/g);
	if (maybeResult == null || maybeResult.length !== 3) {
		return;
	}

	const result = maybeResult[1].replaceAll("[START_RESULT]", "").replaceAll("[END_RESULT]", "").replaceAll("\n", "");
	
	try {
		return JSON.parse(result);
	} catch {
		return;
	}
}

export function useRunPython(code: string, startingUrl?: string) {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [sessionLogs, setSessionLogs] = useState<string>("");

	const [isRunning, setIsRunning] = useState(false);
	const runningRef = useRef(false);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		return () => {
			if (sessionId == null) {
				return;
			}

			browserAgentService.stopClient(sessionId);
		}
	}, []);

	const onStartRun = async () => {
		setIsRunning(true);
		runningRef.current = true;

		const { session_id: sessionId } =
			await browserAgentService.createNewSession();
		setSessionId(sessionId);

		pollForLogs(sessionId);
		
		const finalUrl = startingUrl === "" ? "https://www.google.com" : startingUrl;
		await browserAgentService.startClient(sessionId, finalUrl ?? "https://www.google.com");

		const { transformedCode } = await codeService.transformPythonCode(code);
		await browserAgentService.runCode(sessionId, transformedCode);

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

	const onRunCode = async (code: string) => {
		if (sessionId == null) {
			return;
		}

		await browserAgentService.runCode(sessionId, code);
		await pollForLogs(sessionId);
	}

	const canViewStream = sessionLogs.includes("[Entering screenshot mode]");

	return {
		sessionLogs,
		result: parseForResult(sessionLogs),
		isRunning,
		onStartRun,
		onRunCode,
		streamUrl: canViewStream
			? browserAgentService.streamSession(sessionId)
			: undefined,
	};
}
