export type ApiClientOptions = {
  baseUrl?: string;
  headers?: HeadersInit;
};

export class ApiClient {
  constructor(private readonly options: ApiClientOptions = {}) {}

  async get<T>(path: string): Promise<T> {
    const baseUrl = this.options.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
    const response = await fetch(`${baseUrl}${path}`, {
      headers: this.options.headers,
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return (await response.json()) as T;
  }
}

export const defaultApiClient = new ApiClient();
