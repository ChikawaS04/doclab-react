export class HttpError extends Error {
    status: number;
    body?: unknown;
    constructor(message: string, status: number, body?: unknown) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

const BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";

export function withBase(path: string) {
    // ensures exactly one slash between base and path
    if (!BASE) return path;
    return `${BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function buildQuery(params?: Record<string, any>) {
    if (!params) return "";
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        q.set(k, String(v));
    });
    const s = q.toString();
    return s ? `?${s}` : "";
}

export async function fetchJson<T>(
    path: string,
    init?: RequestInit & { absolute?: boolean }
): Promise<T> {
    const url = init?.absolute ? path : withBase(path);
    const res = await fetch(url, {
        headers: { "Accept": "application/json", ...(init?.headers || {}) },
        ...init,
    });

    const text = await res.text();
    const maybeJson = safeJson(text);

    if (!res.ok) {
        throw new HttpError(
            (maybeJson as any)?.message || `HTTP ${res.status}`,
            res.status,
            maybeJson ?? text
        );
    }

    // empty body is valid (204)
    return (maybeJson ?? (undefined as unknown)) as T;
}

export async function postJson<T>(path: string, body: unknown, init?: RequestInit) {
    return fetchJson<T>(path, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
        body: JSON.stringify(body),
        ...init,
    });
}

function safeJson(s: string) {
    if (!s) return null;
    try {
        return JSON.parse(s);
    } catch {
        return null;
    }
}
