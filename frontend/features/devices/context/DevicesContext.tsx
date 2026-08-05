"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { mockDevices } from "../constants/devices";
import type { Device } from "../types/device";

type DevicesState = {
    devices: Device[];
    selectedDevice?: Device;
    search: string;
    showOnlineOnly: boolean;
    isDiscovering: boolean;
};

type DevicesContextType = {
    state: DevicesState;
    visibleDevices: Device[];
    selectDevice: (device: Device) => void;
    updateSearch: (search: string) => void;
    toggleOnlineOnly: () => void;
    refreshDevices: () => Promise<void>;
    discoverDevices: () => void;
};

const initialState: DevicesState = {
    devices: mockDevices,
    selectedDevice: mockDevices[0],
    search: "",
    showOnlineOnly: false,
    isDiscovering: false,
};

const DevicesContext = createContext<DevicesContextType | null>(null);

export function DevicesProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [state, setState] =
        useState(initialState);

    function selectDevice(device: Device) {
        setState((prev) => ({
            ...prev,
            selectedDevice: device,
        }));
    }

    function updateSearch(search: string) {
        setState((prev) => ({
            ...prev,
            search,
        }));
    }

    function toggleOnlineOnly() {
        setState((prev) => ({
            ...prev,
            showOnlineOnly:
                !prev.showOnlineOnly,
        }));
    }

    async function refreshDevices() {
        setState((prev) => ({
            ...prev,
            isDiscovering: true,
        }));

        await new Promise((resolve) =>
            setTimeout(resolve, 2000)
        );

        setState((prev) => {
            const updatedDevices = prev.devices.map((device) => {
                if (device.id === "device-3") {
                    return {
                        ...device,
                        status:
                            device.status === "offline"
                                ? "online"
                                : "offline",
                        lastSeen: new Date(),
                    };
                }

                return device;
            });

            return {
                ...prev,
                devices: updatedDevices,
                isDiscovering: false,
            };
        });
    }

    function discoverDevices() {
        // TODO:
        // UDP discovery.
        console.log("Discovering devices...");
    }

    const visibleDevices = useMemo(() => {
        return state.devices.filter((device) => {
            const matchesSearch =
                state.search.trim() === "" ||
                device.name
                    .toLowerCase()
                    .includes(state.search.toLowerCase()) ||
                device.hostname
                    .toLowerCase()
                    .includes(state.search.toLowerCase());

            const matchesOnline =
                !state.showOnlineOnly ||
                device.status === "online";

            return matchesSearch && matchesOnline;
        });
    }, [
        state.devices,
        state.search,
        state.showOnlineOnly,
    ]);



    const value = useMemo(
        () => ({
            state,
            visibleDevices,
            selectDevice,
            updateSearch,
            toggleOnlineOnly,
            refreshDevices,
            discoverDevices,
        }),
        [state]
    );

    return (
        <DevicesContext.Provider value={value}>
            {children}
        </DevicesContext.Provider>
    );
}

export function useDevices() {
    const context = useContext(DevicesContext);

    if (!context) {
        throw new Error(
            "useDevices must be used within DevicesProvider."
        );
    }

    return context;
}