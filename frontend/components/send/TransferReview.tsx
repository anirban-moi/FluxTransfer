"use client";

import {
    ArrowRight,
    Folder,
    Laptop,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useSendTransfer } from "@/features/send/context";
import { validateTransfer } from "@/features/send/utils/validateTransfer";
import { formatBytes } from "@/features/send/utils/formatBytes";

export function TransferReview() {
    const { state } = useSendTransfer();
    const { startTransfer } = useSendTransfer();
    const totalItems = state.selectedItems.length;

    const totalSize = state.selectedItems.reduce(
        (total, item) => total + item.size,
        0
    );

    const errors = validateTransfer(state);
    const canTransfer = errors.length === 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transfer Review</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Destination Device
                    </p>

                    <p className="mt-1 font-semibold">
                        {state.selectedDevice?.name ?? "No device selected"}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Selected Items
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {totalItems}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Total Size
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {formatBytes(totalSize)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Transfer Mode
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                            {state.options.transferMode}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Destination
                        </p>

                        <p className="mt-1 text-lg font-semibold">
                            {state.options.destinationPath || "-"}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    {errors.length > 0 && (
                        <div className="space-y-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                            <h3 className="font-medium text-yellow-700 dark:text-yellow-300">
                                Before you continue
                            </h3>

                            <ul className="list-disc space-y-1 pl-5 text-sm text-yellow-700 dark:text-yellow-300">
                                {errors.map((error) => (
                                    <li key={error}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <Button disabled={!canTransfer} onClick={startTransfer}>
                        Start Transfer
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}