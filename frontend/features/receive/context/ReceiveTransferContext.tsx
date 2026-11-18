"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";

import type {
    IncomingTransfer,
    ReceiveOptions,
    ReceiveProgress,
    ReceiveTransferState,
} from "../types/transfer";
import {
    getPendingTransfers,
    getTransfers,
    acceptTransfer as acceptTransferApi,
    rejectTransfer as rejectTransferApi,
    cancelTransfer as cancelTransferApi,
} from "@/lib/api";

type ReceiveTransferContextType = {
    state: ReceiveTransferState;

    acceptTransfer: (transfer: IncomingTransfer) => void;

    rejectTransfer: () => Promise<void>;

    updateOptions: (
        options: Partial<ReceiveOptions>
    ) => void;

    updateProgress: (
        progress: Partial<ReceiveProgress>
    ) => void;

    startReceive: () => Promise<void>;

    pauseReceive: () => void;

    resumeReceive: () => void;

    cancelReceive: () => Promise<void>;

    completeReceive: () => void;

    resetReceive: () => void;
};

const defaultOptions: ReceiveOptions = {
    saveLocation: "./downloads",
    conflictResolution: "ask",
    verifyIntegrity: false,
    preserveTimestamps: true,
    openFolderWhenComplete: false,
};

const initialState: ReceiveTransferState = {
    options: defaultOptions,
    showSummary: false,
    progress: {
        status: "waiting",
        percentage: 0,
        receivedBytes: 0,
        totalBytes: 0,
        speed: 0,
        remainingSeconds: 0,
        currentFile: "",
    },
};

const ReceiveTransferContext =
    createContext<ReceiveTransferContextType | null>(
        null
    );

export function ReceiveTransferProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [state, setState] =
        useState<ReceiveTransferState>(initialState);

    const activeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const activeTransferIdRef = useRef<string | null>(null);

    // Poll for pending transfer requests every 1.5s when waiting
    useEffect(() => {
        let isMounted = true;

        const pollPending = async () => {
            if (state.progress.status !== "waiting" && state.progress.status !== "pending") {
                return;
            }

            try {
                const pendingList = await getPendingTransfers();
                if (!isMounted) return;

                if (pendingList && pendingList.length > 0) {
                    const req = pendingList[0];
                    activeTransferIdRef.current = req.transferId;
                    setState((prev) => ({
                        ...prev,
                        incomingTransfer: {
                            id: req.transferId,
                            senderName: req.senderName,
                            senderPlatform: "FluxTransfer Peer",
                            transferName: req.fileName,
                            totalFiles: req.totalFiles || 1,
                            totalSize: req.fileSize,
                            senderId: req.senderId,
                            checksum: req.checksum,
                        },
                        progress: {
                            ...prev.progress,
                            totalBytes: req.fileSize,
                            currentFile: req.fileName,
                        },
                    }));
                } else if (state.progress.status === "waiting" && state.incomingTransfer) {
                    setState((prev) => ({
                        ...prev,
                        incomingTransfer: undefined,
                    }));
                }
            } catch (err) {
                console.error("Failed to check pending transfers", err);
            }
        };

        pollPending();
        const interval = setInterval(pollPending, 1500);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [state.progress.status, state.incomingTransfer]);

    // Cleanup active transfer timer
    useEffect(() => {
        return () => {
            if (activeTimerRef.current) {
                clearInterval(activeTimerRef.current);
            }
        };
    }, []);

    function acceptTransfer(transfer: IncomingTransfer) {
        activeTransferIdRef.current = transfer.id;
        setState((prev) => ({
            ...prev,
            incomingTransfer: transfer,
            progress: {
                ...prev.progress,
                status: "pending",
                totalBytes: transfer.totalSize,
                currentFile: transfer.transferName,
            },
        }));
    }

    async function rejectTransfer() {
        const transferId = state.incomingTransfer?.id || activeTransferIdRef.current;
        if (transferId) {
            try {
                await rejectTransferApi(transferId, "Rejected by user");
            } catch (err) {
                console.error("Failed to reject transfer", err);
            }
        }

        activeTransferIdRef.current = null;
        setState((prev) => ({
            ...prev,
            incomingTransfer: undefined,
            progress: {
                ...prev.progress,
                status: "waiting",
                percentage: 0,
                receivedBytes: 0,
            },
        }));
    }

    function updateOptions(options: Partial<ReceiveOptions>) {
        setState((prev) => ({
            ...prev,
            options: {
                ...prev.options,
                ...options,
            },
        }));
    }

    function updateProgress(progress: Partial<ReceiveProgress>) {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                ...progress,
            },
        }));
    }

    async function startReceive() {
        const transferId = state.incomingTransfer?.id || activeTransferIdRef.current;
        if (!transferId) {
            return;
        }

        if (activeTimerRef.current) {
            clearInterval(activeTimerRef.current);
            activeTimerRef.current = null;
        }

        setState((prev) => ({
            ...prev,
            showSummary: false,
            progress: {
                ...prev.progress,
                status: "receiving",
                percentage: 0,
                receivedBytes: 0,
                speed: 0,
                remainingSeconds: 0,
                error: undefined,
            },
        }));

        try {
            await acceptTransferApi(transferId, state.options.saveLocation);

            // Start polling active transfer progress
            activeTimerRef.current = setInterval(async () => {
                try {
                    const transfers = await getTransfers();
                    const active = transfers.find((t) => t.transferId === transferId);

                    if (!active) {
                        return;
                    }

                    if (active.status === "completed") {
                        if (activeTimerRef.current) {
                            clearInterval(activeTimerRef.current);
                            activeTimerRef.current = null;
                        }
                        setState((prev) => ({
                            ...prev,
                            showSummary: true,
                            progress: {
                                ...prev.progress,
                                status: "completed",
                                percentage: 100,
                                receivedBytes: active.fileSize,
                                remainingSeconds: 0,
                                speed: 0,
                            },
                        }));
                    } else if (active.status === "failed") {
                        if (activeTimerRef.current) {
                            clearInterval(activeTimerRef.current);
                            activeTimerRef.current = null;
                        }
                        setState((prev) => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                status: "failed",
                                error: active.error || "Receive transfer failed",
                            },
                        }));
                    } else if (active.status === "cancelled") {
                        if (activeTimerRef.current) {
                            clearInterval(activeTimerRef.current);
                            activeTimerRef.current = null;
                        }
                        setState((prev) => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                status: "cancelled",
                            },
                        }));
                    } else {
                        setState((prev) => ({
                            ...prev,
                            progress: {
                                ...prev.progress,
                                status: "receiving",
                                percentage: active.percentage,
                                receivedBytes: active.transferredBytes,
                                totalBytes: active.fileSize,
                                speed: active.speed,
                                remainingSeconds: active.remainingSeconds,
                                currentFile: active.fileName,
                            },
                        }));
                    }
                } catch (pollErr) {
                    console.error("Failed to poll receive progress", pollErr);
                }
            }, 500);
        } catch (err: any) {
            setState((prev) => ({
                ...prev,
                progress: {
                    ...prev.progress,
                    status: "failed",
                    error: err?.message || "Failed to accept transfer",
                },
            }));
        }
    }

    function pauseReceive() {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                status: "paused",
            },
        }));
    }

    function resumeReceive() {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                status: "receiving",
            },
        }));
    }

    async function cancelReceive() {
        if (activeTimerRef.current) {
            clearInterval(activeTimerRef.current);
            activeTimerRef.current = null;
        }

        const transferId = state.incomingTransfer?.id || activeTransferIdRef.current;
        if (transferId) {
            try {
                await cancelTransferApi(transferId);
            } catch (err) {
                console.error("Failed to cancel receive transfer", err);
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

    function completeReceive() {
        if (activeTimerRef.current) {
            clearInterval(activeTimerRef.current);
            activeTimerRef.current = null;
        }

        setState((prev) => ({
            ...prev,
            showSummary: true,
            progress: {
                ...prev.progress,
                status: "completed",
                percentage: 100,
                receivedBytes: prev.progress.totalBytes,
                remainingSeconds: 0,
                speed: 0,
            },
        }));
    }

    function resetReceive() {
        if (activeTimerRef.current) {
            clearInterval(activeTimerRef.current);
            activeTimerRef.current = null;
        }
        activeTransferIdRef.current = null;
        setState(initialState);
    }

    const value = useMemo(
        () => ({
            state,
            acceptTransfer,
            rejectTransfer,
            updateOptions,
            updateProgress,
            startReceive,
            pauseReceive,
            resumeReceive,
            cancelReceive,
            completeReceive,
            resetReceive,
        }),
        [state]
    );

    return (
        <ReceiveTransferContext.Provider value={value}>
            {children}
        </ReceiveTransferContext.Provider>
    );
}

export function useReceiveTransfer() {
    const context = useContext(
        ReceiveTransferContext
    );

    if (!context) {
        throw new Error(
            "useReceiveTransfer must be used within ReceiveTransferProvider."
        );
    }

    return context;
}