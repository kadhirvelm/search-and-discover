import { Resizer } from "@/components/general/Resizer";
import type { BoundingBox } from "api";

function getCroppedStyle(height: number, width: number, boundingBox?: BoundingBox) {
	if (boundingBox === undefined) {
		return {
			objectFit: "contain" as const,
			width,
			height,
		}
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
	}
}

export const ResizedStream = ({
	boundingBox,
	streamUrl,
}: { boundingBox?: BoundingBox; streamUrl: string }) => {
	return (
		<Resizer>
			{({ width, height }) => {
				return (
					<img
						title="datascript"
						alt="datascript"
						src={streamUrl}
						style={getCroppedStyle(height, width, boundingBox)}
					/>
				);
			}}
		</Resizer>
	);
};
