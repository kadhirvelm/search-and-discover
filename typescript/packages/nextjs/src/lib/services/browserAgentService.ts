export interface CreateSession {
    session_id: string;
}

export interface CommandResponse {
    result: unknown;
}

export interface StopClientResponse {
    success: boolean;
}

export interface SessionLogs {
    logs: string;
}

class BrowserAgentService {
    public async createNewSession() {
        const rawResponse = await fetch("http://localhost:500/create-session", {
			headers: {
				"Content-Type": "application/json",
			},
		});
		const sessionId = await rawResponse.json();
        return sessionId as CreateSession;
    }

    public async startClient(sessionId: string, startingPage?: string) {
        const rawResponse = await fetch("http://localhost:500/start-client", {
            method: "POST",
            headers: {
				"Content-Type": "application/json",
			},
            body: JSON.stringify({ session_id: sessionId, starting_page: startingPage }),
        });
        const response = await rawResponse.json();
        return response as CommandResponse;
    }

    public async runCode(sessionId: string, code: string) {
        const rawResponse = await fetch("http://localhost:500/run-code", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionId, code }),
        });
        const response = await rawResponse.json();
        return response as CommandResponse;
    }

    public async getSessionLogs(sessionId: string) {
        const rawResponse = await fetch("http://localhost:500/get-session-logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionId }),
        });
        const response = await rawResponse.json();
        return response as SessionLogs;
    }

    public async streamSession(sessionId: string) {
        return `http://localhost:500/session/${sessionId}/stream.mjpeg`;
    }

    public async stopClient(sessionId: string) {
        const rawResponse = await fetch("http://localhost:500/end-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionId }),
        });
        const response = await rawResponse.json();
        return response as StopClientResponse;
    }
}

export const browserAgentService = new BrowserAgentService();