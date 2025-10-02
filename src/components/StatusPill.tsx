type Status = "READY" | "PROCESSING" | "FAILED";

export default function StatusPill({ status }: { status: Status }) {
    const map: Record<Status, string> = {
        READY: "bg-green-100 text-green-800",
        PROCESSING: "bg-yellow-100 text-yellow-800",
        FAILED: "bg-red-100 text-red-800",
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${map[status]}`}
        >
      {status}
    </span>
    );
}
