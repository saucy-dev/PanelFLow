const API_ORIGIN = import.meta.env.VITE_API_URL || '';
const BASE_URL = `${API_ORIGIN}/api`;

export class ApiError extends Error {
  statusCode: number;
  errors?: any;

  constructor(message: string, statusCode: number, errors?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Retrieve token from local storage if saved
  const token = localStorage.getItem('panelflow_token');
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // send cookies
  };

  try {
    const response = await fetch(url, config);

    // Safely parse response text to guard against empty bodies, HTML pages, or proxy errors
    const text = await response.text();
    let result: any = null;

    if (text) {
      try {
        result = JSON.parse(text);
      } catch {
        // Response is not JSON (e.g., HTML error page, proxy error, plain text)
        result = {
          success: false,
          message: text.length < 150 ? text : `Server returned non-JSON response (${response.status})`,
        };
      }
    } else {
      result = {};
    }

    if (!response.ok || result.success === false) {
      const fallbackMsg =
        response.status === 502 || response.status === 504
          ? 'Backend server is currently offline or unreachable. Please ensure "npm run dev" or the backend server is running.'
          : `Request failed with status ${response.status}`;

      throw new ApiError(
        result.message || fallbackMsg,
        response.status,
        result.errors
      );
    }

    return result.data !== undefined ? result.data : result;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error. Please check server connection.', 500);
  }
}

export const api = {
  get: <T>(url: string, options?: RequestInit) => request<T>(url, { ...options, method: 'GET' }),
  post: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: any, options?: RequestInit) =>
    request<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: RequestInit) =>
    request<T>(url, { ...options, method: 'DELETE' }),
};
