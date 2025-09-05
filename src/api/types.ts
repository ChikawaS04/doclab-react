export type ExtractedField = { name: string; value: string };

export type DocumentDTO = {
    id: string;
    fileName: string;
    fileType: string;      // e.g., application/pdf
    docType: string;       // your domain type (INVOICE, ID, etc.)
    uploadDate: string;    // ISO string from LocalDateTime
    status: string;        // PROCESSING | PROCESSED | FAILED | ...
    downloadUrl: string;

    // Keep these optional so the UI can show them when backend adds them
    summary?: { text: string } | null;
    extractedFields?: ExtractedField[] | null;
};

export type Page<T> = {
    items: T[];
    page: number;          // 1-based (or adapt if your API is 0-based)
    pageSize: number;
    totalItems: number;
    totalPages: number;
};
