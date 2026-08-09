import { apiClient } from "./client";

type PairRequest = {
    deviceId: string;
};

export async function pairDevice(
    deviceId: string,
): Promise<void> {

    await apiClient.post<void>(
        "/api/pairings",
        {
            deviceId,
        },
    );
}