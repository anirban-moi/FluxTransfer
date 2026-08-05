"use client";

import {
    createContext,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import { defaultSettings } from "../constants/defaultSettings";
import type { AppSettings } from "../types/settings";

type SettingsContextType = {
    settings: AppSettings;

    updateSettings: (
        updater: (prev: AppSettings) => AppSettings
    ) => void;

    resetSettings: () => void;

    saveSettings: () => void;
};

const SettingsContext =
    createContext<SettingsContextType | null>(null);

export function SettingsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [settings, setSettings] =
        useState(defaultSettings);

    function updateSettings(
        updater: (prev: AppSettings) => AppSettings
    ) {
        setSettings(updater);
    }

    function resetSettings() {
        setSettings(defaultSettings);
    }

    function saveSettings() {
        console.log("Saving settings...");
    }

    const value = useMemo(
        () => ({
            settings,
            updateSettings,
            resetSettings,
            saveSettings,
        }),
        [settings]
    );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error(
            "useSettings must be used within SettingsProvider."
        );
    }

    return context;
}