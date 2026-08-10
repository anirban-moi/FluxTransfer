"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { PendingPairRequest } from "@/lib/api";

type Props = {
    request: PendingPairRequest;

    onAccept(): void;
    onReject(): void;
};

export function IncomingPairDialog({
    request,
    onAccept,
    onReject,
}: Props) {
    return (
        <Card className="border-primary">
            <CardHeader>
                <CardTitle>
                    Incoming Pair Request
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                <div>
                    <p className="font-semibold">
                        {request.name}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {request.hostname}
                    </p>

                    <p className="text-sm text-muted-foreground">
                        {request.address.IP}:{request.address.Port}
                    </p>
                </div>

                <div className="flex gap-2">
                    <Button
                        onClick={onAccept}
                    >
                        Accept
                    </Button>

                    <Button
                        variant="outline"
                        onClick={onReject}
                    >
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}