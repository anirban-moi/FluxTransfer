"use client";

import { History, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

type EmptyHistoryProps = {
    onRefresh?: () => void;
};

export function EmptyHistory({
    onRefresh,
}: EmptyHistoryProps) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <History className="mb-6 size-14 text-muted-foreground" />

                <h2 className="text-xl font-semibold">
                    No Transfer History
                </h2>

                <p className="mt-2 max-w-md text-muted-foreground">
                    Your completed transfers will appear here.
                </p>

                <Button
                    className="mt-8"
                    onClick={onRefresh}
                >
                    <RefreshCw className="mr-2 size-4" />
                    Refresh
                </Button>
            </CardContent>
        </Card>
    );
}