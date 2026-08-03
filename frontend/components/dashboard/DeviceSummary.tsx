"use client";

import {
    Laptop,
    Smartphone,
    Wifi,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const devices = [
    {
        title: "Desktop",
        status: "Online",
        icon: Laptop,
    },
    {
        title: "Mobile",
        status: "Offline",
        icon: Smartphone,
    },
];

export function DeviceSummary() {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">
                    Device Summary
                </h2>

                <p className="text-sm text-muted-foreground">
                    Connected devices available for file transfer.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wifi className="size-5" />
                        Connected Devices
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {devices.map((device) => {
                        const Icon = device.icon;

                        return (
                            <div
                                key={device.title}
                                className="flex items-center justify-between rounded-lg border p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className="size-5 text-muted-foreground" />

                                    <span className="font-medium">
                                        {device.title}
                                    </span>
                                </div>

                                <span
                                    className={
                                        device.status === "Online"
                                            ? "text-green-600 dark:text-green-400"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {device.status}
                                </span>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </section>
    );
}