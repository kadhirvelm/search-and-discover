import type { SearchAndDiscoverConfigs } from "api";
import { useEffect, useState } from "react";
import { configService } from "../services/configService";

export function useGetConfigs() {
	const [configs, setConfigs] = useState<SearchAndDiscoverConfigs | null>(null);

	useEffect(() => {
		async function fetchConfigs() {
			const response = await configService.getConfigs();
			setConfigs(response);
		}

		fetchConfigs();
	}, []);

	return {
		configs: configs?.configs,
	};
}
