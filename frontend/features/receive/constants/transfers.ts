import type { IncomingTransfer } from "../types/transfer";

export const mockIncomingTransfer: IncomingTransfer = {
    id: "transfer-001",
    senderName: "Desktop-PC",
    senderPlatform: "Windows 11",
    transferName: "Project Backup",
    totalFiles: 12,
    totalSize: 2.6 * 1024 * 1024 * 1024,
};