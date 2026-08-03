"use client";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page";

export function DashboardHeader() {
    return (
        <PageHeader
            title="Dashboard"
            description="Monitor your devices and manage file transfers."
            actions={
                <Button variant="outline">
                    Refresh
                </Button>
            }
        />
    );
}