"use client";

import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { PageSection } from "@/components/page";

const recentTransfers = [
    {
        name: "Project_Backup.zip",
        destination: "Desktop",
        status: "Completed",
        icon: CheckCircle2,
    },
    {
        name: "Vacation_Photos.zip",
        destination: "Laptop",
        status: "In Progress",
        icon: Clock3,
    },
    {
        name: "Presentation.pptx",
        destination: "Mobile",
        status: "Completed",
        icon: CheckCircle2,
    },
];

export function RecentTransfers() {
    return (
        <section className="space-y-4">
            <PageSection
                title="Quick Actions"
                description="Frequently used operations."
            >

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowUpRight className="size-5" />
                            Activity
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3">
                        {recentTransfers.map((transfer) => {
                            const Icon = transfer.icon;

                            return (
                                <div
                                    key={transfer.name}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon
                                            className={`size-5 ${transfer.status === "Completed"
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-yellow-600 dark:text-yellow-400"
                                                }`}
                                        />

                                        <div>
                                            <p className="font-medium">
                                                {transfer.name}
                                            </p>

                                            <p className="text-sm text-muted-foreground">
                                                {transfer.destination}
                                            </p>
                                        </div>
                                    </div>

                                    <span className="text-sm text-muted-foreground">
                                        {transfer.status}
                                    </span>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </PageSection>
        </section>
    );
}