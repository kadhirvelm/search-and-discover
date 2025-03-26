import { useGetConfigs } from "@/lib/hooks/useGetConfigs";
import { configService } from "@/lib/services/configService";
import { useAppDispatch, useAppSelector } from "@/lib/store/Provider";
import { setViewingDashboard } from "@/lib/store/dashboard/dashboard";
import { Button, Flex } from "antd";
import type { SearchAndDiscoverConfigWithName } from "api";
import clsx from "clsx";
import styles from "./SelectDashboard.module.scss";

export const SelectDashboard = () => {
	const { configs } = useGetConfigs();

	const dispatch = useAppDispatch();
	const { viewingDashboard } = useAppSelector((s) => s.dashboard);

	if (configs == null) {
		return;
	}

	if (configs.length === 0) {
		return (
			<Flex vertical flex={1}>
				<Flex
					className={styles.mutedText}
					flex={1}
					justify="center"
					align="center"
				>
					<Flex>No configs found</Flex>
				</Flex>
				<Flex className={styles.newDashboard} align="center" justify="center">
					<Button>New dashboard</Button>
				</Flex>
			</Flex>
		);
	}

	const onSelect = (config: SearchAndDiscoverConfigWithName) => () => {
		dispatch(setViewingDashboard(config));
	};

	const createNewDashboard = async () => {
		const newConfig = await configService.createNewConfig();
		dispatch(setViewingDashboard(newConfig));
	}

	return (
		<Flex vertical flex={1}>
			<Flex className={styles.title} justify="center">
				{configs.length} dashboard
				{configs.length === 1 ? "" : "s"} available
			</Flex>
			<Flex className={styles.dashboardContainer} gap={10} vertical>
				{configs.map((config) => (
					<Flex
						className={clsx(styles.singleDashboard, {
							[styles.active]: config.name === viewingDashboard?.name,
						})}
						onClick={onSelect(config)}
						key={config.name}
					>
						{config.name}
					</Flex>
				))}
			</Flex>
			<Flex className={styles.newDashboard} align="center" justify="center">
				<Button onClick={createNewDashboard}>New dashboard</Button>
			</Flex>
		</Flex>
	);
};
