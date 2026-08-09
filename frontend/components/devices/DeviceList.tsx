"use client";

import { DeviceCard } from "./DeviceCard";

import type { Device } from "@/features/devices/types/device";

type DeviceListProps = {
    devices: Device[];

    selectedDeviceId?: string;

    onSelect?: (device: Device) => void;

    onPair?: (device: Device) => void;
};

export function DeviceList({
    devices,
    selectedDeviceId,
    onSelect,
    onPair
}: DeviceListProps) {
    if (devices.length === 0) {
        return (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                No devices found.
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {devices.map((device) => (
                <div
                    key={device.id}
                    className={
                        selectedDeviceId === device.id
                            ? "rounded-xl ring-2 ring-primary"
                            : ""
                    }
                >
                    <DeviceCard
                        device={device}
                        onClick={onSelect}
                        onPair={onPair}
                    />
                </div>
            ))}
        </div>
    );
}