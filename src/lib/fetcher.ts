// src/lib/fetcher.ts
const isDev = import.meta.env.DEV;

export const API_BASE = isDev
  ? "/api" // proxy local via vite.config.ts
  : `${import.meta.env.VITE_BACKEND_URL}/api`; // backend live

export const fetchApi = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(`${API_BASE}${path}`, options);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error || "Erreur réseau");
  }
  return res.json();
};

// ✅ Redirection automatique (GET avec query params)
export const redirectToApi = (path: string, params: Record<string, string | number>) => {
  const query = new URLSearchParams(params as any).toString();
  window.location.href = `${API_BASE}${path}?${query}`;
};
