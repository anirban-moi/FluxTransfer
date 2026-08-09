"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

// import { mockDevices } from "../constants/devices";
import {
    getDevices, getPendingPairRequests, pairDevice as pairDeviceApi, PendingPairRequest, acceptPairRequest,
    rejectPairRequest,
} from "@/lib/api";
import type { Device } from "../types/device";

type DevicesState = {
    devices: Device[];
    selectedDevice?: Device;
    search: string;
    showOnlineOnly: boolean;
    isDiscovering: boolean;
    pendingPairRequests: PendingPairRequest[];
};

type DevicesContextType = {
    state: DevicesState;
    visibleDevices: Device[];
    selectDevice: (device: Device) => void;
    updateSearch: (search: string) => void;
    toggleOnlineOnly: () => void;
    refreshDevices: () => Promise<void>;
    discoverDevices: () => void;
    pairDevice: (device: Device) => Promise<void>;
    acceptRequest: (deviceID: string) => void;
    rejectRequest: (deviceID: string) => void;
    // pendingPairRequests: PendingPairRequest[];
};

const initialState: DevicesState = {
    devices: [],
    selectedDevice: undefined,
    search: "",
    showOnlineOnly: false,
    isDiscovering: false,
    pendingPairRequests: [],
};

const DevicesContext = createContext<DevicesContextType | null>(null);

export function DevicesProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [state, setState] = useState<DevicesState>(initialState);
    useEffect(() => {
        fetchDevices();
        fetchPendingPairRequests();

        const interval = setInterval(() => {
            fetchPendingPairRequests();
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    async function fetchPendingPairRequests() {

        try {

            const requests =
                await getPendingPairRequests();

            setState(prev => ({
                ...prev,
                pendingPairRequests: requests,
            }));

        } catch (error) {

            console.error(error);

        }

    }

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

    async function acceptRequest(
        deviceID: string,
    ) {

        await acceptPairRequest(deviceID);

        await fetchPendingPairRequests();

    }

    async function rejectRequest(
        deviceID: string,
    ) {

        await rejectPairRequest(deviceID);

        await fetchPendingPairRequests();

    }

    async function fetchDevices() {
        try {
            const devices = await getDevices();
            setState((prev) => ({
                ...prev,
                devices,
                selectedDevice:
                    devices.length > 0
                        ? devices[0]
                        : undefined,
            }));
        } catch (error) {
            console.error(
                "Failed to load devices",
                error,
            );
        }
    }

    async function refreshDevices() {
        setState((prev) => ({
            ...prev,
            isDiscovering: true,
        }));

        try {
            await fetchDevices();
        } finally {
            setState((prev) => ({
                ...prev,
                isDiscovering: false,
            }));
        }

    }

    function discoverDevices() {
        // TODO:
        // UDP discovery.
        console.log("Discovering devices...");
    }

    async function pairDevice(
        device: Device,
    ) {

        try {

            await pairDeviceApi(
                device.id,
            );

            console.log(
                "Pair request sent:",
                device.name,
            );

        } catch (error) {

            console.error(
                "Failed to pair device",
                error,
            );

        }

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
            pairDevice,
            acceptRequest,
            rejectRequest,
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