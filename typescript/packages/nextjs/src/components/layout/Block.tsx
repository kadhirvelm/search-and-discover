import {
	DeleteOutlined,
	InsertRowBelowOutlined,
	InsertRowRightOutlined,
	PlusCircleOutlined,
	PlusOutlined,
	RobotFilled,
	RobotOutlined,
} from "@ant-design/icons";
import { Button, Flex } from "antd";
import type { Block as BlockType } from "api";
import clsx from "clsx";
import { useState } from "react";
import styles from "./Block.module.scss";

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
			onMouseEnter={onPreview}
			onMouseLeave={onStopPreview}
		>
			<Button onClick={() => onAdd({ type: "layout-row", rows: [] })}><InsertRowBelowOutlined /></Button>
			<Button onClick={() => onAdd({ type: "layout-column", columns: [] })}>
				<InsertRowRightOutlined />
			</Button>
			<Button onClick={() => onAdd({ description: "", type: "widget" })}>
				<RobotOutlined />
			</Button>
		</Flex>
	);
};

export const Block = ({
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

	const maybeRenderDelete = () => {
		if (isRoot) {
			return;
		}

		if (block.type === "layout-column") {
			return (
				<Flex justify="space-between" vertical>
					<Flex>C</Flex>
					<Flex
						className={styles.delete}
						onClick={onDelete}
						onMouseEnter={onStartDeletePreview}
						onMouseLeave={onStopDeletePreview}
					>
						<DeleteOutlined />
					</Flex>
				</Flex>
			);
		}

		if (block.type === "layout-row") {
			return (
				<Flex align="center" justify="space-between">
					<Flex>R</Flex>
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
			>
				{maybeRenderDelete()}
				<div className={styles.rowContainer}>
					{block.rows.map((row, index) => (
						<Block
							block={row}
							key={`row-${index}`}
							onDelete={onDeleteRow(index)}
							onUpdate={onUpdateRow(index)}
						/>
					))}
					{isPreviewing && (
						<div className={styles.preview}>
							<PlusOutlined />
						</div>
					)}
				</div>
				<AddBlock
					onAdd={addNewWidget}
					vertical={false}
					onPreview={onStartPreview}
					onStopPreview={onStopPreview}
				/>
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
			>
				{maybeRenderDelete()}
				<div className={styles.columnContainer}>
					{block.columns.map((column, index) => (
						<Block
							block={column}
							key={`column-${index}`}
							onDelete={onDeleteColumn(index)}
							onUpdate={onUpdateColumn(index)}
						/>
					))}
					{isPreviewing && (
						<div className={styles.preview}>
							<PlusOutlined />
						</div>
					)}
				</div>
				<AddBlock
					onAdd={addNewWidget}
					vertical={true}
					onPreview={onStartPreview}
					onStopPreview={onStopPreview}
				/>
			</div>
		);
	}

	return (
		<Flex
			className={clsx(styles.widget, {
				[styles.previewingDelete]: isDeletePreview,
			})}
			flex={1}
			vertical
		>
			{maybeRenderDelete()}
			<Flex flex={1} align="center" justify="center">
				Widget here
			</Flex>
		</Flex>
	);
};
