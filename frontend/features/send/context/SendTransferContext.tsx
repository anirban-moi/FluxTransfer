"use client";

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import type {
    Device,
    SendTransferState,
    TransferItem,
    TransferOptions,
    TransferProgress,
} from "../types/transfer";
import {
    sendFileTransfer,
    getTransfers,
    cancelTransfer as cancelTransferApi,
} from "@/lib/api";

type SendTransferContextType = {
    state: SendTransferState;

    selectDevice: (device: Device) => void;

    addItems: (items: TransferItem[]) => void;

    removeItem: (id: string) => void;

    clearItems: () => void;

    updateOptions: (
        options: Partial<TransferOptions>
    ) => void;

    updateProgress: (
        progress: Partial<TransferProgress>
    ) => void;

    resetTransfer: () => void;

    startTransfer: () => Promise<void>;

    pauseTransfer: () => void;

    resumeTransfer: () => void;

    cancelTransfer: () => Promise<void>;

    completeTransfer: () => void;
};

const defaultOptions: TransferOptions = {
    transferMode: "normal",
    verifyIntegrity: false,
    overwriteExisting: false,
    preserveFolderStructure: true,
    destinationPath: "",
};

const initialState: SendTransferState = {
    selectedItems: [],
    options: defaultOptions,
    progress: {
        status: "idle",
        percentage: 0,
        transferredBytes: 0,
        totalBytes: 0,
        speed: 0,
        remainingSeconds: 0,
        currentFile: "",
    },
    showSummary: false,
};

const SendTransferContext =
    createContext<SendTransferContextType | null>(null);

export function SendTransferProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [state, setState] = useState<SendTransferState>(initialState);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const activeTransferIdRef = useRef<string | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    function selectDevice(device: Device) {
        setState((prev) => ({
            ...prev,
            selectedDevice: device,
        }));
    }

    function addItems(items: TransferItem[]) {
        setState((prev) => {
            const existingIds = new Set(
                prev.selectedItems.map((item) => item.id)
            );

            const uniqueItems = items.filter(
                (item) => !existingIds.has(item.id)
            );

            return {
                ...prev,
                selectedItems: [
                    ...prev.selectedItems,
                    ...uniqueItems,
                ],
            };
        });
    }

    function removeItem(id: string) {
        setState((prev) => ({
            ...prev,
            selectedItems: prev.selectedItems.filter(
                (item) => item.id !== id
            ),
        }));
    }

    function clearItems() {
        setState((prev) => ({
            ...prev,
            selectedItems: [],
        }));
    }

    function updateOptions(
        options: Partial<TransferOptions>
    ) {
        setState((prev) => ({
            ...prev,
            options: {
                ...prev.options,
                ...options,
            },
        }));
    }

    function updateProgress(
        progress: Partial<TransferProgress>
    ) {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                ...progress,
            },
        }));
    }

    function resetTransfer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        activeTransferIdRef.current = null;
        setState(initialState);
    }

    async function startTransfer() {
        if (!state.selectedDevice) {
            return;
        }

        const firstItem = state.selectedItems[0];
        if (!firstItem || !firstItem.file) {
            console.error("No valid file selected for transfer");
            return;
        }

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        setState((prev) => ({
            ...prev,
            showSummary: false,
            progress: {
                status: "running",
                percentage: 0,
                transferredBytes: 0,
                totalBytes: firstItem.size,
                speed: 0,
                remainingSeconds: 0,
                currentFile: firstItem.name,
                error: undefined,
            },
        }));

        try {
            const resp = await sendFileTransfer(
                state.selectedDevice.id,
                firstItem.file
            );
            activeTransferIdRef.current = resp.transferId;

            // Poll the backend transfer progress every 500ms
            timerRef.current = setInterval(async () => {
                try {
                    const transfers = await getTransfers();
                    const active = transfers.find(
                        (t) => t.transferId === activeTransferIdRef.current
                    );

                    if (!active) {
                        return;
                    }

                    if (active.status === "completed") {
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        setState((prev) => ({
                            ...prev,
                            showSummary: true,
                            progress: {
                                ...prev.progress,
                                status: "completed",
                                percentage: 100,
                                transferredBytes: active.fileSize,
                                remainingSeconds: 0,
                                speed: 0,
                            },
                        }));
                    } else if (active.status === "failed") {
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        setState((prev) => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                status: "failed",
                                error: active.error || "Transfer failed",
                            },
                        }));
                    } else if (active.status === "cancelled") {
                        if (timerRef.current) {
                            clearInterval(timerRef.current);
                            timerRef.current = null;
                        }
                        setState((prev) => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                status: "cancelled",
                            },
                        }));
                    } else {
                        // running, verifying, etc.
                        setState((prev) => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                status: "running",
                                percentage: active.percentage,
                                transferredBytes: active.transferredBytes,
                                totalBytes: active.fileSize,
                                speed: active.speed,
                                remainingSeconds: active.remainingSeconds,
                                currentFile: active.fileName,
                            },
                        }));
                    }
                } catch (pollErr) {
                    console.error("Failed to poll transfers", pollErr);
                }
            }, 500);
        } catch (err: any) {
            setState((prev) => ({
                ...prev,
                progress: {
                    ...prev.progress,
                    status: "failed",
                    error: err?.message || "Failed to initiate transfer",
                },
            }));
        }
    }

    function pauseTransfer() {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                status: "paused",
            },
        }));
    }

    function resumeTransfer() {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                status: "running",
            },
        }));
    }

    async function cancelTransfer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (activeTransferIdRef.current) {
            try {
                await cancelTransferApi(activeTransferIdRef.current);
            } catch (err) {
                console.error("Failed to cancel transfer", err);
            }
        }

        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                status: "cancelled",
            },
        }));
    }

    function completeTransfer() {
        setState((prev) => ({
            ...prev,
            showSummary: true,
            progress: {
                ...prev.progress,
                status: "completed",
                percentage: 100,
                transferredBytes: prev.progress.totalBytes,
                remainingSeconds: 0,
                speed: 0,
            },
        }));
    }

    const value = useMemo(
        () => ({
            state,
            selectDevice,
            addItems,
            removeItem,
            clearItems,
            updateOptions,
            updateProgress,
            startTransfer,
            pauseTransfer,
            resumeTransfer,
            cancelTransfer,
            completeTransfer,
            resetTransfer,
        }),
        [state]
    );

    return (
        <SendTransferContext.Provider value={value}>
            {children}
        </SendTransferContext.Provider>
    );
}

export function useSendTransfer() {
    const context = useContext(SendTransferContext);

    if (!context) {
        throw new Error(
            "useSendTransfer must be used within SendTransferProvider."
        );
    }

    return context;
}