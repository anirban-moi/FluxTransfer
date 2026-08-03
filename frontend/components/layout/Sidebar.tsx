"use client";

import { NavigationMenu } from "../navigation/NavigationMenu";

export function Sidebar() {
    return (
        <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <NavigationMenu />
            </div>

            <div className="border-t p-4">
                <p className="text-xs text-muted-foreground">
                    FluxTransfer
                </p>

                <p className="text-xs text-muted-foreground">
                    Modern File Transfer Platform
                </p>
            </div>
        </aside>
    );
}