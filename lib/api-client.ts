const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new ApiError(response.status, error || response.statusText);
  }
  return response.json();
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<T>(response);
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE'
    });
    return handleResponse<T>(response);
  }
};
