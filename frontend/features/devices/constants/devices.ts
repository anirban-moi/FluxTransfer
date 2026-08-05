import type { Device } from "../types/device";

export const mockDevices: Device[] = [
    {
        id: "device-1",
        name: "Workstation",
        hostname: "workstation.local",

        platform: "windows",
        status: "online",
        trust: "trusted",
        transferState: "idle",

        lastSeen: new Date(),

        fingerprint: "AA:12:BC:45:DE:67",

        network: {
            ipAddress: "192.168.1.100",
            port: 53317,
            protocol: "tcp",
        },

        capabilities: {
            compression: true,
            encryption: true,
            resumeTransfer: true,
            version: "1.0.0",
        },
    },

    {
        id: "device-2",
        name: "Linux Server",
        hostname: "storage-server",

        platform: "linux",
        status: "online",
        trust: "trusted",
        transferState: "receiving",

        lastSeen: new Date(),

        fingerprint: "BB:45:EF:89:GH:12",

        network: {
            ipAddress: "192.168.1.105",
            port: 53317,
            protocol: "tcp",
        },

        capabilities: {
            compression: true,
            encryption: true,
            resumeTransfer: true,
            version: "1.0.0",
        },
    },

    {
        id: "device-3",
        name: "MacBook Pro",
        hostname: "macbook.local",

        platform: "macos",
        status: "offline",
        trust: "trusted",
        transferState: "idle",

        lastSeen: new Date(Date.now() - 1000 * 60 * 30),

        fingerprint: "CC:23:JK:90:LM:34",

        network: {
            ipAddress: "192.168.1.110",
            port: 53317,
            protocol: "tcp",
        },

        capabilities: {
            compression: true,
            encryption: true,
            resumeTransfer: true,
            version: "1.0.0",
        },
    },

    {
        id: "device-4",
        name: "Galaxy S25",
        hostname: "android-phone",

        platform: "android",
        status: "connecting",
        trust: "pending",
        transferState: "idle",

        fingerprint: "DD:56:NO:78:PQ:90",

        network: {
            ipAddress: "192.168.1.115",
            port: 53317,
            protocol: "tcp",
        },

        capabilities: {
            compression: true,
            encryption: true,
            resumeTransfer: true,
            version: "1.0.0",
        },
    },
];