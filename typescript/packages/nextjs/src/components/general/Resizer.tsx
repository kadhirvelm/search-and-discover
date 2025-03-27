import { Flex } from "antd";
import { useEffect, useRef, useState } from "react";

export const Resizer = ({ children }: { children: (props: { width: number; height: number }) => React.ReactElement }) => {
    const container = useRef<HTMLDivElement>(null);
    const [hasMounted, setHasMounted] = useState(false);

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
