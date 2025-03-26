import type {
	Action,
	Middleware,
	ThunkDispatch,
	UnknownAction,
} from "@reduxjs/toolkit";

export const reduxLogger: Middleware<
	Record<string, never>,
	unknown,
	ThunkDispatch<unknown, unknown, Action>
> = (store) => (next) => (action) => {
	const dispatchedOn = new Date();

	const previousState = store.getState();
	const result = next(action);
	const nextState = store.getState();

	console.groupCollapsed(
		`%c@redux - ${
			(action as UnknownAction).type
		} - ${dispatchedOn.toLocaleTimeString()}:${dispatchedOn.getMilliseconds()}`,
		"color: #c5c8ca",
	);
	console.log("%c Previous state", "color: #C0392B", previousState);
	console.log("%c Action", "color: #2980B9", action);
	console.log("%c Next state", "color: #27AE60", nextState);
	console.groupEnd();

	return result;
};
