"use client";

import {
    AppearanceSettings,
    NetworkSettings,
    SecuritySettings,
    TransferSettings,
} from "@/components/settings";

import {
    PageHeader,
} from "@/components/page";

import {
    Button,
} from "@/components/ui/button";

import {
    SettingsProvider,
    useSettings,
} from "@/features/settings/context";

function SettingsWorkflow() {
    const {
        resetSettings,
        saveSettings,
    } = useSettings();

    return (
        <div className="flex flex-col gap-8">
            <PageHeader
                title="Settings"
                description="Customize FluxTransfer."
            />

            <AppearanceSettings />

            <TransferSettings />

            <NetworkSettings />

            <SecuritySettings />

            <div className="flex justify-end gap-4">
                <Button
                    variant="outline"
                    onClick={resetSettings}
                >
                    Reset
                </Button>

                <Button
                    onClick={saveSettings}
                >
                    Save Settings
                </Button>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <SettingsProvider>
            <SettingsWorkflow />
        </SettingsProvider>
    );
}