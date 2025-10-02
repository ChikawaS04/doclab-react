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
            const id = (resp as any).id;
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
            {/* Hidden input (avoid native button) */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => onFiles(e.target.files)}
            />

            {/* Dropzone */}
            <div
                className={[
                    "card border-2 border-dashed p-12 text-center transition",
                    dragOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
                ].join(" ")}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
            >
                <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-gray-100 text-gray-700 shadow-sm">
                    <UploadIcon />
                </div>

                <h1 className="mb-2 text-2xl font-semibold tracking-tight">Upload Document</h1>
                <p className="text-base text-gray-600">
                    Drag and drop your file here, or click to browse
                </p>

                <div className="mt-8 flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl bg-blue-600 px-6 py-3 text-white shadow-sm hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                        Choose File
                    </button>
                    {mut.isPending && <span className="text-sm text-gray-600">Uploading…</span>}
                </div>

                {progress !== null && (
                    <div className="mx-auto mt-4 h-2 w-80 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                )}
                {mut.isError && <div className="mt-3 text-sm text-red-600">Upload failed. Try again.</div>}

                <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-700">
                    <TypeDot label="PDF" dotClass="bg-blue-600" />
                    <TypeDot label="DOCX" dotClass="bg-blue-400" />
                    <TypeDot label="TXT" dotClass="bg-gray-400" />
                </div>
            </div>

            {/* Recent uploads */}
            <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Recent Uploads</h2>
                <p className="text-sm text-gray-600">Your latest documents</p>

                <div className="card mt-4 divide-y">
                    {recent.isLoading && (
                        <div className="p-6 text-center text-sm text-gray-600">Loading…</div>
                    )}

                    {recent.isError && (
                        <div className="p-6 text-center text-sm text-red-600">
                            Failed to load
                            {recent.error instanceof Error ? `: ${recent.error.message}` : "."}
                        </div>
                    )}

                    {recent.data?.items?.length ? (
                        recent.data.items.map((d) => (
                            <div
                                key={d.id}
                                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-100">
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
                                        <div className="text-xs text-gray-500">{safeDateStr(d.uploadDate)}</div>
                                    </div>
                                </div>

                                <div className="shrink-0">
                                    <StatusPill status={toUiStatus(d.status)} />
                                </div>
                            </div>
                        ))
                    ) : (
                        !recent.isLoading && (
                            <div className="p-6 text-center text-sm text-gray-600">No uploads yet.</div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}

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

function TypeDot({ label, dotClass }: { label: string; dotClass: string }) {
    return (
        <span className="inline-flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span>{label}</span>
    </span>
    );
}
