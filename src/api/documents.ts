import axios from "axios";
import { fetchJson, buildQuery } from "../lib/fetchJson";
import type { DocumentDTO, Page } from "./types";

export async function listDocuments(params: {
    page?: number; pageSize?: number; q?: string; sort?: string; dir?: "asc"|"desc";
} = {}): Promise<Page<DocumentDTO>> {
    const qs = buildQuery(params);
    return fetchJson<Page<DocumentDTO>>(`/api/documents${qs}`);
}

export async function getDocument(id: string): Promise<DocumentDTO> {
    return fetchJson<DocumentDTO>(`/api/documents/${id}`);
}

/**
 * Upload with progress via Axios (so we get onUploadProgress)
 */
export async function uploadDocument(file: File, onProgress?: (pct: number) => void): Promise<DocumentDTO> {
    const form = new FormData();
    form.append("file", file);

    const base = (import.meta as any).env?.VITE_API_BASE_URL || "";
    const url = `${base.replace(/\/+$/, "")}/api/documents/upload`;

    const res = await axios.post<DocumentDTO>(url, form, {
        headers: { "Accept": "application/json" },
        onUploadProgress: (e) => {
            if (!onProgress || !e.total) return;
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
        },
    });
    return res.data;
}
