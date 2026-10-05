const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('hsq_token');
}

export function setToken(token: string) {
  window.localStorage.setItem('hsq_token', token);
}

export function clearToken() {
  window.localStorage.removeItem('hsq_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  loginAdmin: (email: string, password: string) =>
    request<{ accessToken: string; user: any }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  loginTenant: (tenantSlug: string, email: string, password: string) =>
    request<{ accessToken: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ tenantSlug, email, password }),
    }),

  me: () => request<any>('/auth/me'),

  listTenants: () => request<any[]>('/tenants'),

  createTenant: (payload: {
    legalName: string;
    displayName: string;
    industry?: string;
    moduleCodes: string[];
    adminEmail: string;
    adminFirstName: string;
  }) => request<any>('/tenants', { method: 'POST', body: JSON.stringify(payload) }),

  setTenantModule: (tenantId: string, moduleCode: string, enabled: boolean) =>
    request<any>(`/tenants/${tenantId}/modules/${moduleCode}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    }),

  listModulesCatalog: () => request<any[]>('/modules-catalog'),
};
