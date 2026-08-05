"use client";

import {
    createContext,
    useContext,
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

type ReceiveTransferContextType = {
    state: ReceiveTransferState;

    acceptTransfer: (transfer: IncomingTransfer) => void;

    rejectTransfer: () => void;

    updateOptions: (
        options: Partial<ReceiveOptions>
    ) => void;

    updateProgress: (
        progress: Partial<ReceiveProgress>
    ) => void;

    startReceive: () => void;

    pauseReceive: () => void;

    resumeReceive: () => void;

    cancelReceive: () => void;

    completeReceive: () => void;

    resetReceive: () => void;
};

const defaultOptions: ReceiveOptions = {
    saveLocation: "D:\\Downloads\\FluxTransfer",
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

    const timerRef = useRef<NodeJS.Timeout | null>(
        null
    );

    function acceptTransfer(
        transfer: IncomingTransfer
    ) {
        setState((prev) => ({
            ...prev,
            incomingTransfer: transfer,
            progress: {
                ...prev.progress,
                status: "pending",
            },
        }));
    }

    function rejectTransfer() {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                status: "rejected",
            },
        }));
    }

    function updateOptions(
        options: Partial<ReceiveOptions>
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
        progress: Partial<ReceiveProgress>
    ) {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                ...progress,
            },
        }));
    }

    function startReceiveTimer() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setState((prev) => {
                if (prev.progress.status !== "receiving") {
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
                            receivedBytes: prev.progress.totalBytes,
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
                        receivedBytes:
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

    function startReceive() {
        if (!state.incomingTransfer) {
            return;
        }

        setState((prev) => ({
            ...prev,
            showSummary: false,
            progress: {
                status: "receiving",
                percentage: 0,
                receivedBytes: 0,
                totalBytes: prev.incomingTransfer?.totalSize ?? 0,
                speed: 82 * 1024 * 1024,
                remainingSeconds: 20,
                currentFile: "Preparing...",
            },
        }));

        startReceiveTimer();
    }

    function pauseReceive() {
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

    function resumeReceive() {
        setState((prev) => ({
            ...prev,
            progress: {
                ...prev.progress,
                status: "receiving",
            },
        }));

        startReceiveTimer();
    }

    function cancelReceive() {
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

    function completeReceive() {
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
                receivedBytes:
                    prev.progress.totalBytes,
                remainingSeconds: 0,
                speed: 0,
            },
        }));
    }

    function resetReceive() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

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