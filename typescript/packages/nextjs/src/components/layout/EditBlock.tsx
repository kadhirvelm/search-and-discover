import {
	DeleteOutlined,
	InsertRowBelowOutlined,
	InsertRowRightOutlined,
	PlusCircleOutlined,
	PlusOutlined,
	RobotFilled,
	RobotOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input } from "antd";
import type {
	Block as BlockType,
	LayoutColumnBlock,
	LayoutRowBlock,
} from "api";
import clsx from "clsx";
import { type ChangeEvent, useState } from "react";
import { EditWidget } from "../widget/EditWidget";
import styles from "./EditBlock.module.scss";

const AddBlock = ({
	onAdd,
	onPreview,
	onStopPreview,
	vertical,
}: {
	onAdd: (blockType: BlockType) => void;
	onPreview: () => void;
	onStopPreview: () => void;
	vertical: boolean;
}) => {
	return (
		<Flex
			align="center"
			justify="center"
			gap={10}
			vertical={vertical}
			onMouseLeave={onStopPreview}
		>
			<Button
				onClick={() => onAdd({ type: "layout-row", rows: [] })}
				onMouseEnter={onPreview}
			>
				<InsertRowBelowOutlined />
			</Button>
			<Button
				onClick={() => onAdd({ type: "layout-column", columns: [] })}
				onMouseEnter={onPreview}
			>
				<InsertRowRightOutlined />
			</Button>
			<Button
				onClick={() =>
					onAdd({ description: "", dataScript: "", type: "widget" })
				}
				onMouseEnter={onPreview}
			>
				<RobotOutlined />
			</Button>
		</Flex>
	);
};

const UniversalEdits = ({
	block,
	isRoot,
	onDelete,
	onStartDeletePreview,
	onStopDeletePreview,
	onUpdate,
}: {
	block: BlockType;
	isRoot: boolean;
	onDelete?: () => void;
	onStartDeletePreview: () => void;
	onStopDeletePreview: () => void;
	onUpdate: (updatedBlockType: BlockType) => void;
}) => {
	const onUpdateSpace = (event: ChangeEvent<HTMLInputElement>) => {
		onUpdate({
			...block,
			space: Math.max(Number.parseInt(event.target.value, 10), 1),
		});
	};

	if (block.type === "layout-column") {
		return (
			<Flex align="center" gap={10} vertical>
				{!isRoot && (
					<Flex
						className={styles.delete}
						onClick={onDelete}
						onMouseEnter={onStartDeletePreview}
						onMouseLeave={onStopDeletePreview}
						style={{ marginBottom: 10 }}
					>
						<DeleteOutlined />
					</Flex>
				)}
				<Flex className={styles.column} vertical>
					<Button
						onClick={() =>
							onUpdate({ ...block, type: "layout-row", rows: block.columns })
						}
					>
						Row
					</Button>
					<Button type="primary">Col</Button>
				</Flex>
				<Input
					onChange={onUpdateSpace}
					value={block.space ?? 1}
					type="number"
					style={{ width: 50 }}
				/>
			</Flex>
		);
	}

	if (block.type === "layout-row") {
		return (
			<Flex align="center" gap={10}>
				{!isRoot && (
					<Flex
						className={styles.delete}
						justify="end"
						onClick={onDelete}
						onMouseEnter={onStartDeletePreview}
						onMouseLeave={onStopDeletePreview}
						style={{ marginRight: 10 }}
					>
						<DeleteOutlined />
					</Flex>
				)}
				<Flex className={styles.row}>
					<Button type="primary">Row</Button>
					<Button
						onClick={() =>
							onUpdate({
								...block,
								type: "layout-column",
								columns: block.rows,
							})
						}
					>
						Col
					</Button>
				</Flex>
				<Input
					onChange={onUpdateSpace}
					value={block.space ?? 1}
					type="number"
					style={{ width: 50 }}
				/>
			</Flex>
		);
	}

	return (
		<Flex align="center" justify="end">
			<Flex
				className={styles.delete}
				justify="end"
				onClick={onDelete}
				onMouseEnter={onStartDeletePreview}
				onMouseLeave={onStopDeletePreview}
			>
				<DeleteOutlined />
			</Flex>
		</Flex>
	);
};

export const EditBlock = ({
	block,
	isRoot = false,
	onUpdate,
	onDelete,
}: {
	block: BlockType;
	isRoot?: boolean;
	onUpdate: (updatedBlockType: BlockType) => void;
	onDelete?: () => void;
}) => {
	const [isPreviewing, setIsPreviewing] = useState(false);
	const [isDeletePreview, setIsDeletePreview] = useState(false);

	const onStartPreview = () => setIsPreviewing(true);
	const onStopPreview = () => setIsPreviewing(false);

	const onStartDeletePreview = () => setIsDeletePreview(true);
	const onStopDeletePreview = () => setIsDeletePreview(false);

	const renderUniversalEdits = () => {
		return (
			<UniversalEdits
				block={block}
				isRoot={isRoot}
				onDelete={onDelete}
				onStartDeletePreview={onStartDeletePreview}
				onStopDeletePreview={onStopDeletePreview}
				onUpdate={onUpdate}
			/>
		);
	};

	if (block.type === "layout-row") {
		const onUpdateRow = (index: number) => (updatedRow: BlockType) => {
			const updatedRows = block.rows.slice();
			updatedRows.splice(index, 1, updatedRow);

			onUpdate({ ...block, rows: updatedRows });
		};

		const onDeleteRow = (index: number) => () => {
			const updatedRows = block.rows.slice();
			updatedRows.splice(index, 1);

			onUpdate({ ...block, rows: updatedRows });
		};

		const addNewWidget = (newBlock: BlockType) => {
			onUpdate({ ...block, rows: [...block.rows, newBlock] });
		};

		return (
			<div
				className={clsx(styles.layoutRows, {
					[styles.previewingDelete]: isDeletePreview,
				})}
				style={{ flex: block.space ?? 1 }}
			>
				<div className={styles.rowContainer}>
					{block.rows.map((row, index) => (
						<EditBlock
							block={row}
							key={`row-${index}`}
							onDelete={onDeleteRow(index)}
							onUpdate={onUpdateRow(index)}
						/>
					))}
					{isPreviewing && <div className={styles.preview} />}
				</div>
				<Flex align="center" justify="center" gap={10}>
					{renderUniversalEdits()}
					<AddBlock
						onAdd={addNewWidget}
						vertical={false}
						onPreview={onStartPreview}
						onStopPreview={onStopPreview}
					/>
				</Flex>
			</div>
		);
	}

	if (block.type === "layout-column") {
		const onUpdateColumn = (index: number) => (updatedRow: BlockType) => {
			const updatedColumns = block.columns.slice();
			updatedColumns.splice(index, 1, updatedRow);

			onUpdate({ ...block, columns: updatedColumns });
		};

		const onDeleteColumn = (index: number) => () => {
			const updatedColumns = block.columns.slice();
			updatedColumns.splice(index, 1);

			onUpdate({ ...block, columns: updatedColumns });
		};

		const addNewWidget = (newBlock: BlockType) => {
			onUpdate({ ...block, columns: [...block.columns, newBlock] });
		};

		return (
			<div
				className={clsx(styles.layoutColumns, {
					[styles.previewingDelete]: isDeletePreview,
				})}
				style={{ flex: block.space ?? 1 }}
			>
				<div className={styles.columnContainer}>
					{block.columns.map((column, index) => (
						<EditBlock
							block={column}
							key={`column-${index}`}
							onDelete={onDeleteColumn(index)}
							onUpdate={onUpdateColumn(index)}
						/>
					))}
					{isPreviewing && <div className={styles.preview} />}
				</div>
				<Flex justify="center" align="center" vertical gap={10}>
					{renderUniversalEdits()}
					<AddBlock
						onAdd={addNewWidget}
						vertical={true}
						onPreview={onStartPreview}
						onStopPreview={onStopPreview}
					/>
				</Flex>
			</div>
		);
	}

	return (
		<Flex
			className={clsx(styles.widget, {
				[styles.previewingDelete]: isDeletePreview,
			})}
			flex={block.space ?? 1}
			vertical
		>
			{renderUniversalEdits()}
			<EditWidget widget={block} onUpdate={onUpdate} />
		</Flex>
	);
};
