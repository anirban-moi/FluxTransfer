export type DeviceStatus =
    | "online"
    | "offline";

export interface Device {
    id: string;
    name: string;
    platform: string;
    status: DeviceStatus;
}

export interface TransferItem {
    id: string;
    name: string;
    path: string;
    size: number;
    type: "file" | "directory";
}

export type TransferMode =
    | "normal"
    | "compressed"
    | "encrypted";

export interface TransferOptions {
    transferMode: TransferMode;
    verifyIntegrity: boolean;
    overwriteExisting: boolean;
    preserveFolderStructure: boolean;
    destinationPath: string;
}

export type TransferStatus =
    | "idle"
    | "running"
    | "paused"
    | "completed"
    | "cancelled"
    | "failed";

export interface TransferProgress {
    status: TransferStatus;
    percentage: number;
    transferredBytes: number;
    totalBytes: number;
    speed: number;
    remainingSeconds: number;
    currentFile?: string;
}

export interface SendTransferState {
    selectedDevice?: Device;
    selectedItems: TransferItem[];
    options: TransferOptions;
    progress: TransferProgress;
    showSummary: boolean;
}