import {
    ArrowRightLeft,
    FolderOpen,
    Home,
    Info,
    Laptop,
    Settings,
    type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
    title: string;
    href: string;
    icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
    {
        title: "Dashboard",
        href: "/",
        icon: Home,
    },
    {
        title: "Send Files",
        href: "/send",
        icon: ArrowRightLeft,
    },
    {
        title: "Receive Files",
        href: "/receive",
        icon: FolderOpen,
    },
    {
        title: "Devices",
        href: "/devices",
        icon: Laptop,
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
    },
    {
        title: "About",
        href: "/about",
        icon: Info,
    },
];