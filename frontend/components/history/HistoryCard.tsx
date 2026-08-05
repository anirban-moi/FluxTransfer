"use client";

import {
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    XCircle,
} from "lucide-react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { formatBytes } from "@/features/send/utils/formatBytes";
import type { TransferRecord } from "@/features/history/types/transferHistory";

type HistoryCardProps = {
    transfer: TransferRecord;

    onClick?: (transfer: TransferRecord) => void;
};

function getDirectionIcon(direction: TransferRecord["direction"]) {
    return direction === "send" ? (
        <ArrowUpRight className="size-6 text-blue-600" />
    ) : (
        <ArrowDownLeft className="size-6 text-green-600" />
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

export function HistoryCard({
    transfer,
    onClick,
}: HistoryCardProps) {
    return (
        <Card
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
            onClick={() => onClick?.(transfer)}
        >
            <CardContent className="flex items-center gap-4 p-4">
                {/* Direction */}
                <div className="rounded-lg border p-3">
                    {getDirectionIcon(transfer.direction)}
                </div>

                {/* Transfer Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">
                            {transfer.transferName}
                        </h3>

                        {getStatusIcon(transfer.status)}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {transfer.deviceName}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span>{transfer.totalFiles} files</span>

                        <span>
                            {formatBytes(transfer.totalSize)}
                        </span>

                        <span className="capitalize">
                            {transfer.direction}
                        </span>

                        <span className="capitalize">
                            {transfer.status}
                        </span>
                    </div>
                </div>

                {/* Time */}
                <div className="text-right">
                    <p className="text-sm font-medium">
                        {transfer.completedAt.toLocaleDateString()}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        {transfer.completedAt.toLocaleTimeString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}