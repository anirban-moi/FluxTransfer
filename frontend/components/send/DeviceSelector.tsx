"use client";

import { CheckCircle2, Laptop, Monitor, RefreshCw, ShieldAlert, Smartphone } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { useSendTransfer } from "@/features/send/context";
import { useDevices } from "@/features/devices/context";

const platformIcons: Record<string, typeof Laptop> = {
    "Windows 11": Monitor,
    windows: Monitor,
    Windows: Monitor,
    Android: Smartphone,
    android: Smartphone,
    Linux: Laptop,
    linux: Laptop,
    macOS: Laptop,
    darwin: Laptop,
};

export function DeviceSelector() {
    const { state, selectDevice } = useSendTransfer();
    const { state: devicesState, refreshDevices } = useDevices();
    const devices = devicesState.devices;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Available Devices</CardTitle>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshDevices()}
                    disabled={devicesState.isDiscovering}
                >
                    <RefreshCw className={cn("mr-2 size-4", devicesState.isDiscovering && "animate-spin")} />
                    {devicesState.isDiscovering ? "Discovering..." : "Refresh"}
                </Button>
            </CardHeader>

            <CardContent className="space-y-3">
                {devices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                        <Laptop className="mb-3 size-10 text-muted-foreground opacity-60" />
                        <p className="font-medium text-foreground">No devices found on local network</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Ensure both machines are connected to the same Wi-Fi and FluxTransfer is running.
                        </p>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4"
                            onClick={() => refreshDevices()}
                        >
                            Scan Network
                        </Button>
                    </div>
                ) : (
                    devices.map((device) => {
                        const Icon =
                            platformIcons[device.platform] ?? Laptop;

                        const isSelected =
                            state.selectedDevice?.id === device.id;

                        const isPaired =
                            device.pairingStatus === "paired" || device.trust === "trusted";

                        return (
                            <div
                                key={device.id}
                                className={cn(
                                    "flex flex-col gap-2 rounded-lg border p-4 transition-all",
                                    isSelected
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "hover:border-border hover:bg-muted/50"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectDevice({
                                                id: device.id,
                                                name: device.name,
                                                platform: device.platform,
                                                status: device.status,
                                                hostname: device.hostname,
                                                ipAddress: device.network?.ipAddress,
                                                isTrusted: isPaired,
                                                pairingStatus: device.pairingStatus,
                                            })
                                        }
                                        className="flex flex-1 items-center gap-4 text-left"
                                    >
                                        <div className="rounded-lg bg-muted p-3">
                                            <Icon className="size-6 text-foreground" />
                                        </div>

                                        <div>
                                            <p className="font-medium text-foreground">
                                                {device.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {device.hostname || device.network?.ipAddress || device.platform}
                                            </p>
                                        </div>
                                    </button>

                                    <div className="flex items-center gap-2">
                                        {/* Status badge */}
                                        <span
                                            className={cn(
                                                "rounded-full px-2 py-0.5 text-xs font-medium",
                                                device.status === "online"
                                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {device.status === "online" ? "Online" : "Offline"}
                                        </span>

                                        {/* Pairing badge */}
                                        {isPaired ? (
                                            <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                <CheckCircle2 className="size-3" />
                                                Paired
                                            </span>
                                        ) : device.pairingStatus === "pending" ? (
                                            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                                Pairing Pending
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                                <ShieldAlert className="size-3" />
                                                Unpaired
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {!isPaired && (
                                    <div className="flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
                                        <span>Device must be paired before transferring files.</span>
                                        <Link
                                            href="/devices"
                                            className="font-medium text-primary hover:underline"
                                        >
                                            Go to Pairing &rarr;
                                        </Link>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </CardContent>
        </Card>
    );
}