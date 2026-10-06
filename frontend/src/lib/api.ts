const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T = any>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { token, headers: customHeaders, ...rest } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${endpoint}`, { headers, ...rest });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// Auth
export const authAPI = {
  login: (email: string, password: string) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: { email: string; password: string; full_name: string; role?: string }) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  refreshToken: (refresh_token: string) =>
    apiFetch('/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) }),
  me: (token: string) =>
    apiFetch('/users/me', { token }),
};

// Resumes
export const resumeAPI = {
  upload: (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    }).then(r => r.json());
  },
  list: (token: string) =>
    apiFetch('/resumes/', { token }),
  get: (id: string, token: string) =>
    apiFetch(`/resumes/${id}`, { token }),
};

// Skills
export const skillsAPI = {
  benchmarks: (token: string) =>
    apiFetch('/skills/benchmarks', { token }),
  analyze: (target_role: string, token: string) =>
    apiFetch('/skills/analyze', { method: 'POST', body: JSON.stringify({ target_role }), token }),
  mySkills: (token: string) =>
    apiFetch('/skills/my-skills', { token }),
};

// Roadmaps
export const roadmapAPI = {
  generate: (target_role: string, token: string) =>
    apiFetch('/roadmaps/generate', { method: 'POST', body: JSON.stringify({ target_role }), token }),
  list: (token: string) =>
    apiFetch('/roadmaps/', { token }),
  get: (id: string, token: string) =>
    apiFetch(`/roadmaps/${id}`, { token }),
  updateItem: (roadmapId: string, itemId: string, status: string, token: string) =>
    apiFetch(`/roadmaps/${roadmapId}/items/${itemId}`, {
      method: 'PATCH', body: JSON.stringify({ status }), token
    }),
};

// Assessments
export const assessmentAPI = {
  list: (token: string) =>
    apiFetch('/assessments/', { token }),
  get: (id: string, token: string) =>
    apiFetch(`/assessments/${id}`, { token }),
  submit: (id: string, code: string, language: string, token: string) =>
    apiFetch(`/assessments/${id}/submit`, {
      method: 'POST', body: JSON.stringify({ code, language }), token
    }),
};

// Interviews
export const interviewAPI = {
  start: (data: { role: string; difficulty: string }, token: string) =>
    apiFetch('/interviews/start', { method: 'POST', body: JSON.stringify(data), token }),
  respond: (sessionId: string, answer: string, token: string) =>
    apiFetch(`/interviews/${sessionId}/respond`, {
      method: 'POST', body: JSON.stringify({ answer }), token
    }),
  end: (sessionId: string, token: string) =>
    apiFetch(`/interviews/${sessionId}/end`, { method: 'POST', token }),
  history: (token: string) =>
    apiFetch('/interviews/history', { token }),
};

// Jobs
export const jobsAPI = {
  recommendations: (token: string) =>
    apiFetch('/jobs/recommendations', { token }),
  list: (token: string) =>
    apiFetch('/jobs/', { token }),
};

// Dashboard
export const dashboardAPI = {
  stats: (token: string) =>
    apiFetch('/dashboard/stats', { token }),
};

// RAG
export const ragAPI = {
  search: (query: string, top_k: number = 5) =>
    apiFetch('/rag/search', { method: 'POST', body: JSON.stringify({ query, top_k }) }),
};

export default apiFetch;
