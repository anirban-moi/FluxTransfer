"use client";

import {
    ArrowDownToLine,
    Check,
    Laptop,
    Radio,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useReceiveTransfer } from "@/features/receive/context";
import { formatBytes } from "@/features/send/utils/formatBytes";

export function IncomingTransferCard() {
    const { state, acceptTransfer, rejectTransfer } =
        useReceiveTransfer();

    const transfer = state.incomingTransfer;

    if (!transfer) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowDownToLine className="size-5" />
                        Incoming Transfer
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
                        <div className="relative mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                            <Radio className="size-7 text-primary animate-pulse" />
                        </div>

                        <h3 className="text-lg font-semibold">
                            Waiting for Incoming Transfers
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                            FluxTransfer is listening for file transfers from paired devices on your local network.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/50 shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                    <ArrowDownToLine className="size-5" />
                    Incoming Transfer Request
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                        <Laptop className="size-7 text-primary" />
                    </div>

                    <div className="flex-1">
                        <p className="font-semibold text-foreground">
                            {transfer.senderName}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            {transfer.senderPlatform}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-medium text-foreground">
                            {transfer.totalFiles} {transfer.totalFiles === 1 ? "File" : "Files"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {formatBytes(transfer.totalSize)}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                        File Name
                    </p>

                    <p className="mt-1 font-medium text-foreground">
                        {transfer.transferName}
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => rejectTransfer()}>
                        <X className="mr-2 size-4" />
                        Reject
                    </Button>

                    <Button onClick={() => acceptTransfer(transfer)}>
                        <Check className="mr-2 size-4" />
                        Accept
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
