import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadDocument, listDocuments } from "../api/documents";
import StatusPill from "../components/StatusPill";
import { safeDateStr, toUiStatus } from "../lib/viewUtils";
import { Link, useNavigate } from "react-router-dom";

export default function UploadPage() {
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const qc = useQueryClient();
    const nav = useNavigate();

    const recent = useQuery({
        queryKey: ["documents", { page: 1, pageSize: 5 }],
        queryFn: () => listDocuments({ page: 1, pageSize: 5 }),
        refetchOnWindowFocus: false,
    });

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
        <section className="space-y-10">
            {/* Hidden file input (never show native control) */}
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
                    "mx-auto max-w-4xl rounded-2xl border-2 border-dashed p-12 text-center shadow-sm transition",
                    "bg-white/90 backdrop-blur",
                    dragOver
                        ? "border-[color:var(--doclab-blue-400)] bg-[color:var(--doclab-blue-50)]"
                        : "border-[color:var(--doclab-slate-300)]",
                ].join(" ")}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    onFiles(e.dataTransfer.files);
                }}
            >
                {/* icon */}
                <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-[color:var(--doclab-slate-100)] shadow-sm">
                    <UploadIcon />
                </div>

                <h1 className="text-heading text-[28px] mb-2">Upload Document</h1>
                <p className="text-[16px] text-[color:var(--doclab-slate-600)]">
                    Drag and drop your file here, or click to browse
                </p>

                {/* Button that triggers hidden input */}
                <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary inline-flex items-center rounded-xl px-6 py-3 text-white"
                    >
                        Choose File
                    </button>
                    {mut.isPending && (
                        <span className="text-sm text-[color:var(--doclab-slate-600)]">Uploading…</span>
                    )}
                </div>

                {/* Progress bar */}
                {progress !== null && (
                    <div className="mx-auto mt-4 h-2 w-80 overflow-hidden rounded-full bg-[color:var(--doclab-slate-200)]">
                        <div
                            className="h-full bg-[color:var(--doclab-blue-600)] transition-all"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}
                {mut.isError && (
                    <div className="mt-3 text-sm text-red-600">Upload failed. Try again.</div>
                )}

                {/* Supported types with dots */}
                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                    <TypeDot label="PDF" className="bg-[color:var(--doclab-blue-500)]" />
                    <TypeDot label="DOCX" className="bg-[color:var(--doclab-blue-300)]" />
                    <TypeDot label="TXT" className="bg-[color:var(--doclab-slate-400)]" />
                </div>
            </div>

            {/* Recent uploads */}
            <div className="space-y-2">
                <h2 className="text-heading text-[24px]">Recent Uploads</h2>
                <p className="text-sm text-[color:var(--doclab-slate-600)]">Your latest documents</p>

                <div className="mt-4 rounded-2xl bg-white shadow-sm">
                    {recent.isLoading && (
                        <div className="p-6 text-center text-sm text-[color:var(--doclab-slate-600)]">Loading…</div>
                    )}

                    {recent.isError && (
                        <div className="p-6 text-center text-sm text-red-600">
                            Failed to load
                            {recent.error instanceof Error ? `: ${recent.error.message}` : "."}
                        </div>
                    )}

                    {recent.data?.items?.length
                        ? recent.data.items.map((d) => (
                            <div
                                key={d.id}
                                className="flex items-center justify-between gap-4 px-5 py-4 first:rounded-t-2xl last:rounded-b-2xl hover:bg-[color:var(--doclab-slate-50)] border-b last:border-b-0"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--doclab-slate-100)]">
                                        <FileIcon />
                                    </div>
                                    <div className="min-w-0">
                                        <Link
                                            to={`/documents/${d.id}`}
                                            className="block truncate text-[15px] text-[color:var(--doclab-slate-900)] hover:underline"
                                            title={d.fileName}
                                        >
                                            {d.fileName}
                                        </Link>
                                        <div className="text-xs text-[color:var(--doclab-slate-500)]">
                                            {safeDateStr(d.uploadDate)}
                                        </div>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <StatusPill status={toUiStatus(d.status)} />
                                </div>
                            </div>
                        ))
                        : !recent.isLoading && (
                        <div className="p-6 text-center text-sm text-[color:var(--doclab-slate-600)]">
                            No uploads yet.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ---------------- icons & bits ---------------- */
function UploadIcon() {
    return (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.6">
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

function TypeDot({ label, className }: { label: string; className: string }) {
    return (
        <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      <span className="text-[color:var(--doclab-slate-700)]">{label}</span>
    </span>
    );
}
