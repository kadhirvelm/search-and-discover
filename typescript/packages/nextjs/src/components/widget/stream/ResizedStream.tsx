import { Resizer } from "@/components/general/Resizer";

export const ResizedStream = ({ streamUrl }: { streamUrl: string }) => {
	return (
		<Resizer>
			{({ width, height }) => {
				return (
                    <img
                        title="datascript"
                        alt="datascript"
                        src={streamUrl}
                        style={{
                            width: width, // Adjust to counteract the scale factor
                            height: height,
                            objectFit: "contain",
                        }}
                    />
                )
			}}
		</Resizer>
	);
};
