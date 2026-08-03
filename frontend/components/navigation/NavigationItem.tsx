"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavigationItem as NavigationItemType } from "@/config/navigation";

type NavigationItemProps = {
    item: NavigationItemType;
};

export function NavigationItem({ item }: NavigationItemProps) {
    const pathname = usePathname();

    const isActive =
        pathname === item.href ||
        (item.href !== "/" && pathname.startsWith(item.href));

    const Icon = item.icon;

    return (
        <Link href={item.href} className="block">
            <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                    "h-10 w-full justify-start gap-3 rounded-lg px-3 transition-all",
                    isActive && "font-semibold shadow-sm"
                )}
            >
                <Icon className="size-4" />
                <span>{item.title}</span>
            </Button>
        </Link>
    );
}