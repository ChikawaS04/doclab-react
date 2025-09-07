import { useQuery } from "@tanstack/react-query";
import { getDocument } from "../api/documents";
import type { DocumentDetailDTO } from "../api/types";

export function useDocumentWithPolling(id: string) {
    return useQuery<DocumentDetailDTO, Error, DocumentDetailDTO, ["document", string]>({
        queryKey: ["document", id],
        enabled: !!id,
        queryFn: ({ queryKey }) => getDocument(queryKey[1]),
        refetchInterval: (query) => {
            const s = ((query.state.data as DocumentDetailDTO | undefined)?.status || "").toUpperCase();
            const busy = s === "PROCESSING" || s === "PENDING";
            return busy ? 2500 : false;
        },
    });
}
