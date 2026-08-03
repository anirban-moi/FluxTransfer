"use client";

import { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageSectionProps = {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
};

export function PageSection({
    title,
    description,
    children,
    className,
}: PageSectionProps) {
    return (
        <section className={cn("space-y-4", className)}>
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h2 className="text-xl font-semibold">
                            {title}
                        </h2>
                    )}

                    {description && (
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            )}

            {children}
        </section>
    );
}