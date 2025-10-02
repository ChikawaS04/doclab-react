import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import UploadPage from "./pages/UploadPage";
import DocumentsIndexPage from "./pages/DocumentsIndexPage";
import DocumentDetailPage from "./pages/DocumentDetailPage";
import "./index.css";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            { index: true, element: <UploadPage /> },
            { path: "documents", element: <DocumentsIndexPage /> },
            { path: "documents/:id", element: <DocumentDetailPage /> },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>
);
console.log("API base:", import.meta.env.VITE_API_BASE_URL);
