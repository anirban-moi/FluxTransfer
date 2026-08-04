"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useSendTransfer } from "@/features/send/context";

export function TransferOptions() {
    const { state, updateOptions } = useSendTransfer();

    const options = state.options;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transfer Options</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Transfer Mode */}
                <div className="space-y-3">
                    <h3 className="font-medium">Transfer Mode</h3>

                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant={
                                options.transferMode === "normal"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                updateOptions({
                                    transferMode: "normal",
                                })
                            }
                        >
                            Normal
                        </Button>

                        <Button
                            variant={
                                options.transferMode === "compressed"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                updateOptions({
                                    transferMode: "compressed",
                                })
                            }
                        >
                            Compressed
                        </Button>

                        <Button
                            variant={
                                options.transferMode === "encrypted"
                                    ? "default"
                                    : "outline"
                            }
                            onClick={() =>
                                updateOptions({
                                    transferMode: "encrypted",
                                })
                            }
                        >
                            Encrypted
                        </Button>
                    </div>
                </div>

                {/* Destination */}
                <div className="space-y-2">
                    <h3 className="font-medium">
                        Destination Folder
                    </h3>

                    <input
                        type="text"
                        value={options.destinationPath}
                        placeholder="Destination folder..."
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                        onChange={(e) =>
                            updateOptions({
                                destinationPath: e.target.value,
                            })
                        }
                    />
                </div>

                {/* Options */}
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

                        Verify file integrity
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={options.overwriteExisting}
                            onChange={(e) =>
                                updateOptions({
                                    overwriteExisting: e.target.checked,
                                })
                            }
                        />

                        Overwrite existing files
                    </label>

                    <label className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={options.preserveFolderStructure}
                            onChange={(e) =>
                                updateOptions({
                                    preserveFolderStructure:
                                        e.target.checked,
                                })
                            }
                        />

                        Preserve folder structure
                    </label>
                </div>
            </CardContent>
        </Card>
    );
}