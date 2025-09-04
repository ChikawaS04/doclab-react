import { Link } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import { useState } from "react";

const MOCK = [
    { id: "1", title: "Q3 Financial Report", filename: "q3_financial_report.pdf", type: "PDF", size: "2.4 MB", created: "2024-08-15", status: "READY" as const },
    { id: "2", title: "Identity Document",   filename: "id_document.png",          type: "PNG", size: "1.2 MB", created: "2024-08-14", status: "PROCESSING" as const },
    { id: "3", title: "Error Report",        filename: "error_log.txt",            type: "TXT", size: "45 KB",  created: "2024-08-11", status: "FAILED" as const },
];

export default function DocumentsIndexPage() {
    const [q, setQ] = useState("");
    const rows = MOCK.filter(r =>
        (r.title + " " + r.filename).toLowerCase().includes(q.toLowerCase())
    );

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">All Documents</h1>
                <div className="flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search documents…"
                        className="rounded-xl border px-3 py-2 text-sm"
                    />
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                <table className="w-full table-fixed">
                    <thead className="bg-gray-50 text-left text-sm text-gray-600">
                    <tr>
                        <th className="p-3">Title</th>
                        <th className="p-3 w-1/4">File Name</th>
                        <th className="p-3 w-24">Type</th>
                        <th className="p-3 w-24">Size</th>
                        <th className="p-3 w-40">Created Date</th>
                        <th className="p-3 w-28">Status</th>
                        <th className="p-3 w-16">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y">
                    {rows.map((d) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="p-0">
                                <Link
                                    to={`/documents/${d.id}`}
                                    className="block p-3 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
                                >
                                    {d.title}
                                </Link>
                            </td>
                            <td className="p-3 truncate">{d.filename}</td>
                            <td className="p-3">{d.type}</td>
                            <td className="p-3">{d.size}</td>
                            <td className="p-3">{d.created}</td>
                            <td className="p-3"><StatusPill status={d.status} /></td>
                            <td className="p-3 text-center">⋯</td>
                        </tr>
                    ))}
                    {!rows.length && (
                        <tr><td className="p-4 text-sm text-gray-500" colSpan={7}>No documents found.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-end gap-2">
                <button className="rounded-md border px-3 py-1.5 text-sm" disabled>Previous</button>
                <span className="text-sm text-gray-600">Page 1 of 1</span>
                <button className="rounded-md border px-3 py-1.5 text-sm" disabled>Next</button>
            </div>
        </section>
    );
}
