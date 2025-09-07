import type { PageResponse, Page } from "./types";

export function normalizePage<T>(resp: PageResponse<T>): Page<T> {
    // Treat backend page as 0-based; bump to 1-based for UI
    const page1 = resp.page >= 0 ? resp.page + 1 : 1;
    return {
        items: resp.content,
        page: page1,
        pageSize: resp.size,
        totalItems: resp.totalElements,
        totalPages: resp.totalPages,
    };
}
