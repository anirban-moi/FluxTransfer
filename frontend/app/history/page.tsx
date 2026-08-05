"use client";

import {
    EmptyHistory,
    HistoryDetails,
    HistoryList,
    HistoryToolbar,
} from "@/components/history";

import {
    PageHeader,
    PageSection,
} from "@/components/page";

import {
    HistoryProvider,
    useHistory,
} from "@/features/history/context";

function HistoryWorkflow() {
    const {
        state,
        visibleTransfers,
        selectTransfer,
        updateSearch,
        updateDirection,
        updateStatus,
        clearFilters,
        refreshHistory,
    } = useHistory();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Transfer History"
                description="Review previous send and receive operations."
            />

            <PageSection
                title="History"
                description="Browse previous transfers."
            >
                <HistoryToolbar
                    search={state.search}
                    direction={state.direction}
                    status={state.status}
                    onSearchChange={
                        updateSearch
                    }
                    onDirectionChange={
                        updateDirection
                    }
                    onStatusChange={
                        updateStatus
                    }
                    onClearFilters={
                        clearFilters
                    }
                />

                <div className="mt-6">
                    {visibleTransfers.length ===
                        0 ? (
                        <EmptyHistory
                            onRefresh={
                                refreshHistory
                            }
                        />
                    ) : (
                        <HistoryList
                            transfers={
                                visibleTransfers
                            }
                            selectedTransferId={
                                state
                                    .selectedTransfer?.id
                            }
                            onSelect={
                                selectTransfer
                            }
                        />
                    )}
                </div>
            </PageSection>

            <PageSection
                title="Transfer Details"
                description="View details about the selected transfer."
            >
                <HistoryDetails
                    transfer={
                        state.selectedTransfer
                    }
                />
            </PageSection>
        </div>
    );
}

export default function HistoryPage() {
    return (
        <HistoryProvider>
            <HistoryWorkflow />
        </HistoryProvider>
    );
}