import { Link, useParams } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import { useDocumentWithPolling } from "../lib/useDocumentPolling";

export default function DocumentDetailPage() {
    const { id = "" } = useParams();
    const { data: doc, isLoading, isError } = useDocumentWithPolling(id);

    if (isLoading) return <div>Loading…</div>;
    if (isError || !doc) return <div className="text-red-600">Unable to load document.</div>;

    const isPdf = (doc.contentType || "").includes("pdf");

    return (
        <section className="space-y-6">
            <Link to="/documents" className="text-sm text-gray-600 hover:underline">← Back to Documents</Link>

            <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold">{doc.title || doc.originalFilename}</h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                        <span>📅 {new Date(doc.createdAt).toLocaleString()}</span>
                        <StatusPill status={doc.status} />
                    </div>
                </div>
                <a href={doc.downloadUrl} className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">⬇ Download</a>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-1 md:col-start-1 md:row-start-1">
                    <h2 className="mb-3 text-xl font-semibold">Summary</h2>
                    <p className="text-sm text-gray-700 whitespace-pre-line">{doc.summary?.text || "No summary available yet."}</p>
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
                        <embed
                            src={doc.downloadUrl}
                            type="application/pdf"
                            className="h-64 w-full rounded-xl border"
                        />
                    ) : (
                        <div className="grid h-64 place-items-center rounded-xl border border-dashed text-sm text-gray-600">
                            Preview Not Available
                        </div>
                    )}
                    <a href={doc.downloadUrl} className="mt-3 inline-flex rounded-full border px-4 py-2 text-sm">Open File</a>
                </div>
            </div>
        </section>
    );
}
