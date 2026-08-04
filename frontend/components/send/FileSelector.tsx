"use client";

import { File, Folder, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useSendTransfer } from "@/features/send/context";
import { mockTransferItems } from "@/features/send/constants/files";

export function FileSelector() {
    const {
        state,
        addItems,
        removeItem,
        clearItems,
    } = useSendTransfer();

    function handleSelectFiles() {
        addItems(mockTransferItems);
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Select Files & Folders</CardTitle>

                {state.selectedItems.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearItems}
                    >
                        Clear
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Drop Zone */}
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-10 text-center">
                    <Upload className="mb-4 size-10 text-muted-foreground" />

                    <h3 className="text-lg font-semibold">
                        Drag & Drop Files Here
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                        or browse files and folders.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <Button onClick={handleSelectFiles}>
                            Select Files
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleSelectFiles}
                        >
                            Select Folder
                        </Button>
                    </div>
                </div>

                {/* Selected Items */}
                {state.selectedItems.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="font-medium">
                            Selected Items
                        </h3>

                        {state.selectedItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div className="flex items-center gap-3">
                                    {item.type === "directory" ? (
                                        <Folder className="size-5 text-muted-foreground" />
                                    ) : (
                                        <File className="size-5 text-muted-foreground" />
                                    )}

                                    <div>
                                        <p className="font-medium">
                                            {item.name}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {item.path}
                                        </p>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}