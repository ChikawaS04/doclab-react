import { useEffect, useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
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

    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 25;
    const [sort, setSort] = useState<"uploadDate,desc" | "uploadDate,asc">("uploadDate,desc");

    const params: ListParams = { page, pageSize, sort, q };

    const { data, isLoading, isError, refetch } = useQuery<
        Page<DocumentListItemDTO>,
        Error,
        Page<DocumentListItemDTO>,
        readonly ["documents", ListParams]
    >({
        queryKey: ["documents", params] as const,
        queryFn: ({ queryKey }) => {
            const [, p] = queryKey;
            return listDocuments(p);
        },
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
        <div className="mx-auto w-full max-w-screen-xl px-6 md:px-8 py-8">
            {/* Page title */}
            <h1 className="text-heading text-3xl mb-6">All Documents</h1>

            {/* Controls row */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                <div className="flex items-center gap-3">
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
                        className="input-enhanced rounded-xl px-4 py-3 text-sm focus:outline-none"
                        style={{ width: '520px', maxWidth: '100%' }}
                    />

                    <SortDropdown
                        value={sort}
                        onChange={(v) => {
                            setSort(v);
                            setPage(1);
                            refetch();
                        }}
                    />
                </div>

                {/* Pagination */}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                    >
                        ‹ Prev
                    </button>
                    <span>Page {page} / {totalPages || 1}</span>
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

            {/* Table card - NO OVERFLOW WRAPPER */}
            <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #e5e7eb' }}>
                <table className="w-full table-fixed">
                    <thead className="text-left text-sm font-semibold text-gray-900" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                    <tr>
                        <Th style={{ width: '280px', borderBottom: '1px solid #e5e7eb' }}>Document ID</Th>
                        <Th className="w-1/3" style={{ borderBottom: '1px solid #e5e7eb' }}>File name</Th>
                        <Th className="w-28" style={{ borderBottom: '1px solid #e5e7eb' }}>File type</Th>
                        <Th className="w-40" style={{ borderBottom: '1px solid #e5e7eb' }}>Document type</Th>
                        <Th className="w-40" style={{ borderBottom: '1px solid #e5e7eb' }}>Created</Th>
                        <Th className="w-28" style={{ borderBottom: '1px solid #e5e7eb' }}>Status</Th>
                        <Th className="w-16" style={{ borderBottom: '1px solid #e5e7eb' }}></Th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading && (
                        <tr>
                            <Td colSpan={7} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <div className="h-10 w-full animate-pulse rounded bg-gray-100" />
                            </Td>
                        </tr>
                    )}

                    {isError && !isLoading && (
                        <tr>
                            <Td colSpan={7} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <div className="text-red-600">
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
                            <Td colSpan={7} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <div className="text-gray-500">No documents found.</div>
                            </Td>
                        </tr>
                    )}

                    {rows.map((d: DocumentListItemDTO) => (
                        <tr key={d.id} style={{ transition: 'background-color 0.15s', borderBottom: '1px solid #e5e7eb' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Td className="font-mono text-xs truncate text-gray-600" title={d.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <Link to={`/documents/${d.id}`} className="text-blue-600 hover:underline">
                                    {d.id}
                                </Link>
                            </Td>
                            <Td className="truncate text-sm text-gray-600" style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <Link
                                    to={`/documents/${d.id}`}
                                    className="hover:underline focus:outline-none focus:ring-2 rounded-md"
                                    style={{ '--tw-ring-color': '#3b82f6' } as React.CSSProperties}
                                >
                                    {d.fileName}
                                </Link>
                            </Td>
                            <Td className="text-sm text-gray-600" style={{ borderBottom: '1px solid #e5e7eb' }}>{extFromType(d.fileType)}</Td>
                            <Td className="text-sm text-gray-600" style={{ borderBottom: '1px solid #e5e7eb' }}>{d.docType || "—"}</Td>
                            <Td className="text-sm text-gray-600" style={{ borderBottom: '1px solid #e5e7eb' }}>{safeDateStr(d.uploadDate)}</Td>
                            <Td style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <StatusPill status={toUiStatus(d.status)} />
                            </Td>
                            <Td style={{ borderBottom: '1px solid #e5e7eb' }}>
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
    return <th className={`text-left font-semibold px-4 py-3 ${className}`} {...rest} />;
}
function Td(props: React.HTMLAttributes<HTMLTableCellElement> & { colSpan?: number }) {
    const { className = "", ...rest } = props;
    return <td className={`px-4 py-3 align-middle ${className}`} {...rest} />;
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
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest?.(".ellipsis-menu")) setOpen(false);
        };
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    useEffect(() => {
        if (open && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;

            // Position menu to the left of the button, vertically aligned
            setPosition({
                top: spaceBelow > 120 ? rect.bottom + 8 : rect.top - 120,
                left: rect.right - 160 // 160px = menu width (40 * 4)
            });
        }
    }, [open]);

    return (
        <div className="ellipsis-menu inline-block">
            <button
                ref={buttonRef}
                aria-haspopup="menu"
                aria-expanded={open}
                disabled={disabled}
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
                title="Actions"
            >
                <span className="sr-only">Actions</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#64748b">
                    <circle cx="5" cy="12" r="2"></circle>
                    <circle cx="12" cy="12" r="2"></circle>
                    <circle cx="19" cy="12" r="2"></circle>
                </svg>
            </button>

            {open && createPortal(
                <div
                    role="menu"
                    className="w-40 rounded-xl bg-white p-1"
                    style={{
                        position: 'fixed',
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        zIndex: 9999,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e5e7eb'
                    }}
                >
                    <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onView(); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                        <EyeIcon className="w-4 h-4" />
                        <span>View</span>
                    </button>
                    <button
                        role="menuitem"
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-red-50 text-red-600 mt-1 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                        <span>Delete</span>
                    </button>
                </div>,
                document.body
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
                className="input-enhanced inline-flex items-center gap-2 rounded-xl px-4 py-3"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                {label}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {open && (
                <div className="absolute z-20 mt-2 w-44 rounded-xl bg-white border p-2" style={{ boxShadow: 'var(--shadow-lg)' }}>
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
            className={`w-full text-left rounded-lg px-3 py-2 hover:bg-gray-100 ${
                active ? "text-blue-800" : "text-gray-900"
            }`}
            style={active ? { backgroundColor: 'var(--doclab-blue-50)' } : {}}
            role="option"
            aria-selected={!!active}
        >
            {children}
        </button>
    );
}

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