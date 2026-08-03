"use client";

import { Button } from "@/components/ui/button";

export function DashboardHeader() {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Dashboard
                </h1>

                <p className="text-muted-foreground">
                    Monitor your devices and manage file transfers.
                </p>
            </div>

            <Button variant="outline">
                Refresh
            </Button>
        </div>
    );
}