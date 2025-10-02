import axios from "axios";
import { fetchJson, buildQuery } from "../lib/fetchJson";
import { normalizePage } from "./pageAdapter";
import type {
    DocumentListItemDTO,
    DocumentDetailDTO,
    //Page,
    PageResponse,
    UploadResponse,
} from "./types";

const BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
const api = (p: string) => `${BASE.replace(/\/+$/, "")}${p.startsWith("/") ? "" : "/"}${p}`;

// LIST
type ListParams = { page?: number; pageSize?: number; q?: string; sort?: string };

// flip to true only when the backend supports `?sort=uploadDate,desc|asc`
const INCLUDE_SORT = false;

export async function listDocuments(params: ListParams = {}) {
    const queryObj: Record<string, string | number | undefined> = {
        page: (params.page ?? 1) - 1,     // API is 0-based; UI is 1-based
        size: params.pageSize ?? 25,
    };

    if (params.q && params.q.trim()) queryObj.q = params.q.trim();
    if (INCLUDE_SORT && params.sort) queryObj.sort = params.sort;

    const qs = buildQuery(queryObj);
    const raw = await fetchJson<PageResponse<DocumentListItemDTO>>(`/api/documents${qs}`);
    return normalizePage(raw);
}



// DETAIL
export async function getDocument(id: string): Promise<DocumentDetailDTO> {
    return fetchJson<DocumentDetailDTO>(`/api/documents/${id}`);
}

// UPLOAD (multipart + progress) — returns DocumentDetailDTO OR DocumentDTO
export async function uploadDocument(
    file: File,
    onProgress?: (pct: number) => void
): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", file);

    const res = await axios.post<UploadResponse>(api("/api/documents/upload"), form, {
        headers: { Accept: "application/json" },
        onUploadProgress: (e) => {
            if (!onProgress || !e.total) return;
            onProgress(Math.round((e.loaded / e.total) * 100));
        },
    });
    return res.data;
}

// DOWNLOAD URL (for detail view when downloadable=true)
export function buildDownloadUrl(id: string) {
    return api(`/api/documents/${id}/download`);
}

// DELETE (delete one document by id)
export async function deleteDocument(id: string): Promise<void> {
    const url = api(`/api/documents/${id}`);
    const res = await fetch(url, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Delete failed (${res.status})`);
    }
}
