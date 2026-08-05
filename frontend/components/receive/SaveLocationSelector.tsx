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

    function handleBrowse() {
        // TODO:
        // Replace with native folder picker.
        updateOptions({
            saveLocation: "D:\\Downloads\\FluxTransfer",
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Save Location</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                        Destination Folder
                    </p>

                    <p className="mt-2 font-medium">
                        {state.options.saveLocation}
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button
                        variant="outline"
                        onClick={handleBrowse}
                    >
                        <FolderOpen className="mr-2 size-4" />
                        Browse
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}