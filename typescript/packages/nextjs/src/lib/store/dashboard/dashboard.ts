import { createSlice } from "@reduxjs/toolkit";
import type { SearchAndDiscoverConfigWithName } from "api";

export interface DashboardState {
	viewingDashboard: SearchAndDiscoverConfigWithName | undefined;
	displayState: "view" | "edit";
}

const initialState: DashboardState = {
	viewingDashboard: undefined,
	displayState: "edit"
};

const dashboardSlice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {
		setViewingDashboard(state, action) {
			state.viewingDashboard = action.payload;
		},
		setDisplayState(state, action) {
			state.displayState = action.payload;
		}
	},
});

export const { setViewingDashboard, setDisplayState } = dashboardSlice.actions;
export const DashboardReducer = dashboardSlice.reducer;
