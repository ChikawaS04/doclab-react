import { useQuery } from "@tanstack/react-query";
import { getDocument } from "../api/documents";
import type { DocumentDTO } from "../api/types";

export function useDocumentWithPolling(id: string) {
    return useQuery<DocumentDTO, Error, DocumentDTO, ["document", string]>({
        queryKey: ["document", id],
        enabled: !!id,
        // v5: queryFn receives context; use id from queryKey if you like
        queryFn: ({ queryKey }) => getDocument(queryKey[1]),
        // v5: refetchInterval gets the Query instance, not (data)
        refetchInterval: (query) => {
            const doc = query.state.data as DocumentDTO | undefined;
            return doc?.status === "PROCESSING" ? 2500 : false; // poll while processing
        },
    });
}
