import axios from "axios";
import { fetchJson, buildQuery } from "../lib/fetchJson";
import { normalizePage } from "./pageAdapter";
import type {
    DocumentListItemDTO,
    DocumentDetailDTO,
    Page,
    PageResponse,
    UploadResponse,
} from "./types";

const BASE = (import.meta as any).env?.VITE_API_BASE_URL || "";
const api = (p: string) => `${BASE.replace(/\/+$/, "")}${p.startsWith("/") ? "" : "/"}${p}`;

// LIST
export async function listDocuments(params: {
    page?: number; pageSize?: number; q?: string;
} = {}): Promise<Page<DocumentListItemDTO>> {
    const qs = buildQuery({
        page: (params.page ?? 1) - 1,     // backend likely expects 0-based
        size: params.pageSize ?? 25,
        q: params.q,
    });
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
