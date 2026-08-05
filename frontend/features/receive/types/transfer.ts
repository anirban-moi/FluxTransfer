export type ReceiveStatus =
    | "waiting"
    | "pending"
    | "receiving"
    | "paused"
    | "completed"
    | "rejected"
    | "cancelled"
    | "failed";

export type ConflictResolution =
    | "ask"
    | "overwrite"
    | "skip";

export interface IncomingTransfer {
    id: string;
    senderName: string;
    senderPlatform: string;
    transferName: string;
    totalFiles: number;
    totalSize: number;
}

export interface ReceiveOptions {
    saveLocation: string;
    conflictResolution: ConflictResolution;
    verifyIntegrity: boolean;
    preserveTimestamps: boolean;
    openFolderWhenComplete: boolean;
}

export interface ReceiveProgress {
    status: ReceiveStatus;
    percentage: number;
    receivedBytes: number;
    totalBytes: number;
    speed: number;
    remainingSeconds: number;
    currentFile: string;
}

export interface ReceiveTransferState {
    incomingTransfer?: IncomingTransfer;
    options: ReceiveOptions;
    progress: ReceiveProgress;
    showSummary: boolean;
}