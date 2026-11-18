"use client";

import { PageHeader, PageSection } from "@/components/page";

import {
    DeviceDetails,
    DeviceList,
    DeviceToolbar,
    EmptyDevices,
} from "@/components/devices";

import { IncomingPairDialog } from "@/components/pairing";

import {
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
        unpairDevice,
        acceptRequest,
        rejectRequest,
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
                            onUnpair={unpairDevice}
                        />
                    )}
                </div>
            </PageSection>

            {/* Incoming Pair Request */}
            {state.pendingPairRequests.length > 0 && (
                <IncomingPairDialog
                    request={state.pendingPairRequests[0]}
                    onAccept={() =>
                        acceptRequest(
                            state.pendingPairRequests[0].deviceId
                        )
                    }
                    onReject={() =>
                        rejectRequest(
                            state.pendingPairRequests[0].deviceId
                        )
                    }
                />
            )}

            <PageSection
                title="Device Details"
                description="View detailed information about the selected device."
            >
                <DeviceDetails
                    device={state.selectedDevice}
                    onPair={pairDevice}
                    onUnpair={unpairDevice}
                />
            </PageSection>
        </div>
    );
}

export default function DevicesPage() {
    return <DevicesWorkflow />;
}