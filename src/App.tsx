import { Outlet } from "react-router-dom";
import TopNav from "./components/TopNav";

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <TopNav />
            <main className="container mx-auto max-w-6xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}
