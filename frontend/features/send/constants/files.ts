import type { TransferItem } from "../types/transfer";

export const mockTransferItems: TransferItem[] = [
    {
        id: "1",
        name: "Presentation.pptx",
        path: "D:/Documents/Presentation.pptx",
        size: 3_145_728,
        type: "file",
    },
    {
        id: "2",
        name: "Project Source",
        path: "D:/Projects/Source",
        size: 524_288_000,
        type: "directory",
    },
];