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
        const rawResponse = await fetch("http://localhost:5000/create-session", {
            method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		});
		const sessionId = await rawResponse.json();
        return sessionId as CreateSession;
    }

    public async startClient(sessionId: string, startingPage?: string) {
        const rawResponse = await fetch("http://localhost:5000/start-client", {
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
        const rawResponse = await fetch("http://localhost:5000/run-code", {
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
        const rawResponse = await fetch("http://localhost:5000/get-session-logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ session_id: sessionId }),
        });
        const response = await rawResponse.json();
        return response as SessionLogs;
    }

    public streamSession(sessionId: string | null) {
        if (sessionId == null) {
            return;
        }

        return `http://localhost:5000/session/${sessionId}/stream.mjpeg`;
    }

    public async stopClient(sessionId: string) {
        const rawResponse = await fetch("http://localhost:5000/end-session", {
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