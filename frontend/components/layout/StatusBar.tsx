"use client";

import { Badge } from "@/components/ui/badge";

export function StatusBar() {
    return (
        <footer className="flex h-8 items-center justify-between border-t border-border bg-background px-4 text-xs">
            <div className="flex items-center gap-4">
                <Badge variant="secondary">Ready</Badge>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
                <span>Backend: Offline</span>
                <span>Engine: Offline</span>
                <span>vX.Y.Z</span>
            </div>
        </footer>
    );
}