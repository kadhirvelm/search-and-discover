import type { WidgetBlock } from "api";
import { useEffect, useRef } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import styles from "./ViewWidget.module.scss";

/* <SyntaxHighlighter language="python">
    {widget.dataScript}
</SyntaxHighlighter> */

export const ViewWidget = ({ widget }: { widget: WidgetBlock }) => {
	const iframeRef = useRef<HTMLIFrameElement>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        if (iframeRef.current == null || iframeRef.current.contentWindow == null) {
            return;
        }

        console.log(iframeRef.current.contentWindow.scrollBy);
        iframeRef.current.contentWindow?.scrollBy({ top: 1000 });
    }, [iframeRef.current])

	return (
		<div className={styles.widget} style={{ flex: widget.space ?? 1 }}>
			<iframe
				title="amzn"
				src="https://www.google.com/maps/embed/v1/place?key=AIzaSyC6uWRmJgoYd5wx-198bfnO41WblQ5HHig&q=Ch%C4%ABsai%20Sushi%20Club%2C3369%20Mission%20Street%2CSan%20Francisco%2CCA%2C94110"
				style={{
					display: "flex",
					flex: 1,
					height: "100%",
					width: "100%",
				}}
                ref={iframeRef}
			/>
		</div>
	);
};
