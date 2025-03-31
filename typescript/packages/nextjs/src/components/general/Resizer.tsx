import { Flex } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";

export const Resizer = ({ children }: { children: (props: { width: number; height: number }) => React.ReactElement }) => {
    const container = useRef<HTMLDivElement>(null);
    const [hasMounted, setHasMounted] = useState(false);

    // This is a hack to force a re-render when the window is resized
    const [_, setRenderKey] = useState(0);

    const updateRenderKey = useCallback(() => {
        setRenderKey((key) => key + 1);
    }, []);

    useEffect(() => {
        window.addEventListener("resize", updateRenderKey)

        return () => {
            window.removeEventListener("resize", updateRenderKey);
        }
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
    }

    return (
        <Flex flex={1} ref={container}>
            {maybeRenderContent()}
        </Flex>
    )
}
