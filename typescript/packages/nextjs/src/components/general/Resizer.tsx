import { Flex } from "antd";
import {
	type CSSProperties,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";

export const Resizer = ({
	children,
	style,
}: {
	children: (props: { width: number; height: number }) =>
		| React.ReactElement
		| undefined;
	style?: CSSProperties | undefined;
}) => {
	const container = useRef<HTMLDivElement>(null);
	const [hasMounted, setHasMounted] = useState(false);

	// This is a hack to force a re-render when the window is resized
	const [_, setRenderKey] = useState(0);

	const updateRenderKey = useCallback(() => {
		setRenderKey((key) => key + 1);
	}, []);

	useEffect(() => {
		window.addEventListener("resize", updateRenderKey);

		return () => {
			window.removeEventListener("resize", updateRenderKey);
		};
	}, [updateRenderKey]);

	useEffect(() => {
		setHasMounted(true);
	}, []);

	const maybeRenderContent = () => {
		if (!hasMounted || container.current == null) {
			return <div />;
		}

		return children({
			width: container.current.clientWidth,
			height: container.current.clientHeight,
		});
	};

	return (
		<Flex tabIndex={0} flex={1} ref={container} style={style}>
			{maybeRenderContent()}
		</Flex>
	);
};
