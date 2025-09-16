import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listDocuments, deleteDocument } from "../api/documents";
import StatusPill from "../components/StatusPill";
import { Link } from "react-router-dom";
import { useState } from "react";
import { safeDateStr, toUiStatus } from "../lib/viewUtils";
import type { DocumentListItemDTO, Page } from "../api/types";
import { useNavigate } from "react-router-dom";

export default function DocumentsIndexPage() {
    const [q, setQ] = useState("");
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    //const [pageSize] = useState(25);

    const [sort, setSort] = useState<"uploadDate,desc" | "uploadDate,asc">(
        "uploadDate,desc"
    );

    const { data, isLoading, isError, refetch } = useQuery<Page<DocumentListItemDTO>>({
        queryKey: ["documents", { page: 1, pageSize: 25, q }],
        queryFn: ({ queryKey }) => {
            const [, params] = queryKey as [
                "documents",
                { page: number; pageSize: number; q: string }
            ];
            return listDocuments(params);
        },
    });

    const rows = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;

    const remove = useMutation({
        mutationFn: (id: string) => deleteDocument(id),
        onSuccess: () => {
            // refresh the list after a successful delete
            qc.invalidateQueries({ queryKey: ["documents"] });
        },
    });

    const nav = useNavigate();

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">All Documents</h1>
                <div className="flex items-center gap-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (isUuidLike(q)) nav(`/documents/${q.trim()}`);
                            else refetch(); // server q search (fileName/docType)
                        }
                    }}
                    placeholder="Search by ID, file name, or doc type…"
                    className="rounded-xl border px-3 py-2 text-sm"
                />
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as any)}
                    className="rounded-lg border px-2 py-1 text-sm"
                >
                    <option value="uploadDate,desc">Created ↓</option>
                    <option value="uploadDate,asc">Created ↑</option>
                </select>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="rounded-lg border px-3 py-1 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>Page {page} / {totalPages}</span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="rounded-lg border px-3 py-1 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-50 text-left text-sm text-gray-600">
                    <tr>
                        <th className="p-3 w-[280px]">Document ID</th>
                        <th className="p-3 w-1/3">File name</th>
                        <th className="p-3 w-28">File type</th>
                        <th className="p-3 w-40">Document type</th>
                        <th className="p-3 w-40">Created</th>
                        <th className="p-3 w-28">Status</th>
                        <th className="p-3 w-24">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {isLoading && (
                        <tr>
                            <td className="p-4 text-sm text-gray-500" colSpan={7}>
                                Loading…
                            </td>
                        </tr>
                    )}
                    {isError && (
                        <tr>
                            <td className="p-4 text-sm text-red-600" colSpan={7}>
                                Failed to load.{" "}
                                <button className="underline" onClick={() => refetch()}>
                                    Retry
                                </button>
                            </td>
                        </tr>
                    )}

                    {rows.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="p-3 font-mono text-xs truncate" title={d.id}>{d.id}</td>
                            <td className="p-3 truncate">
                                <Link to={`/documents/${d.id}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md">
                                    {d.fileName}
                                </Link>
                            </td>
                            <td className="p-3">{extFromType(d.fileType)}</td>
                            <td className="p-3">{d.docType || "—"}</td>
                            <td className="p-3">{safeDateStr(d.uploadDate)}</td>
                            <td className="p-3"><StatusPill status={toUiStatus(d.status)} /></td>
                            <td className="p-3">
                                <div className="flex items-center gap-3">
                                    <Link to={`/documents/${d.id}`} className="text-sm underline">View</Link>
                                    {/* Delete button already wired earlier */}
                                    <button
                                        onClick={() => { if (confirm("Delete this document?")) remove.mutate(d.id) }}
                                        className="text-sm text-red-600 hover:underline"
                                        disabled={remove.isPending}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}

                    {!isLoading && !isError && rows.length === 0 && (
                        <tr>
                            <td className="p-4 text-sm text-gray-500" colSpan={7}>
                                No documents found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
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

function isUuidLike(s: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.trim());
}

