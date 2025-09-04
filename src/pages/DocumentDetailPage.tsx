import { Link, useParams } from "react-router-dom";
import StatusPill from "../components/StatusPill";

const MOCK = {
    "1": {
        id: "1",
        title: "Q3 Financial Report",
        filename: "q3_financial_report.pdf",
        createdAt: "2024-08-15",
        status: "READY" as const,
        downloadUrl: "#",
        summary: "Quarterly earnings and KPI highlights for Q3 2024.",
        fields: [
            { name: "Document Number", value: "INV-2024-001" },
            { name: "Total Amount", value: "$12,458.00" },
        ],
    },
    "2": {
        id: "2",
        title: "Identity Document",
        filename: "id_document.png",
        createdAt: "2024-08-14",
        status: "PROCESSING" as const,
        downloadUrl: "#",
        summary: "",
        fields: [],
    },
    "3": {
        id: "3",
        title: "Error Report",
        filename: "error_log.txt",
        createdAt: "2024-08-11",
        status: "FAILED" as const,
        downloadUrl: "#",
        summary: "",
        fields: [],
    },
};

export default function DocumentDetailPage() {
    const { id = "1" } = useParams();
    const doc = (MOCK as any)[id] ?? MOCK["1"];

    return (
        <section className="space-y-6">
            <Link to="/documents" className="text-sm text-gray-600 hover:underline">← Back to Documents</Link>

            <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold">{doc.title || doc.filename}</h1>
                    <div className="mt-2 flex items-center gap-3 text-sm text-gray-600">
                        <span>📅 {doc.createdAt}</span>
                        <StatusPill status={doc.status} />
                    </div>
                </div>
                <a href={doc.downloadUrl} className="rounded-full bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">⬇ Download</a>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-1 md:col-start-1 md:row-start-1">
                    <h2 className="mb-3 text-xl font-semibold">Summary</h2>
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                        {doc.summary || "No summary available yet."}
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-1">
                    <h2 className="mb-3 text-xl font-semibold">Extracted Fields</h2>
                    {doc.fields?.length ? (
                        <dl className="divide-y">
                            {doc.fields.map((f: any, i: number) => (
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
                    <div className="grid h-64 place-items-center rounded-xl border border-dashed text-sm text-gray-600">
                        Preview Not Available
                    </div>
                    <a href={doc.downloadUrl} className="mt-3 inline-flex rounded-full border px-4 py-2 text-sm">Open File</a>
                </div>
            </div>
        </section>
    );
}
