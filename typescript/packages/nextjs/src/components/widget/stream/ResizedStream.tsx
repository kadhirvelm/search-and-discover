import { Resizer } from "@/components/general/Resizer";
import type { BoundingBox } from "api";
import { useRef } from "react";

function getCroppedStyle(
	height: number,
	width: number,
	boundingBox?: BoundingBox,
) {
	if (boundingBox === undefined) {
		return {
			width,
			height,
		};
	}

	const scaleX = width / boundingBox.width;
	const scaleY = height / boundingBox.height;

	const scale = Math.min(scaleX, scaleY);

	return {
		objectFit: "none" as const,
		objectPosition: `${-boundingBox.left}px ${-boundingBox.top}px`,
		width: `${boundingBox.width}px`,
		height: `${boundingBox.height}px`,
		transform: `scale(${scale})`,
		transformOrigin: "top left",
	};
}

export const ResizedStream = ({
	boundingBox,
	streamUrl,
	onRunCode,
}: {
	boundingBox?: BoundingBox;
	streamUrl: string;
	onRunCode: (code: string) => Promise<void>;
}) => {
	const sendPlaywrightClick = (width: number, height: number) => async (
		event: React.MouseEvent<HTMLImageElement>,
	) => {
		const imgElement = event.currentTarget;

		const originalWidth = imgElement.naturalWidth;
		const originalHeight = imgElement.naturalHeight;

		const currentWidth = imgElement.width;
		const currentHeight = imgElement.height;

		const scaleX = originalWidth / currentWidth;
		const scaleY = originalHeight / currentHeight;

		const offsetX = (event.clientX - imgElement.getBoundingClientRect().left);
		const offsetY = (event.clientY - imgElement.getBoundingClientRect().top);

		const playwrightX = Math.floor(offsetX * scaleX) + (boundingBox?.left ?? 0);
		const playwrightY = Math.floor(offsetY * scaleY) + (boundingBox?.top ?? 0);

		// TODO: figure out how to scale the click coordinate by the bounding box scale factors
		// const scaleBoundingX = width / (boundingBox?.width ?? width);
		// const scaleBoundingY = height / (boundingBox?.height ?? height);
		// const scaleBounding = Math.min(scaleBoundingX, scaleBoundingY);

		await onRunCode(`client.page.mouse.click(${playwrightX},${playwrightY})`);
	};

	const sendPlaywrightType = async (
		event: React.KeyboardEvent<HTMLImageElement>,
	) => {
		console.log(`Sending key to playwright: ${event.key}`);

		let playwrightType = `client.page.keyboard.type('${event.key}')`;
		if (event.key.length !== 1) {
			playwrightType = `client.page.keyboard.press('${event.key}')`;
		}

		await onRunCode(playwrightType);
	};

	const sendPlaywrightScroll = async (
		event: React.WheelEvent<HTMLImageElement>,
	) => {
		const playwrightScroll = `client.page.mouse.wheel(${event.deltaX},${event.deltaY})`;
		await onRunCode(playwrightScroll);
	};

	return (
		<Resizer>
			{({ width, height }) => {
				return (
					// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
					<img
						title="datascript"
						alt="datascript"
						src={streamUrl}
						// biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: <explanation>
						role="button"
						tabIndex={0}
						style={getCroppedStyle(height, width, boundingBox)}
						onClick={sendPlaywrightClick(width, height)}
						onKeyDown={sendPlaywrightType}
						onWheel={sendPlaywrightScroll}
					/>
				);
			}}
		</Resizer>
	);
};
