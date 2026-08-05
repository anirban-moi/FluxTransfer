"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

type SettingsSectionProps = {
    title: string;

    description?: string;

    children: React.ReactNode;
};

export function SettingsSection({
    title,
    description,
    children,
}: SettingsSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>

                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </CardHeader>

            <CardContent className="space-y-6">
                {children}
            </CardContent>
        </Card>
    );
}