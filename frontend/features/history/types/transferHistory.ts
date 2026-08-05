export type TransferDirection =
    | "send"
    | "receive";

export type TransferStatus =
    | "completed"
    | "failed"
    | "cancelled";

export interface TransferRecord {
    id: string;
    direction: TransferDirection;
    deviceName: string;
    devicePlatform:
    | "windows"
    | "linux"
    | "macos"
    | "android"
    | "ios";
    transferName: string;
    totalFiles: number;
    totalSize: number;
    durationSeconds: number;
    averageSpeed: number;
    status: TransferStatus;
    startedAt: Date;
    completedAt: Date;
}