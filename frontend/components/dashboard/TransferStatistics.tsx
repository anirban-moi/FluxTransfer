"use client";

import {
    Activity,
    ArrowDownToLine,
    ArrowUpFromLine,
    Clock3,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const statistics = [
    {
        title: "Files Sent",
        value: "128",
        icon: ArrowUpFromLine,
    },
    {
        title: "Files Received",
        value: "96",
        icon: ArrowDownToLine,
    },
    {
        title: "Active Transfers",
        value: "2",
        icon: Activity,
    },
    {
        title: "Average Speed",
        value: "84 MB/s",
        icon: Clock3,
    },
];

export function TransferStatistics() {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="text-xl font-semibold">
                    Transfer Statistics
                </h2>

                <p className="text-sm text-muted-foreground">
                    Overall transfer performance summary.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {statistics.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stat.title}
                                </CardTitle>

                                <Icon className="size-5 text-muted-foreground" />
                            </CardHeader>

                            <CardContent>
                                <div className="text-3xl font-bold">
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}