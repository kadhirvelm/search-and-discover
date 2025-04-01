import { Resizer } from "@/components/general/Resizer";
import type { BoundingBox } from "api";

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

	// const scale = Math.min(scaleX, scaleY);

	return {
		objectFit: "none" as const,
		objectPosition: `${-boundingBox.left}px ${-boundingBox.top}px`,
		width: `${boundingBox.width}px`,
		height: `${boundingBox.height}px`,
		transform: `scale(${scaleX}, ${scaleY})`,
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
	const accountForBoundingBox = (width: number, height: number, event: React.MouseEvent<HTMLImageElement>) => {
		const imgElement = event.currentTarget;

		if (boundingBox === undefined) {
			const offsetX = (event.clientX - imgElement.getBoundingClientRect().left);
			const offsetY = (event.clientY - imgElement.getBoundingClientRect().top);

			return {
				currentWidth: imgElement.width,
				currentHeight: imgElement.height,
				offsetX,
				offsetY,
				left: 0,
				top: 0,
			}
		}

		// Account for the scaling of the image, changing the coordinate reference back to the non-scaled image
		const scaleBoundingX = width / (boundingBox?.width ?? width);
		const scaleBoundingY = height / (boundingBox?.height ?? height);
		// const scaleBounding = Math.min(scaleBoundingX, scaleBoundingY);

		const offsetX = (event.clientX - imgElement.getBoundingClientRect().left) / scaleBoundingX;
		const offsetY = (event.clientY - imgElement.getBoundingClientRect().top) / scaleBoundingY;

		return {
			currentWidth: imgElement.width / scaleBoundingX,
			currentHeight: imgElement.height / scaleBoundingY,
			offsetX,
			offsetY,
			left: boundingBox.left,
			top: boundingBox.top,
		}
	}

	const sendPlaywrightClick = (width: number, height: number) => async (
		event: React.MouseEvent<HTMLImageElement>,
	) => {
		const { currentWidth, currentHeight, offsetX, offsetY, left, top } = accountForBoundingBox(width, height, event);

		const imgElement = event.currentTarget;
		const originalWidth = imgElement.naturalWidth;
		const originalHeight = imgElement.naturalHeight;

		// Only scale the coordinates if the image has some skew in a specific direction
		const scaleX = currentWidth >= width ? originalWidth / currentWidth : 1;
		const scaleY = currentHeight >= height ? originalHeight / currentHeight : 1;

		const playwrightX = Math.floor(offsetX * scaleX) + left;
		const playwrightY = Math.floor(offsetY * scaleY) + top;

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
