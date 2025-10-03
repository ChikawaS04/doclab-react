import { Outlet } from "react-router-dom";
import TopNav from "./components/TopNav";

export default function App() {
    return (
        <div className="min-h-screen">
            <TopNav />
            <main className="mx-auto w-full px-6 md:px-8 py-8" style={{ maxWidth: '1200px' }}>
                <Outlet />
            </main>
        </div>
    );
}

