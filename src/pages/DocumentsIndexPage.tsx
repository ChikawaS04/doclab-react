import { useQuery } from "@tanstack/react-query";
import { listDocuments } from "../api/documents";
import StatusPill from "../components/StatusPill";
import { Link } from "react-router-dom";
import { useState } from "react";
import { safeDateStr, toUiStatus } from "../lib/viewUtils";
import type { DocumentListItemDTO, Page } from "../api/types";

export default function DocumentsIndexPage() {
    const [q, setQ] = useState("");

    const { data, isLoading, isError, refetch } = useQuery<Page<DocumentListItemDTO>>({
        queryKey: ["documents", { page: 1, pageSize: 25, q }],
        // v5: use params from queryKey so cache keys and fetch args match
        queryFn: ({ queryKey }) => {
            const [, params] = queryKey as [
                "documents",
                { page: number; pageSize: number; q: string }
            ];
            return listDocuments(params);
        },
    });

    const rows = data?.items ?? [];

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">All Documents</h1>
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search documents…"
                    className="rounded-xl border px-3 py-2 text-sm"
                />
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-50 text-left text-sm text-gray-600">
                    <tr>
                        <th className="p-3">Document</th>
                        <th className="p-3 w-1/4">File Name</th>
                        <th className="p-3 w-24">Type</th>
                        <th className="p-3 w-24">Size</th>
                        <th className="p-3 w-40">Created</th>
                        <th className="p-3 w-28">Status</th>
                        <th className="p-3 w-16">Actions</th>
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
                            <td className="p-0">
                                <Link
                                    to={`/documents/${d.id}`}
                                    className="block p-3 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                                >
                                    {d.fileName}
                                </Link>
                            </td>
                            <td className="p-3 truncate">{d.fileName}</td>
                            <td className="p-3">{extFromType(d.fileType)}</td>
                            <td className="p-3">—</td> {/* no size from backend */}
                            <td className="p-3">{safeDateStr(d.uploadDate)}</td>
                            <td className="p-3">
                                <StatusPill status={toUiStatus(d.status)} />
                            </td>
                            <td className="p-3 text-center">
                                <Link to={`/documents/${d.id}`} className="text-sm underline">
                                    View
                                </Link>
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
