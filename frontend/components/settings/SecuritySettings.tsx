"use client";

import { Switch } from "@/components/ui/switch";

import { SettingsSection } from "./SettingsSection";
import { useSettings } from "@/features/settings/context";

export function SecuritySettings() {
    const { settings, updateSettings } = useSettings();

    return (
        <SettingsSection
            title="Security"
            description="Configure security and trust preferences."
        >
            <div className="flex items-center justify-between">
                <span>Require Confirmation</span>

                <Switch
                    checked={settings.security.requireConfirmation}
                    onCheckedChange={(checked) =>
                        updateSettings((prev) => ({
                            ...prev,
                            security: {
                                ...prev.security,
                                requireConfirmation: checked,
                            },
                        }))
                    }
                />
            </div>

            <div className="flex items-center justify-between">
                <span>Allow Untrusted Devices</span>

                <Switch
                    checked={settings.security.allowUntrustedDevices}
                    onCheckedChange={(checked) =>
                        updateSettings((prev) => ({
                            ...prev,
                            security: {
                                ...prev.security,
                                allowUntrustedDevices: checked,
                            },
                        }))
                    }
                />
            </div>

            <div className="flex items-center justify-between">
                <span>Enable Encryption</span>

                <Switch
                    checked={settings.security.encryptionEnabled}
                    onCheckedChange={(checked) =>
                        updateSettings((prev) => ({
                            ...prev,
                            security: {
                                ...prev.security,
                                encryptionEnabled: checked,
                            },
                        }))
                    }
                />
            </div>
        </SettingsSection>
    );
}