import { configService } from "@/lib/configService";
import { Button, Flex } from "antd";
import type { SearchAndDiscoverConfigs } from "api";
import { useState } from "react";

export const Entry = () => {
	const [allConfigs, setAllConfigs] = useState<SearchAndDiscoverConfigs | null>(
		null,
	);

	const onGetConfigs = async () => {
		const configs = await configService.getConfigs();
		setAllConfigs(configs);
	};

	return (
		<Flex vertical>
			<Button onClick={onGetConfigs}>Get all configs</Button>
            <Flex vertical gap="10px">
                {allConfigs?.configs.map((config) => (
                    <div key={config.name}>{JSON.stringify(config, null, 2)}</div>
                ))}
            </Flex>
		</Flex>
	);
};
