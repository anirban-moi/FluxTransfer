export type DeviceStatus =
    | "online"
    | "offline"
    | "connecting";

export type DevicePlatform =
    | "windows"
    | "linux"
    | "macos"
    | "android"
    | "ios";

export type DeviceTrust =
    | "trusted"
    | "untrusted"
    | "pending";

export type TransferState =
    | "idle"
    | "sending"
    | "receiving";

export interface DeviceNetwork {
    ipAddress: string;
    port: number;
    protocol: "tcp";
}

export interface DeviceCapabilities {
    compression: boolean;
    encryption: boolean;
    resumeTransfer: boolean;
    version: string;
}

export interface Device {
    id: string;
    name: string;
    hostname: string;
    platform: DevicePlatform;
    status: DeviceStatus;
    trust: DeviceTrust;
    transferState: TransferState;
    lastSeen?: Date;
    fingerprint: string;
    network: DeviceNetwork;
    capabilities: DeviceCapabilities;
}