export type ApiClientOptions = {
  baseUrl?: string;
  headers?: HeadersInit;
};

export class ApiClient {
  constructor(private readonly options: ApiClientOptions = {}) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const baseUrl = this.options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const response = await fetch(`${baseUrl}${path}`, {
      headers: this.options.headers,
      next: { revalidate: 0 },
      ...init
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...this.options.headers
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  }
}

export const defaultApiClient = new ApiClient();
