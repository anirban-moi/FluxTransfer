"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type {
    TransferDirection,
    TransferStatus,
} from "@/features/history/types/transferHistory";

type HistoryToolbarProps = {
    search: string;

    direction?: TransferDirection;

    status?: TransferStatus;

    onSearchChange: (value: string) => void;

    onDirectionChange: (
        direction?: TransferDirection
    ) => void;

    onStatusChange: (
        status?: TransferStatus
    ) => void;

    onClearFilters: () => void;
};

export function HistoryToolbar({
    search,
    direction,
    status,
    onSearchChange,
    onDirectionChange,
    onStatusChange,
    onClearFilters,
}: HistoryToolbarProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    value={search}
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                    placeholder="Search transfers..."
                    className="pl-9"
                />
            </div>

            {/* Direction */}
            <div className="flex gap-2">
                <Button
                    variant={
                        direction === "send"
                            ? "default"
                            : "outline"
                    }
                    onClick={() =>
                        onDirectionChange(
                            direction === "send"
                                ? undefined
                                : "send"
                        )
                    }
                >
                    Send
                </Button>

                <Button
                    variant={
                        direction === "receive"
                            ? "default"
                            : "outline"
                    }
                    onClick={() =>
                        onDirectionChange(
                            direction === "receive"
                                ? undefined
                                : "receive"
                        )
                    }
                >
                    Receive
                </Button>
            </div>

            {/* Status */}
            <div className="flex gap-2">
                <Button
                    variant={
                        status === "completed"
                            ? "default"
                            : "outline"
                    }
                    onClick={() =>
                        onStatusChange(
                            status === "completed"
                                ? undefined
                                : "completed"
                        )
                    }
                >
                    Completed
                </Button>

                <Button
                    variant={
                        status === "failed"
                            ? "default"
                            : "outline"
                    }
                    onClick={() =>
                        onStatusChange(
                            status === "failed"
                                ? undefined
                                : "failed"
                        )
                    }
                >
                    Failed
                </Button>

                <Button
                    variant={
                        status === "cancelled"
                            ? "default"
                            : "outline"
                    }
                    onClick={() =>
                        onStatusChange(
                            status === "cancelled"
                                ? undefined
                                : "cancelled"
                        )
                    }
                >
                    Cancelled
                </Button>
            </div>

            {/* Clear */}
            <Button
                variant="ghost"
                onClick={onClearFilters}
            >
                <X className="mr-2 size-4" />
                Clear
            </Button>
        </div>
    );
}