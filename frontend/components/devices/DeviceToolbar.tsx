"use client";

import { RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DeviceToolbarProps = {
    search: string;
    showOnlineOnly: boolean;
    onSearchChange: (value: string) => void;
    onToggleOnlineOnly: () => void;
    onRefresh: () => void;
    isRefreshing: boolean;
};

export function DeviceToolbar({
    search,
    showOnlineOnly,
    onSearchChange,
    onToggleOnlineOnly,
    onRefresh,
    isRefreshing,
}: DeviceToolbarProps) {
    return (
        <div className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                    value={search}
                    onChange={(e) =>
                        onSearchChange(e.target.value)
                    }
                    placeholder="Search devices..."
                    className="pl-9"
                />
            </div>

            {/* Online Filter */}
            <Button
                variant={
                    showOnlineOnly
                        ? "default"
                        : "outline"
                }
                onClick={onToggleOnlineOnly}
            >
                Online Only
            </Button>

            {/* Refresh */}
            <Button
                variant="outline"
                onClick={onRefresh}
                disabled={isRefreshing}
            >
                <RefreshCw
                    className={`mr-2 size-4 ${isRefreshing ? "animate-spin" : ""
                        }`}
                />

                {isRefreshing
                    ? "Scanning..."
                    : "Refresh"}
            </Button>
        </div>
    );
}