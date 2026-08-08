import { apiClient } from "./client";

import type {
    Device,
    DevicePlatform,
    DeviceStatus,
} from "@/features/devices/types/device";

type DeviceResponse = {
    id: string;
    name: string;
    hostname: string;
    platform: string;
    ipAddress: string;
    port: number;
    version: string;
    status: string;
    lastSeen: string;
};

function mapDevice(
    device: DeviceResponse,
): Device {

    return {
        id: device.id,
        name: device.name,
        hostname: device.hostname,
        platform: device.platform as DevicePlatform,
        status: device.status as DeviceStatus,
        lastSeen: device.lastSeen
            ? new Date(device.lastSeen)
            : undefined,
        trust: "trusted",
        transferState: "idle",
        fingerprint: "",
        network: {
            ipAddress: device.ipAddress,
            port: device.port,
            protocol: "tcp",
        },
        capabilities: {
            compression: false,
            encryption: false,
            resumeTransfer: false,
            version: device.version,
        },
    };
}

export async function getDevices(): Promise<Device[]> {

    const devices =
        await apiClient.get<DeviceResponse[]>(
            "/api/devices",
        );
    return devices.map(mapDevice);
}

export async function getLocalDevice(): Promise<Device> {

    const device =
        await apiClient.get<DeviceResponse>(
            "/api/device",
        );

    return mapDevice(device);
}