import type { Device } from "../types/transfer";

export const mockDevices: Device[] = [
    {
        id: "desktop",
        name: "Desktop-PC",
        platform: "Windows 11",
        status: "online",
    },
    {
        id: "laptop",
        name: "Work Laptop",
        platform: "Windows 11",
        status: "online",
    },
    {
        id: "mobile",
        name: "Galaxy S24",
        platform: "Android",
        status: "offline",
    },
];