"use client";

import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
    title: string;
    description: string;
    actionLabel?: string;
    actionIcon?: ReactNode;
    onAction?: () => void;
};

export function EmptyState({
    title,
    description,
    actionLabel,
    actionIcon,
    onAction,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Inbox className="size-8 text-muted-foreground" />
            </div>

            <h2 className="text-xl font-semibold">
                {title}
            </h2>

            <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {description}
            </p>

            {actionLabel && (
                <Button
                    className="mt-6"
                    onClick={onAction}
                >
                    {actionIcon}
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}