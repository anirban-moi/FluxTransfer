"use client";

import { MonitorSmartphone, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";

type EmptyDevicesProps = {
    onRefresh?: () => void;
};

export function EmptyDevices({
    onRefresh,
}: EmptyDevicesProps) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <MonitorSmartphone className="mb-6 size-14 text-muted-foreground" />

                <h2 className="text-xl font-semibold">
                    No Devices Found
                </h2>

                <p className="mt-2 max-w-md text-muted-foreground">
                    We couldn't find any devices on your local network.
                    Make sure the other device is running FluxTransfer
                    and is connected to the same network.
                </p>

                <Button
                    className="mt-8"
                    onClick={onRefresh}
                >
                    <RefreshCw className="mr-2 size-4" />
                    Scan Again
                </Button>
            </CardContent>
        </Card>
    );
}