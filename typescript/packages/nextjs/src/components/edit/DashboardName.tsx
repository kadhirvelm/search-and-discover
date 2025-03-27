import { configService } from "@/lib/services/configService";
import { useAppDispatch, useAppSelector } from "@/lib/store/Provider";
import { setViewingDashboard } from "@/lib/store/dashboard/dashboard";
import { Flex, Input } from "antd";
import { useEffect, useState } from "react";
import styles from "./DashboardName.module.scss";

export const DashboardName = () => {
	const dispatch = useAppDispatch();
	const { viewingDashboard, displayState } = useAppSelector((s) => s.dashboard);

	const [dashboardName, setDashboardName] = useState("");

	useEffect(() => {
		setDashboardName(viewingDashboard?.name ?? "");
	}, [viewingDashboard]);

	if (viewingDashboard === undefined) {
		return;
	}

	if (displayState === "view") {
		return (
			<Flex className={styles.dashboardName}>{viewingDashboard.name}</Flex>
		);
	}

	const updateDashboardName = async () => {
		const oldConfig = { ...viewingDashboard };
		const newConfig = { ...viewingDashboard, name: dashboardName };

		await configService.renameConfig(oldConfig, newConfig);
		dispatch(setViewingDashboard(newConfig));
	};

	return (
		<Input
			className={styles.input}
			value={dashboardName}
			onChange={(e) => setDashboardName(e.target.value)}
			onBlur={updateDashboardName}
		/>
	);
};
