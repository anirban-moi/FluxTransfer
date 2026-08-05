"use client";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { SettingsSection } from "./SettingsSection";
import { useSettings } from "@/features/settings/context";

export function NetworkSettings() {
    const { settings, updateSettings } = useSettings();

    return (
        <SettingsSection
            title="Network"
            description="Discovery and networking."
        >
            <Input
                placeholder="Device Name"
                value={settings.network.deviceName}
                onChange={(e) =>
                    updateSettings((prev) => ({
                        ...prev,
                        network: {
                            ...prev.network,
                            deviceName: e.target.value,
                        },
                    }))
                }
            />

            <Input
                type="number"
                placeholder="Discovery Port"
                value={settings.network.discoveryPort}
                onChange={(e) =>
                    updateSettings((prev) => ({
                        ...prev,
                        network: {
                            ...prev.network,
                            discoveryPort:
                                Number(e.target.value) || 0,
                        },
                    }))
                }
            />

            <div className="flex items-center justify-between">
                <span>Auto Discover Devices</span>

                <Switch
                    checked={settings.network.autoDiscoverDevices}
                    onCheckedChange={(checked) =>
                        updateSettings((prev) => ({
                            ...prev,
                            network: {
                                ...prev.network,
                                autoDiscoverDevices: checked,
                            },
                        }))
                    }
                />
            </div>
        </SettingsSection>
    );
}