"use client";

import { Badge } from "@/components/ui/badge";

export function StatusBar() {
    return (
        <footer className="flex h-8 items-center justify-between border-t bg-background px-4 text-xs">
            <div className="flex items-center gap-3">
                <Badge variant="secondary">Ready</Badge>

                <span className="text-muted-foreground">
                    Backend: Offline
                </span>

                <span className="text-muted-foreground">
                    Engine: Offline
                </span>
            </div>

            <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                    FluxTransfer
                </span>

                <span className="text-muted-foreground">
                    v0.1.0
                </span>
            </div>
        </footer>
    );
}