import { useAppDispatch, useAppSelector } from "@/lib/store/Provider";
import {
	setDisplayState,
	setViewingDashboard,
} from "@/lib/store/dashboard/dashboard";
import { EditOutlined, EyeOutlined, LeftOutlined } from "@ant-design/icons";
import { Button, Flex } from "antd";
import styles from "./ViewDashboard.module.scss";

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

	return (
		<Flex className={styles.mainContainer} vertical>
			<Flex align="center" justify="space-between">
				<Flex>
					<Button onClick={goBackToSelect}>
						<LeftOutlined />
						Back
					</Button>
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
		</Flex>
	);
};
