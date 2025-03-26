import { useGetConfigs } from "@/lib/hooks/useGetConfigs";
import { Button, Flex } from "antd";
import type { SearchAndDiscoverConfigWithName } from "api";
import { useState } from "react";
import styles from "./Entry.module.scss";
import { SelectDashboard } from "./SelectDashboard";

export const Entry = () => {
	const { configs } = useGetConfigs();

	const [selectedConfig, setSelectedConfig] = useState<
		SearchAndDiscoverConfigWithName | undefined
	>(undefined);

	return (
		<Flex
			className={styles.entry}
			vertical
			flex={1}
			justify="center"
			align="center"
		>
			<Flex className={styles.configsContainer}>
				<SelectDashboard
					availableConfigs={configs}
					selectedConfig={selectedConfig}
					onSelect={setSelectedConfig}
				/>
			</Flex>
		</Flex>
	);
};
