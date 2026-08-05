"use client";

import { Switch } from "@/components/ui/switch";
import { SettingsSection } from "./SettingsSection";
import { useSettings } from "@/features/settings/context";

export function AppearanceSettings() {
    const { settings, updateSettings } = useSettings();
    return (
        <SettingsSection
            title="Appearance"
            description="Customize how FluxTransfer looks."
        >
            <div className="flex items-center justify-between">
                <span>Enable Animations</span>

                <Switch
                    checked={settings.appearance.animations}
                    onCheckedChange={(checked) =>
                        updateSettings((prev) => ({
                            ...prev,
                            appearance: {
                                ...prev.appearance,
                                animations: checked,
                            },
                        }))
                    }
                />
            </div>
        </SettingsSection>
    );
}