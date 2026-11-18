"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { File, Folder, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useSendTransfer } from "@/features/send/context";
import { formatBytes } from "@/features/send/utils/formatBytes";
import type { TransferItem } from "@/features/send/types/transfer";
import { cn } from "@/lib/utils";

export function FileSelector() {
    const {
        state,
        addItems,
        removeItem,
        clearItems,
    } = useSendTransfer();

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    function processFiles(files: FileList | File[]) {
        const newItems: TransferItem[] = Array.from(files).map((file) => ({
            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            path: file.name,
            size: file.size,
            type: "file",
            file: file,
        }));
        addItems(newItems);
    }

    function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            // reset input value so selecting the same file again works
            e.target.value = "";
        }
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }

    function handleDragLeave(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }

    function handleDrop(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Select Files</CardTitle>

                {state.selectedItems.length > 0 && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={clearItems}
                    >
                        Clear All
                    </Button>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Hidden File Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                />

                {/* Drop Zone */}
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
                        isDragging
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                >
                    <Upload className={cn("mb-4 size-10", isDragging ? "text-primary" : "text-muted-foreground")} />

                    <h3 className="text-lg font-semibold">
                        Drag & Drop Files Here
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                        or click anywhere to browse from your computer.
                    </p>

                    <div className="mt-6 flex gap-3">
                        <Button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                fileInputRef.current?.click();
                            }}
                        >
                            Select Files
                        </Button>
                    </div>
                </div>

                {/* Selected Items */}
                {state.selectedItems.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground">
                                Selected Files ({state.selectedItems.length})
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                Total: {formatBytes(state.selectedItems.reduce((acc, it) => acc + it.size, 0))}
                            </span>
                        </div>

                        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                            {state.selectedItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-xs"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="rounded-md bg-muted p-2">
                                            {item.type === "directory" ? (
                                                <Folder className="size-4 text-primary" />
                                            ) : (
                                                <File className="size-4 text-primary" />
                                            )}
                                        </div>

                                        <div className="overflow-hidden">
                                            <p className="truncate font-medium text-sm text-foreground">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatBytes(item.size)}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}