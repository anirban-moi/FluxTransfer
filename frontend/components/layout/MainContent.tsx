"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MainContentProps = {
    children: React.ReactNode;
};

export function MainContent({ children }: MainContentProps) {
    return (
        <main className="flex-1 overflow-auto bg-muted/30 p-6">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Welcome to FluxTransfer</CardTitle>
                </CardHeader>

                <CardContent>
                    {children}
                </CardContent>
            </Card>
        </main>
    );
}