import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadDocument, listDocuments } from "../api/documents";
import StatusPill from "../components/StatusPill";
import { safeDateStr, toUiStatus } from "../lib/viewUtils";
import { Link, useNavigate } from "react-router-dom";

export default function UploadPage() {
    // local UI state
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);

    // infra
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const qc = useQueryClient();
    const nav = useNavigate();

    // recent docs
    const recent = useQuery({
        queryKey: ["documents", { page: 1, pageSize: 5 }],
        queryFn: () => listDocuments({ page: 1, pageSize: 5 }),
        refetchOnWindowFocus: false,
    });

    // upload
    const mut = useMutation({
        mutationFn: (file: File) => uploadDocument(file, setProgress),
        onSuccess: (resp) => {
            const id = (resp as any).id; // DocumentDetailDTO | DocumentDTO
            qc.invalidateQueries({ queryKey: ["documents"] });
            setProgress(null);
            nav(`/documents/${id}`);
        },
        onError: () => setProgress(null),
    });

    function onFiles(files: FileList | null) {
        const f = files?.[0];
        if (!f) return;
        mut.mutate(f);
    }

    return (
        <section className="app-container space-y-10 py-8">
            {/* hidden file input to avoid native button styling */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => onFiles(e.target.files)}
            />

            {/* Dropzone card */}
            <div
                className={[
                    "card p-12 text-center dropzone-outline",
                    dragOver ? "bg-[var(--doclab-blue-50)]" : "bg-white",
                ].join(" ")}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
            >
                {/* icon */}
                <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-2xl bg-[var(--doclab-slate-100)] text-gray-700 shadow-sm">
                    <UploadIcon />
                </div>

                <h1 className="text-heading mb-2 text-[28px]">Upload Document</h1>
                <p className="text-base text-gray-600">
                    Drag and drop your file here, or click to browse
                </p>

                <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary px-6 py-3"
                    >
                        Choose File
                    </button>
                    {mut.isPending && (
                        <span className="text-sm text-gray-600">Uploading…</span>
                    )}
                </div>

                {progress !== null && (
                    <div className="mx-auto mt-4 h-2 w-80 overflow-hidden rounded-full bg-gray-200">
                        <div
                            className="h-full bg-[var(--doclab-blue-600)] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
                {mut.isError && (
                    <div className="mt-3 text-sm text-red-600">
                        Upload failed. Try again.
                    </div>
                )}

                {/* file-type legend */}
                <div className="mt-6 flex items-center justify-center gap-7 text-sm">
                    <LegendDot label="PDF"  dotClass="bg-emerald-500" />
                    <LegendDot label="DOCX" dotClass="bg-blue-500" />
                    <LegendDot label="TXT"  dotClass="bg-purple-500" />
                </div>
            </div>

            {/* Recent uploads */}
            <div className="space-y-2">
                <h2 className="text-heading text-[22px]">Recent Uploads</h2>
                <p className="text-sm text-gray-600">Your latest documents</p>

                <div className="card mt-2 overflow-hidden">
                    {recent.isLoading && (
                        <div className="p-6 text-center text-sm text-gray-600">
                            Loading…
                        </div>
                    )}

                    {recent.isError && (
                        <div className="p-6 text-center text-sm text-red-600">
                            Failed to load{recent.error instanceof Error ? `: ${recent.error.message}` : "."}
                        </div>
                    )}

                    {recent.data?.items?.length ? (
                        <ul className="divide-y">
                            {recent.data.items.map((d) => (
                                <li key={d.id} className="px-5 py-4 hover:bg-gray-50">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gray-100">
                                                <FileIcon />
                                            </div>
                                            <div className="min-w-0">
                                                <Link
                                                    to={`/documents/${d.id}`}
                                                    className="block truncate text-[15px] text-gray-900 hover:underline"
                                                    title={d.fileName}
                                                >
                                                    {d.fileName}
                                                </Link>
                                                <div className="text-xs text-gray-500">
                                                    {safeDateStr(d.uploadDate)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            <StatusPill status={toUiStatus(d.status)} />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !recent.isLoading && (
                            <div className="p-6 text-center text-sm text-gray-600">
                                No uploads yet.
                            </div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}

/* ---------- tiny inline icons ---------- */
function UploadIcon() {
    return (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8">
            <path d="M12 16V7" strokeLinecap="round" />
            <path d="M8.5 10.5 12 7l3.5 3.5" strokeLinecap="round" />
            <rect x="4" y="16" width="16" height="4" rx="1.5" />
        </svg>
    );
}
function FileIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.6">
            <path d="M7 3h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
            <path d="M14 3v5h5" />
        </svg>
    );
}
function LegendDot({ label, dotClass }: { label: string; dotClass: string }) {
    return (
        <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span className="text-gray-700">{label}</span>
    </span>
    );
}
