"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { NavigationItem as NavigationItemType } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavigationItemProps = {
    item: NavigationItemType;
};

export function NavigationItem({ item }: NavigationItemProps) {
    const pathname = usePathname();
    const isActive = pathname === item.href;

    const Icon = item.icon;

    return (
        <Link href={item.href} className="block">
            <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                    "w-full justify-start",
                    isActive && "font-semibold"
                )}
            >
                <Icon className="size-4" />
                <span>{item.title}</span>
            </Button>
        </Link>
    );
}