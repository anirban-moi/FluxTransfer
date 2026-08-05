"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useReceiveTransfer } from "@/features/receive/context";
import { formatBytes } from "@/features/send/utils/formatBytes";
import { validateReceive } from "@/features/receive/utils/validateReceive";

export function ReceiveReview() {
    const { state, startReceive } = useReceiveTransfer();

    const transfer = state.incomingTransfer;

    if (!transfer) {
        return null;
    }

    const errors = validateReceive(state);
    const canReceive = errors.length === 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Receive Review</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Sender
                        </p>

                        <p className="mt-1 font-semibold">
                            {transfer.senderName}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Transfer
                        </p>

                        <p className="mt-1 font-semibold">
                            {transfer.transferName}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Files
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {transfer.totalFiles}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Total Size
                        </p>

                        <p className="mt-1 text-2xl font-bold">
                            {formatBytes(transfer.totalSize)}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4 md:col-span-2">
                        <p className="text-sm text-muted-foreground">
                            Save Location
                        </p>

                        <p className="mt-1 font-semibold">
                            {state.options.saveLocation}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Conflict Resolution
                        </p>

                        <p className="mt-1 font-semibold capitalize">
                            {state.options.conflictResolution}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Verify Integrity
                        </p>

                        <p className="mt-1 font-semibold">
                            {state.options.verifyIntegrity
                                ? "Enabled"
                                : "Disabled"}
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
                    <Button
                        disabled={!canReceive}
                        onClick={startReceive}
                    >
                        Start Receiving
                        <ArrowRight className="ml-2 size-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}