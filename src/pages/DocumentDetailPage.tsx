import { Link, useParams } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import { useDocumentWithPolling } from "../lib/useDocumentPolling";
import { safeDateStr, toUiStatus } from "../lib/viewUtils";

export default function DocumentDetailPage() {
    const { id = "" } = useParams();
    const { data: doc, isLoading, isError } = useDocumentWithPolling(id);

    if (isLoading) return <div>Loading…</div>;
    if (isError || !doc) return <div className="text-red-600">Unable to load document.</div>;

    const isPdf = (doc.fileType || "").includes("pdf");
    const downloadHref =
        doc.downloadUrl ||
        `${(import.meta as any).env.VITE_API_BASE_URL?.replace(/\/+$/, "")}/documents/${doc.id}/download`;

    return (
        <section className="space-y-6">
            <Link to="/documents" className="text-sm text-gray-600 hover:underline">← Back to Documents</Link>

            <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold">{doc.fileName}</h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                        <span>📅 {safeDateStr(doc.uploadDate)}</span>
                        <StatusPill status={toUiStatus(doc.status)} />
                    </div>
                </div>
                <a href={downloadHref} className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">⬇ Download</a>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-1">
                    <h2 className="mb-3 text-xl font-semibold">Summary</h2>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                        {doc.summary?.text || "No summary available yet."}
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-1">
                    <h2 className="mb-3 text-xl font-semibold">Extracted Fields</h2>
                    {doc.extractedFields?.length ? (
                        <dl className="divide-y">
                            {doc.extractedFields.map((f, i) => (
                                <div key={i} className="grid grid-cols-2 gap-2 py-2 text-sm">
                                    <dt className="text-gray-500">{f.name}</dt>
                                    <dd className="text-gray-800">{f.value}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="text-sm text-gray-600">No fields extracted.</p>
                    )}
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-1">
                    <h2 className="mb-3 text-xl font-semibold">File Preview</h2>
                    {isPdf ? (
                        <embed src={downloadHref} type="application/pdf" className="h-64 w-full rounded-xl border" />
                    ) : (
                        <div className="grid h-64 place-items-center rounded-xl border border-dashed text-sm text-gray-600">
                            Preview Not Available
                        </div>
                    )}
                    <a href={downloadHref} className="mt-3 inline-flex rounded-full border px-4 py-2 text-sm">Open File</a>
                </div>
            </div>
        </section>
    );
}
