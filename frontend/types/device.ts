export type DeviceStatus =
    | "online"
    | "offline"
    | "busy";

export interface Device {
    id: string;
    name: string;
    hostname: string;
    platform: string;
    ipAddress: string;
    port: number;
    version: string;
    status: DeviceStatus;
    lastSeen: string;
    paired: boolean;
}