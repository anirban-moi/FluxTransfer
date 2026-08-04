"use client";

import { PageHeader, PageSection } from "@/components/page";

import {
    DeviceSelector,
    FileSelector,
    TransferOptions,
    TransferReview,
    TransferProgress,
    TransferSummary,
} from "@/components/send";

import {
    SendTransferProvider,
    useSendTransfer,
} from "@/features/send/context";

export default function SendFilesPage() {
    return (
        <SendTransferProvider>
            <SendFilesContent />
        </SendTransferProvider>
    );
}

function SendFilesContent() {
    const { state } = useSendTransfer();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Send Files"
                description="Transfer files and folders securely to another device."
            />

            <PageSection
                title="1. Select Device"
                description="Choose the destination device."
            >
                <DeviceSelector />
            </PageSection>

            <PageSection
                title="2. Select Files"
                description="Choose files or folders to transfer."
            >
                <FileSelector />
            </PageSection>

            <PageSection
                title="3. Transfer Options"
                description="Configure the transfer."
            >
                <TransferOptions />
            </PageSection>

            {!state.showSummary && (
                <>
                    <PageSection
                        title="4. Review"
                        description="Verify everything before starting."
                    >
                        <TransferReview />
                    </PageSection>

                    <PageSection
                        title="5. Progress"
                        description="Monitor the transfer."
                    >
                        <TransferProgress />
                    </PageSection>
                </>
            )}

            {state.showSummary && (
                <PageSection
                    title="Transfer Summary"
                    description="Transfer completed successfully."
                >
                    <TransferSummary />
                </PageSection>
            )}
        </div>
    );
}