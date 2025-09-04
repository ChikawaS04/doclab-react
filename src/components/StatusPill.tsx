type Status = "READY" | "PROCESSING" | "FAILED";

export default function StatusPill({ status }: { status: Status }) {
    const map: Record<Status, string> = {
        READY: "bg-green-100 text-green-700",
        PROCESSING: "bg-yellow-100 text-yellow-700",
        FAILED: "bg-red-100 text-red-700",
    };
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {status}
    </span>
    );
}
