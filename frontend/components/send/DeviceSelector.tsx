"use client";

import { Laptop, Monitor, RefreshCw, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { useSendTransfer } from "@/features/send/context";
import { mockDevices } from "@/features/send/constants/devices";

const platformIcons = {
    "Windows 11": Monitor,
    Android: Smartphone,
    Linux: Laptop,
    macOS: Laptop,
} as const;

export function DeviceSelector() {
    const { state, selectDevice } = useSendTransfer();

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Devices</CardTitle>

                <Button variant="outline" size="sm">
                    <RefreshCw className="mr-2 size-4" />
                    Refresh
                </Button>
            </CardHeader>

            <CardContent className="space-y-3">
                {mockDevices.map((device) => {
                    const Icon =
                        platformIcons[
                        device.platform as keyof typeof platformIcons
                        ] ?? Laptop;

                    const isSelected =
                        state.selectedDevice?.id === device.id;

                    return (
                        <button
                            key={device.id}
                            type="button"
                            onClick={() => selectDevice(device)}
                            className={cn(
                                "flex w-full items-center justify-between rounded-lg border p-4 text-left transition-all",
                                "hover:border-primary hover:bg-muted",
                                isSelected &&
                                "border-primary bg-primary/5 ring-1 ring-primary"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="rounded-lg bg-muted p-3">
                                    <Icon className="size-6" />
                                </div>

                                <div>
                                    <p className="font-medium">
                                        {device.name}
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        {device.platform}
                                    </p>
                                </div>
                            </div>

                            <span
                                className={cn(
                                    "text-sm font-medium",
                                    device.status === "online"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-muted-foreground"
                                )}
                            >
                                {device.status === "online"
                                    ? "Online"
                                    : "Offline"}
                            </span>
                        </button>
                    );
                })}
            </CardContent>
        </Card>
    );
}