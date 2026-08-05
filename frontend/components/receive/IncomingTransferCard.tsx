"use client";

import {
    ArrowDownToLine,
    Check,
    Laptop,
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
import { mockIncomingTransfer } from "@/features/receive/constants/transfers";
import { formatBytes } from "@/features/send/utils/formatBytes";

export function IncomingTransferCard() {
    const { state, acceptTransfer, rejectTransfer } =
        useReceiveTransfer();

    const transfer =
        state.incomingTransfer ?? mockIncomingTransfer;
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ArrowDownToLine className="size-5" />
                    Incoming Transfer
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-center gap-4 rounded-lg border p-4">
                    <Laptop className="size-8 text-muted-foreground" />

                    <div className="flex-1">
                        <p className="font-semibold">
                            {transfer.senderName}
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {transfer.senderPlatform}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="font-medium">
                            {transfer.totalFiles} Files
                        </p>

                        <p className="text-sm text-muted-foreground">
                            {formatBytes(transfer.totalSize)}
                        </p>
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Transfer Name
                    </p>

                    <p className="mt-1 font-medium">
                        {transfer.transferName}
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={rejectTransfer}>
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