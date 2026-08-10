import { apiClient } from "./client";

export type PendingPairRequest = {
    deviceId: string;
    name: string;
    hostname: string;
    platform: string;
    address: {
        IP: string;
        Port: number;
        Zone: string;
    };
    createdAt: string;
};

export async function getPendingPairRequests() {
    return apiClient.get<PendingPairRequest[]>(
        "/api/pairings/pending",
    );
}

export async function acceptPairRequest(
    deviceID: string,
) {
    return apiClient.post(
        "/api/pairings/accept",
        {
            deviceId: deviceID,
        },
    );
}

export async function rejectPairRequest(
    deviceID: string,
) {
    return apiClient.post(
        "/api/pairings/reject",
        {
            deviceId: deviceID,
        },
    );
}