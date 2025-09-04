export type DocumentDTO = {
    id: string;
    title: string | null;
    originalFilename: string;
    contentType: string;
    sizeBytes: number;
    createdAt: string;
    status: "PROCESSING" | "READY" | "FAILED";
    downloadUrl: string;
    summary?: { text: string } | null;
    extractedFields?: Array<{ name: string; value: string }> | null;
};

export type Page<T> = {
    items: T[];
    page: number;      // 1-based
    pageSize: number;
    totalItems: number;
    totalPages: number;
};
