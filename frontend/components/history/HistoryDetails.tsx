"use client";

import {
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    HardDrive,
    Timer,
    XCircle,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { formatBytes } from "@/features/send/utils/formatBytes";
import type { TransferRecord } from "@/features/history/types/transferHistory";

type HistoryDetailsProps = {
    transfer?: TransferRecord;
};

function getDirectionIcon(direction: TransferRecord["direction"]) {
    return direction === "send" ? (
        <ArrowUpRight className="size-5 text-blue-600" />
    ) : (
        <ArrowDownLeft className="size-5 text-green-600" />
    );
}

function getStatusIcon(status: TransferRecord["status"]) {
    switch (status) {
        case "completed":
            return (
                <CheckCircle2 className="size-5 text-green-600" />
            );

        case "failed":
            return (
                <XCircle className="size-5 text-red-600" />
            );

        case "cancelled":
            return (
                <Clock3 className="size-5 text-yellow-600" />
            );
    }
}

export function HistoryDetails({
    transfer,
}: HistoryDetailsProps) {
    if (!transfer) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Transfer Details</CardTitle>
                </CardHeader>

                <CardContent className="py-12 text-center text-muted-foreground">
                    Select a transfer to view its details.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{transfer.transferName}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* General */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Device
                        </p>

                        <p className="mt-1 font-medium">
                            {transfer.deviceName}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Direction
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            {getDirectionIcon(transfer.direction)}

                            <span className="capitalize font-medium">
                                {transfer.direction}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Status
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                            {getStatusIcon(transfer.status)}

                            <span className="capitalize font-medium">
                                {transfer.status}
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Files
                        </p>

                        <p className="mt-1 font-medium">
                            {transfer.totalFiles}
                        </p>
                    </div>
                </div>

                {/* Statistics */}
                <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <HardDrive className="size-4" />

                        <h3 className="font-semibold">
                            Transfer Statistics
                        </h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Total Size
                            </p>

                            <p className="font-medium">
                                {formatBytes(transfer.totalSize)}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Average Speed
                            </p>

                            <p className="font-medium">
                                {formatBytes(
                                    transfer.averageSpeed
                                )}
                                /s
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Duration
                            </p>

                            <p className="font-medium">
                                {transfer.durationSeconds}s
                            </p>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <Timer className="size-4" />

                        <h3 className="font-semibold">
                            Timeline
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span>Started</span>

                            <span>
                                {transfer.startedAt.toLocaleString()}
                            </span>
                        </div>

                        <div className="flex justify-between">
                            <span>Completed</span>

                            <span>
                                {transfer.completedAt.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}