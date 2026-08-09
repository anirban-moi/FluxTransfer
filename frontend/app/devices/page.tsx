"use client";

import { PageHeader, PageSection } from "@/components/page";

import {
    DeviceDetails,
    DeviceList,
    DeviceToolbar,
    EmptyDevices,
} from "@/components/devices";

import {
    DevicesProvider,
    useDevices,
} from "@/features/devices/context";

function DevicesWorkflow() {
    const {
        state,
        visibleDevices,
        selectDevice,
        updateSearch,
        toggleOnlineOnly,
        refreshDevices,
        pairDevice,
    } = useDevices();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Devices"
                description="Manage and monitor devices available for file transfers."
            />

            <PageSection
                title="Available Devices"
                description="Discover and manage devices on your local network."
            >
                <DeviceToolbar
                    search={state.search}
                    showOnlineOnly={state.showOnlineOnly}
                    isRefreshing={state.isDiscovering}
                    onSearchChange={updateSearch}
                    onToggleOnlineOnly={toggleOnlineOnly}
                    onRefresh={refreshDevices}
                />

                <div className="mt-6">
                    {visibleDevices.length === 0 ? (
                        <EmptyDevices
                            onRefresh={refreshDevices}
                        />
                    ) : (
                        <DeviceList
                            devices={visibleDevices}
                            selectedDeviceId={
                                state.selectedDevice?.id
                            }
                            onSelect={selectDevice}
                            onPair={pairDevice}
                        />
                    )}
                </div>
            </PageSection>

            <PageSection
                title="Device Details"
                description="View detailed information about the selected device."
            >
                <DeviceDetails
                    device={state.selectedDevice}
                />
            </PageSection>
        </div>
    );
}

export default function DevicesPage() {
    return (
        <DevicesProvider>
            <DevicesWorkflow />
        </DevicesProvider>
    );
}