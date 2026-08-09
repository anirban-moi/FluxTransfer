"use client";

import {
    ArrowUpDown,
    CheckCircle2,
    Laptop,
    LoaderCircle,
    Smartphone,
    WifiOff,
} from "lucide-react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import type { Device } from "@/features/devices/types/device";
import { Button } from "../ui/button";

type DeviceCardProps = {
    device: Device;

    onClick?: (device: Device) => void;

    onPair?: (device: Device) => void;
};

function getPlatformIcon(platform: Device["platform"]) {
    switch (platform) {
        case "android":
        case "ios":
            return <Smartphone className="size-8" />;

        default:
            return <Laptop className="size-8" />;
    }
}

function getStatusColor(status: Device["status"]) {
    switch (status) {
        case "online":
            return "bg-green-500";

        case "connecting":
            return "bg-yellow-500";

        default:
            return "bg-gray-400";
    }
}

function getTransferIcon(state: Device["transferState"]) {
    switch (state) {
        case "sending":
        case "receiving":
            return (
                <ArrowUpDown className="size-4 text-primary" />
            );

        default:
            return null;
    }
}

export function DeviceCard({
    device,
    onClick,
    onPair,
}: DeviceCardProps) {
    return (
        <Card
            onClick={() => onClick?.(device)}
            className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
        >
            <CardContent className="flex items-center gap-4 p-4">
                {/* Platform */}
                <div className="rounded-lg border p-3">
                    {getPlatformIcon(device.platform)}
                </div>

                {/* Device Info */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">
                            {device.name}
                        </h3>

                        {device.trust === "trusted" && (
                            <CheckCircle2 className="size-4 text-green-600" />
                        )}
                    </div>

                    <p className="truncate text-sm text-muted-foreground">
                        {device.hostname}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                        <span
                            className={`size-2 rounded-full ${getStatusColor(
                                device.status
                            )}`}
                        />

                        <span className="text-xs capitalize text-muted-foreground">
                            {device.status}
                        </span>

                    </div>
                    <Button
                        size="sm"
                        disabled={device.status !== "online"}
                        onClick={(event) => {
                            event.stopPropagation();
                            onPair?.(device);
                        }}
                    >
                        Pair
                    </Button>
                </div>

                {/* Activity */}
                <div className="flex flex-col items-end gap-2">
                    {device.status === "connecting" && (
                        <LoaderCircle className="size-5 animate-spin text-yellow-500" />
                    )}

                    {device.status === "offline" && (
                        <WifiOff className="size-5 text-muted-foreground" />
                    )}

                    {getTransferIcon(device.transferState)}
                </div>
            </CardContent>
        </Card>
    );
}