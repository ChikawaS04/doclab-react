export function safeDateStr(s?: string | null) {
    if (!s) return "—";
    const t = Date.parse(s);
    return isNaN(t) ? "—" : new Date(t).toLocaleString();
}

export function toUiStatus(s: string) {
    const x = (s || "").toUpperCase();
    if (x === "PROCESSED" || x === "READY" || x === "COMPLETED") return "READY";
    if (x === "PROCESSING" || x === "PENDING" || x === "IN_PROGRESS") return "PROCESSING";
    if (x === "FAILED" || x === "ERROR") return "FAILED";
    return "READY";
}