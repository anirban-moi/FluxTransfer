const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080";

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);

        this.name = "ApiError";
        this.status = status;
    }
}

async function request<T>(
    endpoint: string,
    init?: RequestInit,
): Promise<T> {

    const headers = new Headers(init?.headers);

    if (init?.body) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(
        `${BASE_URL}${endpoint}`,
        {
            ...init,
            headers,
        },
    );

    if (!response.ok) {

        throw new ApiError(
            response.status,
            response.statusText,
        );
    }

    return response.json() as Promise<T>;
}

export const apiClient = {
    get<T>(endpoint: string) {
        return request<T>(endpoint);
    },

    post<T>(
        endpoint: string,
        body: unknown,
    ) {
        return request<T>(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    put<T>(
        endpoint: string,
        body: unknown,
    ) {
        return request<T>(endpoint, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    },

    delete<T>(endpoint: string) {
        return request<T>(endpoint, {
            method: "DELETE",
        });
    },
};