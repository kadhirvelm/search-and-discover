import { useGetConfigs } from "@/lib/hooks/useGetConfigs";
import { Button, Flex } from "antd";
import type { SearchAndDiscoverConfigWithName } from "api";
import clsx from "clsx";
import styles from "./SelectDashboard.module.scss";

export const SelectDashboard = ({
	availableConfigs,
	selectedConfig,
	onSelect,
}: {
	availableConfigs: SearchAndDiscoverConfigWithName[] | undefined;
	selectedConfig: SearchAndDiscoverConfigWithName | undefined;
	onSelect: (viewConfig: SearchAndDiscoverConfigWithName) => void;
}) => {
	if (availableConfigs == null) {
		return;
	}

	if (availableConfigs.length === 0) {
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

	return (
		<Flex vertical flex={1}>
			<Flex className={styles.title}>
				{availableConfigs.length} dashboard
				{availableConfigs.length === 1 ? "" : "s"} available
			</Flex>
			<Flex className={styles.dashboardContainer} gap={10} vertical>
				{availableConfigs.map((config) => (
					<Flex
						className={clsx(styles.singleDashboard, {
							[styles.active]: config.name === selectedConfig?.name,
						})}
						onClick={() => onSelect(config)}
						key={config.name}
					>
						{config.name}
					</Flex>
				))}
			</Flex>
			<Flex className={styles.newDashboard} align="center" justify="center">
				<Button>New dashboard</Button>
			</Flex>
		</Flex>
	);
};
