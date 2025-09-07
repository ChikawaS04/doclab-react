// === Page wrapper from backend ===
export type PageResponse<T> = {
    content: T[];
    page: number;          // backend index (0- or 1-based; we normalize elsewhere)
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
};

// === List item DTO (index & recent cards) ===
export type DocumentListItemDTO = {
    id: string;           // UUID
    fileName: string;
    fileType: string;     // e.g. "application/pdf"
    docType: string;
    uploadDate: string;   // LocalDateTime serialized to ISO
    status: string;       // PROCESSING | PROCESSED | FAILED | ...
};

// === Detail DTO (detail view) ===
export type SummaryDTO = { text: string };
export type ExtractedFieldDTO = { name: string; value: string };

export type DocumentDetailDTO = {
    id: string;
    fileName: string;
    fileType: string;
    docType: string;
    uploadDate: string;         // ISO
    status: string;
    lastError: string | null;
    summaries: SummaryDTO[] | null;
    fields: ExtractedFieldDTO[] | null;
    downloadable: boolean;
};

// === Lean DocumentDTO the upload fallback returns ===
export type DocumentDTO = {
    id: string;
    fileName: string;
    fileType: string;
    docType: string;
    uploadDate: string;
    status: string;
    downloadUrl: string;     // present here (not in Detail DTO)
};

// Upload can return either the rich detail OR the lean doc
export type UploadResponse = DocumentDetailDTO | DocumentDTO;

// === Frontend-internal normalized page ===
export type Page<T> = {
    items: T[];
    page: number;       // 1-based
    pageSize: number;
    totalItems: number;
    totalPages: number;
};
