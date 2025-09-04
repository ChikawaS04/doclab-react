import { fetchJson, buildQuery } from "../lib/fetchJson";
import type { DocumentDTO, Page } from "./types";

export async function listDocuments(params: {
    page?: number; pageSize?: number; q?: string; sort?: string; dir?: "asc" | "desc";
} = {}): Promise<Page<DocumentDTO>> {
    const qs = buildQuery(params);
    return fetchJson<Page<DocumentDTO>>(`/api/documents${qs}`);
}

export async function getDocument(id: string): Promise<DocumentDTO> {
    return fetchJson<DocumentDTO>(`/api/documents/${id}`);
}

export async function uploadDocument(file: File): Promise<DocumentDTO> {
    const form = new FormData();
    form.append("file", file);
    // adjust to your actual endpoint if different:
    return fetchJson<DocumentDTO>("/api/documents/upload", {
        method: "POST",
        body: form,
        // no content-type header; browser sets multipart boundary
    });
}
