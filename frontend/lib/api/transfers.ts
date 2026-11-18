import { apiClient } from "./client";

export type TransferStatus =
    | "created"
    | "pending"
    | "preparing"
    | "running"
    | "paused"
    | "verifying"
    | "completed"
    | "failed"
    | "cancelled";

export type TransferDirection = "outgoing" | "incoming";

export interface TransferProgressResponse {
    transferId: string;
    status: TransferStatus;
    direction: TransferDirection;
    fileName: string;
    fileSize: number;
    transferredBytes: number;
    percentage: number;
    speed: number;
    remainingSeconds: number;
    remoteDeviceId: string;
    remoteDeviceName: string;
    createdAt: string;
    updatedAt: string;
    error?: string;
}

export interface PendingTransferRequest {
    transferId: string;
    senderId: string;
    senderName: string;
    targetId: string;
    fileName: string;
    fileSize: number;
    totalFiles: number;
    checksum: string;
    port: number;
}

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080";

export async function sendFileTransfer(
    targetDeviceId: string,
    file: File,
): Promise<TransferProgressResponse> {
    const formData = new FormData();
    formData.append("targetDeviceId", targetDeviceId);
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/api/transfers/send`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to initiate file transfer");
    }

    return response.json();
}

export async function getTransfers(): Promise<TransferProgressResponse[]> {
    return apiClient.get<TransferProgressResponse[]>("/api/transfers");
}

export async function getPendingTransfers(): Promise<PendingTransferRequest[]> {
    return apiClient.get<PendingTransferRequest[]>("/api/transfers/pending");
}

export async function acceptTransfer(
    transferId: string,
    saveDir?: string,
): Promise<void> {
    return apiClient.post("/api/transfers/accept", {
        transferId,
        saveDir: saveDir || "",
    });
}

export async function rejectTransfer(
    transferId: string,
    reason?: string,
): Promise<void> {
    return apiClient.post("/api/transfers/reject", {
        transferId,
        reason: reason || "Rejected by user",
    });
}

export async function cancelTransfer(
    transferId: string,
): Promise<void> {
    return apiClient.post("/api/transfers/cancel", {
        transferId,
    });
}
