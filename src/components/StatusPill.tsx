type Status = "READY" | "PROCESSING" | "FAILED";

export default function StatusPill({ status }: { status: Status }) {
    const classMap: Record<Status, string> = {
        READY: "status-ready",
        PROCESSING: "status-processing",
        FAILED: "status-failed",
    };

    return (
        <span className={`status-pill ${classMap[status]}`}>
            {status}
        </span>
    );
}
