"use client";

import { ReceiveTransferProvider } from "@/features/receive/context";
import ReceiveWorkflow from "./ReceiveWorkflow";

export default function ReceiveFilesPage() {

    return (
        <ReceiveTransferProvider>
            <ReceiveWorkflow />
        </ReceiveTransferProvider>
    );
}