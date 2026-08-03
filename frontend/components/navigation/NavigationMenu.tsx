"use client";

import { navigationItems } from "@/config/navigation";

import { NavigationItem } from "./NavigationItem";

export function NavigationMenu() {
    return (
        <nav className="flex flex-col gap-2">
            {navigationItems.map((item) => (
                <NavigationItem
                    key={item.href}
                    item={item}
                />
            ))}
        </nav>
    );
}