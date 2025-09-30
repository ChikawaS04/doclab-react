import { Link, useNavigate, useParams } from "react-router-dom";
import StatusPill from "../components/StatusPill";
import { useDocumentWithPolling } from "../lib/useDocumentPolling";
import { buildDownloadUrl, deleteDocument } from "../api/documents";
import { safeDateStr, toUiStatus } from "../lib/viewUtils";
import { useMutation } from "@tanstack/react-query";

/* --- Group definitions & helpers --- */
const GROUPS: Record<string, string[]> = {
    "Party Information": ["LENDER", "BORROWER", "LENDER_ADDRESS", "BORROWER_LOCATION"],
    "Loan Details": ["PRINCIPAL_AMOUNT", "INTEREST_RATE", "MAXIMUM_ADDITIONAL_DEBT", "LATE_FEE"],
    "Contract Details": ["EFFECTIVE_DATE", "GOVERNING_LAW", "GRACE_PERIOD", "DEFAULT_NOTICE_PERIOD"],
};

function humanize(label: string) {
    return label.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function FieldCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {label}
            </div>
            <div className="mt-1 text-gray-900 font-medium">{value}</div>
        </div>
    );
}

export default function DocumentDetailPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();

    const { data: doc, isLoading, isError } = useDocumentWithPolling(id);

    const remove = useMutation({
        mutationFn: () => deleteDocument(id),
        onSuccess: () => {
            navigate("/documents");
        },
    });

    if (isLoading) return <div>Loading…</div>;
    if (isError || !doc) return <div className="text-red-600">Unable to load document.</div>;

    const href = doc.downloadable ? buildDownloadUrl(doc.id) : undefined;
    const canTryPreview = !!href && (doc.fileType || "").toLowerCase().includes("pdf");

    // Helper: known labels for "Other" grouping
    const known = new Set(Object.values(GROUPS).flat());
    const allFields = doc.fields || [];

    return (
        <section className="space-y-6">
            <Link to="/documents" className="text-sm text-gray-600 hover:underline">
                ← Back to Documents
            </Link>

            {/* Header + actions */}
            <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold">{doc.fileName}</h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                        <span>📅 {safeDateStr(doc.uploadDate)}</span>
                        <StatusPill status={toUiStatus(doc.status)} />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {href && (
                        <a
                            href={href}
                            className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                        >
                            ⬇ Download
                        </a>
                    )}
                    <button
                        disabled={remove.isPending}
                        onClick={() => {
                            if (!window.confirm("Delete this document? This cannot be undone.")) return;
                            remove.mutate();
                        }}
                        className={`rounded-full px-4 py-2 text-white ${
                            remove.isPending ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {remove.isPending ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>

            {/* Main grid: left content + sticky preview on the right */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Summary */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">
                        <h2 className="mb-3 text-xl font-semibold">Summary</h2>
                        {doc.summaries?.length ? (
                            <div className="space-y-4">
                                {doc.summaries.map((s, i) => (
                                    <div key={i}>
                                        {s.title && <div className="text-sm font-medium text-gray-700">{s.title}</div>}
                                        <div className="mt-1 text-sm text-gray-800 whitespace-pre-line">
                                            {s.summaryText || "—"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">No summary available yet.</p>
                        )}
                    </div>

                    {/* Extracted Information grouped into cards */}
                    <section className="rounded-2xl bg-white shadow-sm">
                        <div className="border-b px-5 py-4">
                            <h2 className="text-lg font-semibold">Extracted Information</h2>
                        </div>

                        <div className="space-y-8 p-5">
                            {Object.entries(GROUPS).map(([title, labels]) => {
                                const items = allFields.filter((f) => labels.includes(f.name));
                                if (!items.length) return null;

                                return (
                                    <div key={title}>
                                        <h3 className="mb-3 text-lg font-semibold">{title}</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {items.map((f, i) => (
                                                <FieldCard key={`${f.name}-${i}`} label={humanize(f.name)} value={f.value} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Other bucket */}
                            {(() => {
                                const others = allFields.filter((f) => !known.has(f.name));
                                if (!others.length) return null;
                                return (
                                    <div>
                                        <h3 className="mb-3 text-lg font-semibold">Other</h3>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            {others.map((f, i) => (
                                                <FieldCard key={`${f.name}-${i}`} label={humanize(f.name)} value={f.value} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </section>
                </div>

                {/* Sticky preview */}
                <div className="lg:col-span-1">
                    <div className="rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
                        <h2 className="mb-3 text-xl font-semibold">File Preview</h2>
                        {canTryPreview ? (
                            <embed src={href} type="application/pdf" className="h-[60vh] w-full rounded-xl border" />
                        ) : (
                            <div className="grid h-64 place-items-center rounded-xl border border-dashed text-sm text-gray-600">
                                Preview Not Available
                            </div>
                        )}
                        {href && (
                            <a href={href} className="mt-3 inline-flex rounded-full border px-4 py-2 text-sm">
                                Open File
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
