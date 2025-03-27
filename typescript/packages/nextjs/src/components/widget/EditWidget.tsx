import { useValidatePython } from "@/lib/hooks/useValidatePython";
import { configService } from "@/lib/services/configService";
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	DeleteOutlined,
	UndoOutlined,
} from "@ant-design/icons";
import { python } from "@codemirror/lang-python";
// import SyntaxHighlighter from "react-syntax-highlighter";
import CodeMirror from "@uiw/react-codemirror";
import { Button, Flex, Input, Spin, Tooltip } from "antd";
import type { WidgetBlock } from "api";
import { useRef } from "react";
import styles from "./EditWidget.module.scss";

export const EditWidget = ({
	widget,
	onUpdate,
}: { widget: WidgetBlock; onUpdate: (newWidget: WidgetBlock) => void }) => {
	const codeContainer = useRef<HTMLDivElement>(null);

	const { localCopy, setLocalCopy, isValid, canDiscard, onReset } =
		useValidatePython(widget.dataScript);

	const codeHeight = `${codeContainer.current?.clientHeight}px`;
	const codeWidth = `${(codeContainer.current?.clientWidth ?? 0) * 0.99}px`;

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
				<Input value={widget.description} />
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
				<Flex
					onKeyDown={checkForSave}
					ref={codeContainer}
					className={styles.codeEditor}
					flex={1}
				>
					<CodeMirror
						autoFocus
						editable
						height={codeHeight}
						width={codeWidth}
						value={localCopy}
						key={codeContainer.current == null ? "null" : "not-null"}
						extensions={[python()]}
						onChange={setLocalCopy}
						basicSetup={{
							lineNumbers: true,
							tabSize: 4,
						}}
					/>
				</Flex>
			</Flex>
		</Flex>
	);
};
