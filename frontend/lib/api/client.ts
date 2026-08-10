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
        const message = await response.text();

        throw new ApiError(
            response.status,
            message || response.statusText,
        );
    }

    if (response.status === 204 || response.status === 202) {
        return undefined as T;
    }

    const contentType = response.headers.get("content-type");

    if (!contentType?.includes("application/json")) {
        return undefined as T;
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