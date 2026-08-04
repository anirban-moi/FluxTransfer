"use client";

import {
    createContext,
    useContext,
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

    startTransfer: () => void;

    pauseTransfer: () => void;

    resumeTransfer: () => void;

    cancelTransfer: () => void;

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
        setState(initialState);
    }

    function startTransfer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        const totalBytes = state.selectedItems.reduce(
            (total, item) => total + item.size,
            0
        );

        setState((prev) => ({
            ...prev,
            showSummary: false,
            progress: {
                status: "running",
                percentage: 0,
                transferredBytes: 0,
                totalBytes,
                speed: 85 * 1024 * 1024,
                remainingSeconds: 20,
                currentFile: prev.selectedItems[0]?.name ?? "",
            },
        }));

        timerRef.current = setInterval(() => {
            setState((prev) => {
                if (prev.progress.status !== "running") {
                    return prev;
                }

                const nextPercentage = Math.min(
                    prev.progress.percentage + 5,
                    100
                );

                if (nextPercentage >= 100) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }

                    return {
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
                    };
                }

                return {
                    ...prev,
                    progress: {
                        ...prev.progress,
                        percentage: nextPercentage,
                        transferredBytes:
                            (prev.progress.totalBytes * nextPercentage) / 100,
                        remainingSeconds: Math.max(
                            0,
                            prev.progress.remainingSeconds - 1
                        ),
                    },
                };
            });
        }, 500);
    }

    function pauseTransfer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

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

        timerRef.current = setInterval(() => {
            setState((prev) => {
                if (prev.progress.status !== "running") {
                    return prev;
                }

                const nextPercentage = Math.min(
                    prev.progress.percentage + 5,
                    100
                );

                if (nextPercentage >= 100) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }

                    return {
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
                    };
                }

                return {
                    ...prev,
                    progress: {
                        ...prev.progress,
                        percentage: nextPercentage,
                        transferredBytes:
                            (prev.progress.totalBytes * nextPercentage) / 100,
                        remainingSeconds: Math.max(
                            0,
                            prev.progress.remainingSeconds - 1
                        ),
                    },
                };
            });
        }, 500);
    }

    function cancelTransfer() {
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

    const value = useMemo(() => ({
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