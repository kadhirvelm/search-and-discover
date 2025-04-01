import { useValidatePython } from "@/lib/hooks/useValidatePython";
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	UndoOutlined,
} from "@ant-design/icons";
import { python } from "@codemirror/lang-python";
// import SyntaxHighlighter from "react-syntax-highlighter";
import CodeMirror from "@uiw/react-codemirror";
import { Button, Flex, Input, Spin, Tooltip } from "antd";
import type { WidgetBlock } from "api";
import { useState } from "react";
import { Resizer } from "../general/Resizer";
import styles from "./EditWidget.module.scss";

export const EditWidget = ({
	widget,
	onUpdate,
}: { widget: WidgetBlock; onUpdate: (newWidget: WidgetBlock) => void }) => {
	const { localCopy, setLocalCopy, isValid, canDiscard, onReset } =
		useValidatePython(widget.dataScript);

	const [localDescription, setLocalDescription] = useState(widget.description);
	const [localStartingUrl, setLocalStartingUrl] = useState(widget.startingUrl);

	const onSave = () => {
		onUpdate({ ...widget, dataScript: localCopy });
	};

	const checkForSave = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (!event.metaKey || event.key !== "s") {
			return;
		}

		onSave();
		event.preventDefault();
	};

	const renderCurrentStatus = () => {
		if (localCopy === "") {
			return;
		}

		if (isValid === undefined) {
			return <Spin />;
		}

		if (isValid.isValid) {
			return <CheckCircleOutlined className={styles.valid} />;
		}

		return (
			<Tooltip title={isValid.error}>
				<CloseCircleOutlined className={styles.invalid} />
			</Tooltip>
		);
	};

	return (
		<Flex flex={1} vertical gap={10}>
			<Flex align="center" gap={10}>
				<Flex>Description</Flex>
				<Input
					onBlur={(e) => onUpdate({ ...widget, description: localDescription })}
					onChange={(e) => setLocalDescription(e.currentTarget.value)}
					value={localDescription}
				/>
			</Flex>
			<Flex align="center" gap={10}>
				<Flex>Starting url</Flex>
				<Input
					onBlur={(e) => onUpdate({ ...widget, startingUrl: localStartingUrl })}
					onChange={(e) => setLocalStartingUrl(e.currentTarget.value)}
					value={localStartingUrl}
				/>
			</Flex>
			<Flex flex={1} vertical gap={5}>
				<Flex justify="space-between" align="center">
					<Flex>Data</Flex>
					<Flex align="center" gap={10}>
						{renderCurrentStatus()}
						<Button disabled={!canDiscard} onClick={onSave}>
							Save python
						</Button>
						{canDiscard && (
							<UndoOutlined className={styles.undo} onClick={onReset} />
						)}
					</Flex>
				</Flex>
				<Flex onKeyDown={checkForSave} className={styles.codeEditor} flex={1}>
					<Resizer>
						{({ width, height }) => (
							<CodeMirror
								editable
								height={`${height}px`}
								width={`${width - 5}px`}
								value={localCopy}
								extensions={[python()]}
								onChange={setLocalCopy}
								basicSetup={{
									lineNumbers: true,
									tabSize: 4,
								}}
							/>
						)}
					</Resizer>
				</Flex>
			</Flex>
		</Flex>
	);
};
