"use client";

import {
    CheckCircle2,
    Globe,
    HardDrive,
    ShieldCheck,
    Wifi,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import type { Device } from "@/features/devices/types/device";

type DeviceDetailsProps = {
    device?: Device;
};

export function DeviceDetails({
    device,
}: DeviceDetailsProps) {
    if (!device) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Device Details</CardTitle>
                </CardHeader>

                <CardContent className="py-12 text-center text-muted-foreground">
                    Select a device to view its details.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{device.name}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* General */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Hostname
                        </p>

                        <p className="mt-1 font-medium">
                            {device.hostname}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Platform
                        </p>

                        <p className="mt-1 font-medium capitalize">
                            {device.platform}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Status
                        </p>

                        <p className="mt-1 font-medium capitalize">
                            {device.status}
                        </p>
                    </div>

                    <div className="rounded-lg border p-4">
                        <p className="text-sm text-muted-foreground">
                            Transfer State
                        </p>

                        <p className="mt-1 font-medium capitalize">
                            {device.transferState}
                        </p>
                    </div>
                </div>

                {/* Network */}
                <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <Globe className="size-4" />

                        <h3 className="font-semibold">
                            Network
                        </h3>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                IP Address
                            </p>

                            <p>{device.network.ipAddress}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Port
                            </p>

                            <p>{device.network.port}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Protocol
                            </p>

                            <p className="uppercase">
                                {device.network.protocol}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <ShieldCheck className="size-4" />

                        <h3 className="font-semibold">
                            Security
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span>Trust</span>

                            <span className="capitalize">
                                {device.trust}
                            </span>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                Fingerprint
                            </p>

                            <p className="break-all font-mono text-sm">
                                {device.fingerprint}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Capabilities */}
                <div className="rounded-lg border p-4">
                    <div className="mb-4 flex items-center gap-2">
                        <HardDrive className="size-4" />

                        <h3 className="font-semibold">
                            Capabilities
                        </h3>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span>Compression</span>

                            <CheckCircle2
                                className={
                                    device.capabilities.compression
                                        ? "text-green-600"
                                        : "text-muted-foreground"
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Encryption</span>

                            <CheckCircle2
                                className={
                                    device.capabilities.encryption
                                        ? "text-green-600"
                                        : "text-muted-foreground"
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Resume Transfer</span>

                            <CheckCircle2
                                className={
                                    device.capabilities.resumeTransfer
                                        ? "text-green-600"
                                        : "text-muted-foreground"
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span>Version</span>

                            <span>
                                {device.capabilities.version}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wifi className="size-4" />

                    <span suppressHydrationWarning>
                        Last Seen:{" "}
                        {device.lastSeen?.toLocaleString() ??
                            "Unknown"}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}