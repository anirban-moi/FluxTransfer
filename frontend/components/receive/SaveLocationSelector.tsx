"use client";

import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { useReceiveTransfer } from "@/features/receive/context";

export function SaveLocationSelector() {
    const { state, updateOptions } = useReceiveTransfer();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Save Location</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                        Destination Folder
                    </label>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={state.options.saveLocation}
                            onChange={(e) => updateOptions({ saveLocation: e.target.value })}
                            placeholder="./downloads"
                            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-hidden"
                        />
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => updateOptions({ saveLocation: "./downloads" })}
                        >
                            <FolderOpen className="mr-2 size-4" />
                            Default
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Files will be securely saved into this folder on your machine.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
