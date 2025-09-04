import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { uploadDocument, listDocuments } from "../api/documents";
import StatusPill from "../components/StatusPill";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);

    const qc = useQueryClient();
    const nav = useNavigate();

    const recent = useQuery({
        queryKey: ["documents", { page: 1, pageSize: 5 }],
        queryFn: () => listDocuments({ page: 1, pageSize: 5, sort: "createdAt", dir: "desc" }),
    });

    const mut = useMutation({
        mutationFn: (file: File) => uploadDocument(file, setProgress),
        onSuccess: (doc) => {
            qc.invalidateQueries({ queryKey: ["documents"] });
            setProgress(null);
            nav(`/documents/${doc.id}`);
        },
        onError: () => setProgress(null),
    });

    function onFiles(files: FileList | null) {
        const f = files?.[0];
        if (!f) return;
        // Optional: simple client-side allowlist
        const ok = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
        if (f.type && !ok.includes(f.type)) {
            // still allow; backend will enforce. You can show a toast here if you like.
        }
        mut.mutate(f);
    }

    return (
        <section className="space-y-10">
            <div
                className={`mx-auto max-w-3xl rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm transition
          ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-300"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
            >
                <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gray-100 text-3xl">⤴</div>
                <h1 className="text-2xl font-semibold">Click or Drop File to Upload</h1>
                <p className="mt-1 text-sm text-gray-500">Supported: PDF, DOCX, TXT</p>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <label className="inline-flex cursor-pointer items-center rounded-full bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700">
                        <input type="file" className="hidden" onChange={(e) => onFiles(e.target.files)} />
                        Upload
                    </label>
                    {mut.isPending && <span className="text-sm text-gray-600">Uploading…</span>}
                </div>

                {progress !== null && (
                    <div className="mx-auto mt-4 h-2 w-80 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
                    </div>
                )}
                {mut.isError && <div className="mt-3 text-sm text-red-600">Upload failed. Try again.</div>}
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Recent Uploads</h2>
                <p className="text-sm text-gray-500">Your latest documents</p>

                <div className="mt-4 space-y-2 rounded-2xl bg-white p-4 shadow-sm">
                    {recent.isLoading && <div className="p-6 text-center text-sm text-gray-500">Loading…</div>}
                    {recent.isError && <div className="p-6 text-center text-sm text-red-600">Failed to load.</div>}
                    {recent.data?.items?.map((d) => (
                        <div key={d.id} className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-100">📄</div>
                                <div>
                                    <div className="font-medium">{d.title || d.originalFilename}</div>
                                    <div className="text-xs text-gray-500">{d.originalFilename}</div>
                                </div>
                            </div>
                            <StatusPill status={d.status} />
                        </div>
                    ))}
                    {!recent.isLoading && !recent.data?.items?.length && (
                        <div className="p-6 text-center text-sm text-gray-500">No uploads yet.</div>
                    )}
                </div>
            </div>
        </section>
    );
}
