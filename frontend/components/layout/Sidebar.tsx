"use client";

import { NavigationMenu } from "@/components/navigation/NavigationMenu";

export function Sidebar() {
    return (
        <aside className="hidden border-r border-border bg-background lg:flex lg:w-60 lg:flex-col">
            <div className="flex-1 p-4">
                <NavigationMenu />
            </div>
        </aside>
    );
}