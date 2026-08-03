"use client";

import {
    ArrowRightLeft,
    Download,
    Laptop,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const actions = [
    {
        title: "Send Files",
        description: "Transfer files to another device.",
        icon: ArrowRightLeft,
        variant: "default" as const,
    },
    {
        title: "Receive Files",
        description: "Receive incoming file transfers.",
        icon: Download,
        variant: "secondary" as const,
    },
    {
        title: "Manage Devices",
        description: "View and manage connected devices.",
        icon: Laptop,
        variant: "outline" as const,
    },
];

export function QuickActions() {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">
                    Quick Actions
                </h2>

                <p className="text-sm text-muted-foreground">
                    Frequently used operations.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <Card key={action.title}>
                            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                    <Icon className="size-5" />
                                </div>

                                <CardTitle className="text-base">
                                    {action.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    {action.description}
                                </p>

                                <Button
                                    variant={action.variant}
                                    className="w-full"
                                >
                                    Open
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}