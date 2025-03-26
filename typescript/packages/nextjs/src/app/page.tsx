"use client";

import { Entry } from "@/components/Entry";
import { Provider } from "@/lib/store/Provider";

import "@ant-design/v5-patch-for-react-19";

export default function Home() {
	return (
		<Provider>
			<Entry />
		</Provider>
	);
}
