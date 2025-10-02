import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listDocuments, deleteDocument } from "../api/documents";
import StatusPill from "../components/StatusPill";
import { Link, useNavigate } from "react-router-dom";
import { safeDateStr, toUiStatus } from "../lib/viewUtils";
import type { DocumentListItemDTO, Page } from "../api/types";

/* ---------- minimal inline icons (no new deps) ---------- */
const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
        <path d="M10 11v6"></path>
        <path d="M14 11v6"></path>
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path>
    </svg>
);

/* ---------- helpers ---------- */
function isUuidLike(s: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());
}

type ListParams = { page: number; pageSize: number; sort: string; q: string };

/* =========================================================
   Documents Index (Figma-polished)
   ========================================================= */
export default function DocumentsIndexPage() {
    const nav = useNavigate();
    const qc = useQueryClient();

    // search / sort / pagination state (kept local per your current API)
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 25;

    // Figma shows "Created" — mapping to your existing uploadDate sort
    const [sort, setSort] = useState<"uploadDate,desc" | "uploadDate,asc">("uploadDate,desc");

    const params: ListParams = { page, pageSize, sort, q };

    // Strongly-typed TanStack v5 query
    const { data, isLoading, isError, refetch } = useQuery<
        Page<DocumentListItemDTO>,      // TData
        Error,                         // TError
        Page<DocumentListItemDTO>,     // TQueryFnData
        readonly ["documents", ListParams] // TQueryKey
    >({
        queryKey: ["documents", params] as const,
        queryFn: ({ queryKey }) => {
            const [, p] = queryKey; // p is typed as ListParams
            return listDocuments(p);
        },
        // v5 replacement for keepPreviousData
        placeholderData: (prev) => prev,
        refetchOnWindowFocus: false,
    });

    const rows: DocumentListItemDTO[] = data?.items ?? [];
    const totalPages: number = data?.totalPages ?? 1;

    const remove = useMutation({
        mutationFn: (id: string) => deleteDocument(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["documents"] });
        },
    });

    return (
        <div className="mx-auto w-full max-w-[1200px] px-6 md:px-10 py-8">
            {/* Page title (≈28px, 600) */}
            <h1 className="text-heading text-[28px] mb-6">All Documents</h1>

            {/* Controls row: search + sort on the left, pagination on the right */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (isUuidLike(q)) nav(`/documents/${q.trim()}`);
                                else {
                                    setPage(1);
                                    refetch();
                                }
                            }
                        }}
                        placeholder="Search by ID, file name, or doc type..."
                        className="input-enhanced w-[520px] max-w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                    />


                    {/* Sort dropdown — visually matches “Created” chip */}
                    <SortDropdown
                        value={sort}
                        onChange={(v) => {
                            setSort(v);
                            setPage(1);
                            refetch();
                        }}
                    />
                </div>

                {/* Pagination (Prev  Page X / Y  Next) */}
                <div className="flex items-center gap-3 text-[14px] text-[#475569]">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                    >
                        ‹ Prev
                    </button>
                    <span>
            Page {page} / {totalPages || 1}
          </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                        disabled={page >= (totalPages || 1)}
                        className="disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Next page"
                    >
                        Next ›
                    </button>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white border rounded-[12px] shadow-sm overflow-hidden">
                <table className="w-full table-fixed">
                    <thead className="bg-[#f8fafc] text-left text-[14px] text-[#475569]">
                    <tr>
                        <Th className="w-[280px]">Document ID</Th>
                        <Th className="w-1/3">File name</Th>
                        <Th className="w-28">File type</Th>
                        <Th className="w-40">Document type</Th>
                        <Th className="w-40">Created</Th>
                        <Th className="w-28">Status</Th>
                        <Th className="w-16"></Th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {isLoading && (
                        <tr>
                            <Td colSpan={7}>
                                <div className="h-10 w-full animate-pulse rounded bg-[#f1f5f9]" />
                            </Td>
                        </tr>
                    )}

                    {isError && !isLoading && (
                        <tr>
                            <Td colSpan={7}>
                                <div className="text-[#dc2626]">
                                    Failed to load.{" "}
                                    <button className="underline" onClick={() => refetch()}>
                                        Retry
                                    </button>
                                </div>
                            </Td>
                        </tr>
                    )}

                    {!isLoading && rows.length === 0 && !isError && (
                        <tr>
                            <Td colSpan={7}>
                                <div className="text-[#64748b]">No documents found.</div>
                            </Td>
                        </tr>
                    )}

                    {rows.map((d: DocumentListItemDTO) => (
                        <tr key={d.id} className="hover:bg-[#f8fafc]">
                            <Td className="font-mono text-xs truncate" title={d.id}>
                                <Link to={`/documents/${d.id}`} className="text-[#2563eb] hover:underline">
                                    {d.id}
                                </Link>
                            </Td>
                            <Td className="truncate">
                                <Link
                                    to={`/documents/${d.id}`}
                                    className="hover:underline focus:outline-none focus:ring-2 focus:ring-[#3b82f6] rounded-md"
                                >
                                    {d.fileName}
                                </Link>
                            </Td>
                            <Td>{extFromType(d.fileType)}</Td>
                            <Td>{d.docType || "—"}</Td>
                            <Td>{safeDateStr(d.uploadDate)}</Td>
                            <Td>
                                <StatusPill status={toUiStatus(d.status)} />
                            </Td>
                            <Td className="relative">
                                <EllipsisMenu
                                    onView={() => nav(`/documents/${d.id}`)}
                                    onDelete={() => {
                                        if (confirm("Delete this document and its derived data?")) {
                                            remove.mutate(d.id);
                                        }
                                    }}
                                    disabled={remove.isPending}
                                />
                            </Td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

/* ---------- small presentational pieces ---------- */
function Th(props: React.HTMLAttributes<HTMLTableCellElement>) {
    const { className = "", ...rest } = props;
    return <th className={`text-left font-medium border-b px-4 py-3 ${className}`} {...rest} />;
}
function Td(props: React.HTMLAttributes<HTMLTableCellElement> & { colSpan?: number }) {
    const { className = "", ...rest } = props;
    return <td className={`border-b px-4 py-4 align-middle ${className}`} {...rest} />;
}

function EllipsisMenu({
                          onView,
                          onDelete,
                          disabled,
                      }: {
    onView: () => void;
    onDelete: () => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest?.(".ellipsis-menu")) setOpen(false);
        };
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    return (
        <div className="ellipsis-menu relative inline-block">
            <button
                aria-haspopup="menu"
                aria-expanded={open}
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-[#f1f5f9] disabled:opacity-50"
                title="Actions"
            >
                <span className="sr-only">Actions</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#64748b">
                    <circle cx="5" cy="12" r="2"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                    <circle cx="19" cy="12" r="2"></circle>
                </svg>
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-20 mt-2 w-40 rounded-xl bg-white border shadow-lg p-1"
                >
                    <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onView(); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-gray-100 text-gray-800"
                    >
                        <EyeIcon className="w-4 h-4" />
                        <span>View</span>
                    </button>
                    <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 hover:bg-red-50 text-red-600 mt-1"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>
            )}

        </div>
    );
}

function SortDropdown({
                          value,
                          onChange,
                      }: {
    value: "uploadDate,desc" | "uploadDate,asc";
    onChange: (v: "uploadDate,desc" | "uploadDate,asc") => void;
}) {
    const [open, setOpen] = useState(false);

    const label = useMemo(() => "Created", [value]);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest?.(".sort-dropdown")) setOpen(false);
        };
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    return (
        <div className="sort-dropdown relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="input-enhanced inline-flex items-center gap-2 rounded-[12px] px-4 py-3"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-20 mt-2 w-44 rounded-[12px] bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)] border p-2">
                    <DropdownItem active={value === "uploadDate,desc"} onClick={() => onChange("uploadDate,desc")}>
                        Newest first
                    </DropdownItem>
                    <DropdownItem active={value === "uploadDate,asc"} onClick={() => onChange("uploadDate,asc")}>
                        Oldest first
                    </DropdownItem>
                </div>
            )}
        </div>
    );
}

function DropdownItem({
                          children,
                          onClick,
                          active,
                      }: React.PropsWithChildren<{ onClick: () => void; active?: boolean }>) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`w-full text-left rounded-[10px] px-3 py-2 hover:bg-[#f1f5f9] ${
                active ? "bg-[#eff6ff] text-[#1e40af]" : "text-[#0f172a]"
            }`}
            role="option"
            aria-selected={!!active}
        >
            {children}
        </button>
    );
}

/* ---------- existing helper preserved ---------- */
function extFromType(ct: string) {
    if (!ct) return "FILE";
    const s = ct.toLowerCase();
    if (s.includes("pdf")) return "PDF";
    if (s.includes("word") || s.includes("doc")) return "DOCX";
    if (s.includes("text")) return "TXT";
    if (s.includes("png")) return "PNG";
    if (s.includes("jpeg") || s.includes("jpg")) return "JPG";
    return "FILE";
}
