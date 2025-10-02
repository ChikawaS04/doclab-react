import { Outlet } from "react-router-dom";
import TopNav from "./components/TopNav";

export default function App() {
    return (
        <div className="min-h-screen">
            <TopNav />
            <main className="mx-auto w-full max-w-[1200px] px-6 md:px-10 py-8">
                <Outlet />
            </main>
        </div>
    );
}

