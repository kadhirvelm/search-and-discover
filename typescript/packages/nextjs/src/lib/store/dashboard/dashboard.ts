import { createSlice } from "@reduxjs/toolkit";
import type { SearchAndDiscoverConfigWithName } from "api";

export interface DashboardState {
	viewingDashboard: SearchAndDiscoverConfigWithName | undefined;
}

const initialState: DashboardState = {
	viewingDashboard: undefined,
};

const dashboardSlice = createSlice({
	name: "dashboard",
	initialState,
	reducers: {
		setViewingDashboard(state, action) {
			state.viewingDashboard = action.payload;
		},
	},
});

export const { setViewingDashboard } = dashboardSlice.actions;
export const DashboardReducer = dashboardSlice.reducer;
