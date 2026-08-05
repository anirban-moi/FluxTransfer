"use client";

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

import { useReceiveTransfer } from "@/features/receive/context";
import { formatBytes } from "@/features/send/utils/formatBytes";

export function ReceiveProgress() {
    const {
        state,
        pauseReceive,
        resumeReceive,
        cancelReceive,
    } = useReceiveTransfer();

    const progress = state.progress;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Receive Progress</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <span className="font-medium">
                        Status
                    </span>

                    <span className="capitalize font-medium text-primary">
                        {progress.status}
                    </span>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span>Overall Progress</span>

                        <span>
                            {progress.percentage}%
                        </span>
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

                {/* Sender */}
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Receiving From
                    </p>

                    <p className="mt-1 font-medium">
                        {state.incomingTransfer?.senderName ??
                            "-"}
                    </p>
                </div>

                {/* Current File */}
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Current File
                    </p>

                    <p className="mt-1 font-medium">
                        {progress.currentFile || "-"}
                    </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Receive Speed
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
                            Received
                        </p>

                        <p className="mt-1 text-xl font-semibold">
                            {formatBytes(progress.receivedBytes)}
                        </p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={pauseReceive}
                        disabled={progress.status !== "receiving"}
                    >
                        <Pause className="mr-2 size-4" />
                        Pause
                    </Button>

                    <Button
                        variant="outline"
                        onClick={resumeReceive}
                        disabled={progress.status !== "paused"}
                    >
                        <Play className="mr-2 size-4" />
                        Resume
                    </Button>

                    <Button
                        variant="destructive"
                        onClick={cancelReceive}
                        disabled={
                            progress.status === "cancelled" ||
                            progress.status === "completed"
                        }
                    >
                        <Square className="mr-2 size-4" />
                        Cancel
                    </Button>
                </div>

                {/* Footer */}
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