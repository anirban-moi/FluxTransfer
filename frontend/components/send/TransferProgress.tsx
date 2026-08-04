"use client";

import { useEffect } from "react";

import {
    Clock3,
    Pause,
    Play,
    Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useSendTransfer } from "@/features/send/context";
import { formatBytes } from "@/features/send/utils/formatBytes";

export function TransferProgress() {
    const {
        state,
        pauseTransfer,
        resumeTransfer,
        cancelTransfer,
        updateProgress,
        completeTransfer,
    } = useSendTransfer();

    const progress = state.progress;

    useEffect(() => {
        if (progress.status !== "running") {
            return;
        }

        const timer = setInterval(() => {
            const nextPercentage = Math.min(
                progress.percentage + 5,
                100
            );

            updateProgress({
                percentage: nextPercentage,
                transferredBytes:
                    (progress.totalBytes * nextPercentage) /
                    100,
                speed: 85 * 1024 * 1024,
                remainingSeconds: Math.max(
                    0,
                    Math.floor((100 - nextPercentage) / 5)
                ),
            });

            if (nextPercentage >= 100) {
                clearInterval(timer);
                completeTransfer();
            }
        }, 500);

        return () => clearInterval(timer);
    }, [
        progress.status,
        progress.percentage,
        progress.totalBytes,
        updateProgress,
        completeTransfer,
    ]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transfer Progress</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="font-medium">
                        Status
                    </span>

                    <span className="font-medium capitalize text-primary">
                        {progress.status}
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span>Overall Progress</span>

                        <span>{progress.percentage}%</span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{
                                width: `${progress.percentage}%`,
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Current File
                    </p>

                    <p className="mt-1 font-medium">
                        {progress.currentFile || "-"}
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Speed
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                            {formatBytes(progress.speed)}/s
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Remaining
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                            {progress.remainingSeconds}s
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Transferred
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                            {formatBytes(
                                progress.transferredBytes
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={pauseTransfer}
                        disabled={progress.status !== "running"}
                    >
                        <Pause className="mr-2 size-4" />
                        Pause
                    </Button>

                    <Button
                        variant="outline"
                        onClick={resumeTransfer}
                        disabled={progress.status !== "paused"}
                    >
                        <Play className="mr-2 size-4" />
                        Resume
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={cancelTransfer}
                        disabled={
                            progress.status === "cancelled" ||
                            progress.status === "completed"
                        }
                    >
                        <Square className="mr-2 size-4" />
                        Cancel
                    </Button>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="size-4" />

                    <span>
                        Total Size:{" "}
                        {formatBytes(progress.totalBytes)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}