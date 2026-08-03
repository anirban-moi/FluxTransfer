"use client";

import { Button } from "@/components/ui/button";

export function Header() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
            {/* Application Logo & Title */}
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    FT
                </div>

                <div className="flex flex-col">
                    <span className="text-lg font-semibold tracking-tight">
                        FluxTransfer
                    </span>
                    <span className="text-xs text-muted-foreground">
                        Modern File Transfer Platform
                    </span>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                    Theme
                </Button>

                <Button size="sm">
                    Settings
                </Button>
            </div>
        </header>
    );
}