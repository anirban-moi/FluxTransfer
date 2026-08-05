"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useReceiveTransfer } from "@/features/receive/context";

export function ReceiveOptions() {
    const { state, updateOptions } = useReceiveTransfer();

    const options = state.options;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Receive Options</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Conflict Resolution */}
                <div className="space-y-3">
                    <h3 className="font-medium">
                        File Conflict Resolution
                    </h3>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant={
                                options.conflictResolution === "ask"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                updateOptions({
                                    conflictResolution: "ask",
                                })
                            }
                        >
                            Ask Every Time
                        </Button>

                        <Button
                            variant={
                                options.conflictResolution === "overwrite"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                updateOptions({
                                    conflictResolution: "overwrite",
                                })
                            }
                        >
                            Overwrite
                        </Button>

                        <Button
                            variant={
                                options.conflictResolution === "skip"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                updateOptions({
                                    conflictResolution: "skip",
                                })
                            }
                        >
                            Skip Existing
                        </Button>
                    </div>
                </div>

                {/* Additional Options */}
                <div className="space-y-3">
                    <h3 className="font-medium">
                        Additional Options
                    </h3>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={options.verifyIntegrity}
                            onChange={(e) =>
                                updateOptions({
                                    verifyIntegrity: e.target.checked,
                                })
                            }
                        />

                        Verify file integrity after receiving
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={options.preserveTimestamps}
                            onChange={(e) =>
                                updateOptions({
                                    preserveTimestamps: e.target.checked,
                                })
                            }
                        />

                        Preserve original timestamps
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={options.openFolderWhenComplete}
                            onChange={(e) =>
                                updateOptions({
                                    openFolderWhenComplete:
                                        e.target.checked,
                                })
                            }
                        />

                        Open destination folder when complete
                    </label>
                </div>
            </CardContent>
        </Card>
    );
}