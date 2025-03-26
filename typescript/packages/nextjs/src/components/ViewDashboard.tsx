import { configService } from "@/lib/services/configService";
import { useAppDispatch, useAppSelector } from "@/lib/store/Provider";
import {
	setDisplayState,
	setViewingDashboard,
} from "@/lib/store/dashboard/dashboard";
import { EditOutlined, EyeOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import type { Block as BlockType } from "api";
import styles from "./ViewDashboard.module.scss";
import { DashboardName } from "./edit/DashboardName";
import { EditBlock } from "./layout/EditBlock";
import { ViewBlock } from "./layout/ViewBlock";

export const ViewDashboard = () => {
	const dispatch = useAppDispatch();

	const { viewingDashboard } = useAppSelector((s) => s.dashboard);
	const { displayState } = useAppSelector((s) => s.dashboard);

	if (viewingDashboard === undefined) {
		return;
	}

	const goBackToSelect = () => {
		dispatch(setViewingDashboard(undefined));
	};

	const onSwitchDisplayState = (newState: "view" | "edit") => () => {
		dispatch(setDisplayState(newState));
	};

	const updateDashboard = async (updatedBlock: BlockType) => {
		const updatedDashboard = {
			...viewingDashboard,
			file: {
				...viewingDashboard.file,
				entryBlock: updatedBlock,
			},
		};

		dispatch(setViewingDashboard(updatedDashboard));
		await configService.updateConfig(updatedDashboard);
	};

	return (
		<Flex className={styles.mainContainer} vertical flex={1} gap={10}>
			<Flex align="center" justify="space-between">
				<Flex align="center" gap={20}>
					<Button onClick={goBackToSelect}>
						<LeftOutlined />
						Back
					</Button>
					<DashboardName />
				</Flex>
				<Flex>
					<Button
						className={styles.view}
						onClick={onSwitchDisplayState("view")}
						type={displayState === "view" ? "primary" : undefined}
					>
						<EyeOutlined />
						View
					</Button>
					<Button
						className={styles.edit}
						onClick={onSwitchDisplayState("edit")}
						type={displayState === "edit" ? "primary" : undefined}
					>
						<EditOutlined /> Edit
					</Button>
				</Flex>
			</Flex>
			{displayState === "edit" ? (
				<EditBlock
					block={viewingDashboard.file.entryBlock}
					isRoot
					onUpdate={updateDashboard}
				/>
			) : (
				<ViewBlock block={viewingDashboard.file.entryBlock} />
			)}
		</Flex>
	);
};
