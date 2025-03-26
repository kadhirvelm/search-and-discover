import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { Provider as ReduxProvider } from "react-redux";
import { DashboardReducer } from "./dashboard/dashboard";
import { reduxLogger } from "./middleware/logger";

const store = configureStore({
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(reduxLogger),
	reducer: {
		dashboard: DashboardReducer,
	},
});

// Inferred state type: {todos: TodosState, counter: CounterState}
export type RootState = ReturnType<typeof store.getState>;
export const useAppSelector = useSelector.withTypes<RootState>();

type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const Provider = ({ children }: { children: React.ReactElement }) => {
	return <ReduxProvider store={store}>{children}</ReduxProvider>;
};
