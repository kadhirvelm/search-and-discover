import type { SearchAndDiscoverConfigWithName } from "api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { configService } from "../services/configService";
import { useAppDispatch, useAppSelector } from "../store/Provider";
import { setViewingDashboard } from "../store/dashboard/dashboard";

const DASHBOARD_PARAM = "dashboard";

export function useSyncUrl() {
	const router = useRouter();
	const dispatch = useAppDispatch();

	const [hasMounted, setHasMounted] = useState(false);

	const { viewingDashboard } = useAppSelector((s) => s.dashboard);

	const syncUrl = (dashboard: SearchAndDiscoverConfigWithName | undefined) => {
		if (!hasMounted) {
			return;
		}

		if (dashboard == null) {
			router.push("/");
			return;
		}

		router.push(`/?${DASHBOARD_PARAM}=${dashboard.name}`);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		syncUrl(viewingDashboard);
	}, [viewingDashboard]);

	const fetchDashboard = async (dashboardName: string) => {
		const allDashboard = await configService.getConfigs();
		const dashboard = allDashboard.configs.find(
			(d) => d.name === dashboardName,
		);
		if (dashboard == null) {
			return;
		}

		dispatch(setViewingDashboard(dashboard));
	};

	const syncUrlToRedux = async () => {
		const currentDashboard = new URL(window.location.href);
		const maybeDashboard = currentDashboard.searchParams.get(DASHBOARD_PARAM);
		if (maybeDashboard != null) {
			await fetchDashboard(maybeDashboard);
		}

		setHasMounted(true);
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		syncUrlToRedux();
	}, []);
}
