import { useQuery } from "@tanstack/react-query";
import { listDocuments } from "../api/documents";
import StatusPill from "../components/StatusPill";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function DocumentsIndexPage() {
    const [q, setQ] = useState("");
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["documents", { page: 1, pageSize: 25, q }],
        queryFn: () => listDocuments({ page: 1, pageSize: 25, q, sort: "createdAt", dir: "desc" }),
    });

    const rows = data?.items || [];

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
                        <th className="p-3">Title</th>
                        <th className="p-3 w-1/4">File Name</th>
                        <th className="p-3 w-24">Type</th>
                        <th className="p-3 w-24">Size</th>
                        <th className="p-3 w-40">Created</th>
                        <th className="p-3 w-28">Status</th>
                        <th className="p-3 w-16">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {isLoading && <tr><td className="p-4 text-sm text-gray-500" colSpan={7}>Loading…</td></tr>}
                    {isError && <tr><td className="p-4 text-sm text-red-600" colSpan={7}>Failed to load. <button className="underline" onClick={() => refetch()}>Retry</button></td></tr>}
                    {rows.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="p-0">
                                <Link to={`/documents/${d.id}`} className="block p-3 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md">
                                    {d.title || d.originalFilename}
                                </Link>
                            </td>
                            <td className="p-3 truncate">{d.originalFilename}</td>
                            <td className="p-3">{extFromType(d.contentType)}</td>
                            <td className="p-3">{formatSize(d.sizeBytes)}</td>
                            <td className="p-3">{new Date(d.createdAt).toLocaleString()}</td>
                            <td className="p-3"><StatusPill status={d.status} /></td>
                            <td className="p-3 text-center">⋯</td>
                        </tr>
                    ))}
                    {!isLoading && !isError && !rows.length && (
                        <tr><td className="p-4 text-sm text-gray-500" colSpan={7}>No documents found.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function extFromType(ct: string) {
    if (!ct) return "FILE";
    if (ct.includes("pdf")) return "PDF";
    if (ct.includes("word") || ct.includes("doc")) return "DOCX";
    if (ct.includes("text")) return "TXT";
    if (ct.includes("png")) return "PNG";
    if (ct.includes("jpeg") || ct.includes("jpg")) return "JPG";
    return "FILE";
}
function formatSize(n: number) {
    if (!n && n !== 0) return "";
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + " MB";
    if (n >= 1_000) return (n / 1_000).toFixed(0) + " KB";
    return n + " B";
}
