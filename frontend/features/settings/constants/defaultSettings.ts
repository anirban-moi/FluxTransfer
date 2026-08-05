import type { AppSettings } from "../types/settings";

export const defaultSettings: AppSettings = {
    appearance: {
        theme: "system",
        animations: true,
    },

    transfer: {
        defaultSaveLocation: "Downloads/FluxTransfer",
        overwriteExisting: false,
        verifyChecksum: true,
        autoOpenFolder: true,
    },

    network: {
        deviceName: "My Device",
        discoveryPort: 53317,
        autoDiscoverDevices: true,
    },

    security: {
        requireConfirmation: true,
        allowUntrustedDevices: false,
        encryptionEnabled: true,
    },
};