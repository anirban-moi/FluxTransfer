"use client";

import { HistoryCard } from "./HistoryCard";

import type { TransferRecord } from "@/features/history/types/transferHistory";

type HistoryListProps = {
    transfers: TransferRecord[];

    selectedTransferId?: string;

    onSelect?: (transfer: TransferRecord) => void;
};

export function HistoryList({
    transfers,
    selectedTransferId,
    onSelect,
}: HistoryListProps) {
    if (transfers.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No transfer history found.
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {transfers.map((transfer) => (
                <div
                    key={transfer.id}
                    className={
                        selectedTransferId === transfer.id
                            ? "rounded-xl ring-2 ring-primary"
                            : ""
                    }
                >
                    <HistoryCard
                        transfer={transfer}
                        onClick={onSelect}
                    />
                </div>
            ))}
        </div>
    );
}