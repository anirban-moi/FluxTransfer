export type ThemeMode =
    | "system"
    | "light"
    | "dark";

export interface AppearanceSettings {
    theme: ThemeMode;
    animations: boolean;
}

export interface TransferSettings {
    defaultSaveLocation: string;
    overwriteExisting: boolean;
    verifyChecksum: boolean;
    autoOpenFolder: boolean;
}

export interface NetworkSettings {
    deviceName: string;
    discoveryPort: number;
    autoDiscoverDevices: boolean;
}

export interface SecuritySettings {
    requireConfirmation: boolean;
    allowUntrustedDevices: boolean;
    encryptionEnabled: boolean;
}

export interface AppSettings {
    appearance: AppearanceSettings;
    transfer: TransferSettings;
    network: NetworkSettings;
    security: SecuritySettings;
}