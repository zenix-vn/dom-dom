// Client gọi API backend Đom Đóm.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const TOKEN_KEY = "domdom_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function api<T = unknown>(
  path: string,
  { method = "GET", body, auth = true }: Options = {}
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Phiên đăng nhập đã hết hạn");
  }
  if (!res.ok) {
    let msg = `Lỗi ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message || data?.error?.detail || msg;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Kiểu dữ liệu ----

export type Subject = {
  id: number;
  kind: string;
  title: string;
  grade: number;
  series: string;
  tintHex: string;
  icon: string;
  sortOrder: number;
  chapters?: Chapter[];
};

export type Chapter = {
  id: number;
  subjectId: number;
  title: string;
  sortOrder: number;
  lessons?: Lesson[];
};

export type Lesson = {
  id: number;
  chapterId: number;
  index: number;
  title: string;
  sortOrder: number;
  questions?: Question[];
};

export type Question = {
  id: number;
  lessonId: number;
  stem: string;
  mediaCaption?: string | null;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
  sortOrder: number;
};
