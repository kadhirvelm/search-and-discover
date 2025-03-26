import { useSyncUrl } from "@/lib/hooks/useSyncUrl";
import { useAppSelector } from "@/lib/store/Provider";
import { Flex } from "antd";
import styles from "./Entry.module.scss";
import { SelectDashboard } from "./SelectDashboard";
import { ViewDashboard } from "./ViewDashboard";

export const Entry = () => {
	useSyncUrl();

	const isViewingDashboard = useAppSelector(
		(s) => s.dashboard.viewingDashboard !== undefined,
	);

	const renderCurrentView = () => {
		if (isViewingDashboard) {
			return <ViewDashboard />;
		}

		return (
			<Flex flex={1} justify="center" align="center">
				<Flex className={styles.configsContainer}>
					<SelectDashboard />
				</Flex>
			</Flex>
		);
	};

	return (
		<Flex className={styles.entry} vertical flex={1}>
			{renderCurrentView()}
		</Flex>
	);
};
