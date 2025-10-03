import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
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

function CollapsibleSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-t pt-3 first:border-t-0 first:pt-0" style={{ borderColor: '#e5e7eb' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full mb-2 text-left group"
            >
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6b7280"
                    strokeWidth="2"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>
            {isOpen && <div>{children}</div>}
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
            {/* Header with Back button and Detail title */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold">Detail</h1>
                <Link
                    to="/documents"
                    className="text-sm text-gray-600 transition-colors rounded-lg px-3 py-2"
                    style={{ textDecoration: 'none' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    ← Back to Documents
                </Link>
            </div>

            {/* Header + actions card */}
            <div
                className="flex items-center justify-between rounded-2xl bg-white p-5"
                style={{ boxShadow: 'var(--shadow-card)' }}
            >
                <div className="flex items-center gap-3">
                    <div>
                        <h2 className="text-xl font-semibold">{doc.fileName}</h2>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                            <span>{safeDateStr(doc.uploadDate)}</span>
                            <StatusPill status={toUiStatus(doc.status)} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {href && (
                        <a
                            href={href}
                            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                            style={{ backgroundColor: '#2563eb' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </a>
                    )}
                    <button
                        disabled={remove.isPending}
                        onClick={() => {
                            if (!window.confirm("Delete this document? This cannot be undone.")) return;
                            remove.mutate();
                        }}
                        className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors ${
                            remove.isPending ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        {remove.isPending ? "Deleting…" : "Delete"}
                    </button>
                </div>
            </div>

            {/* Main grid: left content + sticky preview on the right */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    {/* Summary */}
                    <div
                        className="rounded-2xl bg-white p-6"
                        style={{ boxShadow: 'var(--shadow-card)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">Summary</h2>
                        </div>
                        {doc.summaries?.length ? (
                            <div className="space-y-4">
                                {doc.summaries.map((s, i) => (
                                    <div key={i} className="space-y-2">
                                        {s.title && (
                                            <div className="font-semibold text-gray-900">{s.title}</div>
                                        )}
                                        <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
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
                    <section
                        className="rounded-2xl bg-white transition-shadow"
                        style={{ boxShadow: 'var(--shadow-card)' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
                    >
                        <div className="border-b px-5 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                                        <rect x="9" y="3" width="6" height="4" rx="1"></rect>
                                        <path d="M9 12h6"></path>
                                        <path d="M9 16h6"></path>
                                    </svg>
                                </div>
                                <h2 className="text-lg font-semibold text-gray-900">Extracted Information</h2>
                            </div>
                        </div>

                        <div className="p-5 space-y-3">
                            {Object.entries(GROUPS).map(([title, labels]) => {
                                const items = allFields.filter((f) => labels.includes(f.name));
                                if (!items.length) return null;

                                return (
                                    <CollapsibleSection key={title} title={title}>
                                        <div className="space-y-1.5">
                                            {items.map((f, i) => (
                                                <div
                                                    key={`${f.name}-${i}`}
                                                    className="flex items-start justify-between py-2 px-3 rounded-lg"
                                                    style={{ backgroundColor: '#f9fafb' }}
                                                >
                                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 w-2/5">
                                                        {humanize(f.name)}
                                                    </dt>
                                                    <dd className="text-sm text-gray-900 w-3/5 text-right">{f.value}</dd>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleSection>
                                );
                            })}

                            {/* Other bucket */}
                            {(() => {
                                const others = allFields.filter((f) => !known.has(f.name));
                                if (!others.length) return null;
                                return (
                                    <CollapsibleSection title="Other">
                                        <div className="space-y-1.5">
                                            {others.map((f, i) => (
                                                <div
                                                    key={`${f.name}-${i}`}
                                                    className="flex items-start justify-between py-2 px-3 rounded-lg"
                                                    style={{ backgroundColor: '#f9fafb' }}
                                                >
                                                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 w-2/5">
                                                        {humanize(f.name)}
                                                    </dt>
                                                    <dd className="text-sm text-gray-900 w-3/5 text-right">{f.value}</dd>
                                                </div>
                                            ))}
                                        </div>
                                    </CollapsibleSection>
                                );
                            })()}
                        </div>
                    </section>
                </div>

                {/* Sticky preview */}
                <div className="lg:col-span-1">
                    <div
                        className="rounded-2xl bg-white p-6 lg:sticky lg:top-6 transition-shadow"
                        style={{ boxShadow: 'var(--shadow-card)' }}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-card)'}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: '#f3f4f6' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">File Preview</h2>
                        </div>
                        {canTryPreview ? (
                            <embed
                                src={href}
                                type="application/pdf"
                                className="w-full rounded-xl border mb-4"
                                style={{ height: '60vh' }}
                            />
                        ) : (
                            <div className="grid place-items-center rounded-xl border border-dashed text-sm text-gray-600 mb-4" style={{ height: '16rem' }}>
                                Preview Not Available
                            </div>
                        )}
                        {href && (
                            <div className="flex justify-center">
                                <a
                                    href={href}
                                    className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium text-gray-900 transition-colors"
                                    style={{ textDecoration: 'none' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dbeafe'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                    Open File
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}