"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { SettingsSection } from "./SettingsSection";
import { useSettings } from "@/features/settings/context";

export function TransferSettings() {
    const { settings, updateSettings } = useSettings();

    return (
        <SettingsSection
            title="Transfer"
            description="Default transfer preferences."
        >
            <Input
                value={settings.transfer.defaultSaveLocation}
                onChange={(e) =>
                    updateSettings((prev) => ({
                        ...prev,
                        transfer: {
                            ...prev.transfer,
                            defaultSaveLocation: e.target.value,
                        },
                    }))
                }
            />

            <div className="flex items-center justify-between">
                <span>Verify Checksum</span>

                <Switch
                    checked={settings.transfer.verifyChecksum}
                    onCheckedChange={(checked) =>
                        updateSettings((prev) => ({
                            ...prev,
                            transfer: {
                                ...prev.transfer,
                                verifyChecksum: checked,
                            },
                        }))
                    }
                />
            </div>

            <div className="flex items-center justify-between">
                <span>Auto Open Folder</span>

                <Switch
                    checked={settings.transfer.autoOpenFolder}
                    onCheckedChange={(checked) =>
                        updateSettings((prev) => ({
                            ...prev,
                            transfer: {
                                ...prev.transfer,
                                autoOpenFolder: checked,
                            },
                        }))
                    }
                />
            </div>
        </SettingsSection>
    );
}