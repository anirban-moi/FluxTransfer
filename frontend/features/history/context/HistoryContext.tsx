"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { mockTransferHistory } from "../constants/history";

import type {
    TransferDirection,
    TransferRecord,
    TransferStatus,
} from "../types/transferHistory";

type HistoryState = {
    transfers: TransferRecord[];

    selectedTransfer?: TransferRecord;

    search: string;

    direction?: TransferDirection;

    status?: TransferStatus;
};

type HistoryContextType = {
    state: HistoryState;

    visibleTransfers: TransferRecord[];

    selectTransfer: (
        transfer: TransferRecord
    ) => void;

    updateSearch: (
        search: string
    ) => void;

    updateDirection: (
        direction?: TransferDirection
    ) => void;

    updateStatus: (
        status?: TransferStatus
    ) => void;

    clearFilters: () => void;

    refreshHistory: () => void;
};

const HistoryContext =
    createContext<HistoryContextType | null>(
        null
    );

const initialState: HistoryState = {
    transfers: mockTransferHistory,

    selectedTransfer:
        mockTransferHistory[0],

    search: "",

    direction: undefined,

    status: undefined,
};

export function HistoryProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [state, setState] =
        useState(initialState);

    function selectTransfer(
        transfer: TransferRecord
    ) {
        setState((prev) => ({
            ...prev,
            selectedTransfer: transfer,
        }));
    }

    function updateSearch(
        search: string
    ) {
        setState((prev) => ({
            ...prev,
            search,
        }));
    }

    function updateDirection(
        direction?: TransferDirection
    ) {
        setState((prev) => ({
            ...prev,
            direction,
        }));
    }

    function updateStatus(
        status?: TransferStatus
    ) {
        setState((prev) => ({
            ...prev,
            status,
        }));
    }

    function clearFilters() {
        setState((prev) => ({
            ...prev,
            search: "",
            direction: undefined,
            status: undefined,
        }));
    }

    function refreshHistory() {
        console.log("Refreshing history...");
    }

    const visibleTransfers =
        useMemo(() => {
            return state.transfers.filter(
                (transfer) => {
                    const matchesSearch =
                        state.search === "" ||
                        transfer.transferName
                            .toLowerCase()
                            .includes(
                                state.search.toLowerCase()
                            ) ||
                        transfer.deviceName
                            .toLowerCase()
                            .includes(
                                state.search.toLowerCase()
                            );

                    const matchesDirection =
                        !state.direction ||
                        transfer.direction ===
                        state.direction;

                    const matchesStatus =
                        !state.status ||
                        transfer.status ===
                        state.status;

                    return (
                        matchesSearch &&
                        matchesDirection &&
                        matchesStatus
                    );
                }
            );
        }, [state]);

    const value = useMemo(
        () => ({
            state,

            visibleTransfers,

            selectTransfer,

            updateSearch,

            updateDirection,

            updateStatus,

            clearFilters,

            refreshHistory,
        }),
        [state, visibleTransfers]
    );

    return (
        <HistoryContext.Provider
            value={value}
        >
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistory() {
    const context =
        useContext(HistoryContext);

    if (!context) {
        throw new Error(
            "useHistory must be used within HistoryProvider."
        );
    }

    return context;
}