"use client";

import { PageHeader, PageSection } from "@/components/page";
import { IncomingTransferCard, ReceiveOptions, ReceiveProgress, ReceiveReview, ReceiveSummary, SaveLocationSelector } from "@/components/receive";
import { useReceiveTransfer } from "@/features/receive/context";

export default function ReceiveWorkflow() {

    const { state } = useReceiveTransfer();
    const status = state.progress.status;

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Receive Files"
                description="Accept and manage incoming file transfers."
            />

            <PageSection
                title="1. Incoming Transfer"
                description="Review the incoming transfer request."
            >
                <IncomingTransferCard />
            </PageSection>

            {status === "pending" && (
                <>
                    <PageSection
                        title="2. Save Location"
                        description="Choose where the received files will be stored."
                    >
                        <SaveLocationSelector />
                    </PageSection>

                    <PageSection
                        title="3. Receive Options"
                        description="Configure receive behavior."
                    >
                        <ReceiveOptions />
                        <ReceiveReview />
                    </PageSection>
                </>
            )}

            {status === "receiving" && (
                <PageSection
                    title="Receiving"
                    description="Receiving files..."
                >
                    <ReceiveProgress />
                </PageSection>
            )}

            {status === "completed" && (
                <PageSection
                    title="Transfer Summary"
                    description="Receive completed successfully."
                >
                    <ReceiveSummary />
                </PageSection>
            )}
        </div>
    )
}