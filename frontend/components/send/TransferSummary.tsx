"use client";

import {
    CheckCircle2,
    Clock3,
    Download,
    FolderOpen,
    HardDrive,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function TransferSummary() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Transfer Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                    <CheckCircle2 className="size-8 text-green-600" />

                    <div>
                        <p className="font-semibold">
                            Transfer Completed Successfully
                        </p>

                        <p className="text-sm text-muted-foreground">
                            All files have been transferred successfully.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <FolderOpen className="size-4 text-muted-foreground" />

                            <span className="text-sm text-muted-foreground">
                                Files
                            </span>
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            12
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <HardDrive className="size-4 text-muted-foreground" />

                            <span className="text-sm text-muted-foreground">
                                Total Size
                            </span>
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            2.6 GB
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <Clock3 className="size-4 text-muted-foreground" />

                            <span className="text-sm text-muted-foreground">
                                Duration
                            </span>
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            00:38
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <div className="flex items-center gap-2">
                            <Download className="size-4 text-muted-foreground" />

                            <span className="text-sm text-muted-foreground">
                                Average Speed
                            </span>
                        </div>

                        <p className="mt-2 text-2xl font-bold">
                            84 MB/s
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}