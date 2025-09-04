import { useState } from "react";
import StatusPill from "../components/StatusPill";

export default function UploadPage() {
    const [dragOver, setDragOver] = useState(false);

    // Temporary mock “recent uploads”
    const recent = [
        { id: "1", title: "Q3 Financial Report", filename: "q3_financial_report.pdf", status: "READY" as const },
        { id: "2", title: "Identity Document",   filename: "id_document.png",           status: "PROCESSING" as const },
        { id: "3", title: "Error Report",        filename: "error_log.txt",             status: "FAILED" as const },
    ];

    function onFiles(files: FileList | null) {
        const f = files?.[0];
        if (!f) return;
        // Later: call your real upload API.
        alert(`(Mock) Uploading: ${f.name}`);
    }

    return (
        <section className="space-y-10">
            <div
                className={`mx-auto max-w-3xl rounded-2xl border border-dashed bg-white p-10 text-center shadow-sm transition
          ${dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-300"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    onFiles(e.dataTransfer.files);
                }}
            >
                <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-gray-100 text-3xl">⤴</div>
                <h1 className="text-2xl font-semibold">Click or Drop File to Upload</h1>
                <p className="mt-1 text-sm text-gray-500">Supported formats: PDF, DOCX, TXT</p>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <label className="inline-flex cursor-pointer items-center rounded-full bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700">
                        <input type="file" className="hidden" onChange={(e) => onFiles(e.target.files)} />
                        Upload
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Recent Uploads</h2>
                <p className="text-sm text-gray-500">Your recently uploaded documents</p>

                <div className="mt-4 space-y-2 rounded-2xl bg-white p-4 shadow-sm">
                    {recent.map((d) => (
                        <div key={d.id} className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="grid h-9 w-9 place-items-center rounded-full bg-gray-100">📄</div>
                                <div>
                                    <div className="font-medium">{d.title}</div>
                                    <div className="text-xs text-gray-500">{d.filename}</div>
                                </div>
                            </div>
                            <StatusPill status={d.status} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
