import { NavLink } from "react-router-dom";

export default function TopNav() {
    const base = "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm";
    const active = "bg-indigo-100 text-indigo-700";
    const idle = "text-gray-600 hover:bg-gray-100";

    return (
        <header className="border-b bg-white">
            <div className="container mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 grid place-items-center">
                        <span className="text-white text-sm">📄</span>
                    </div>
                    <span>DocLab</span>
                </div>
                <nav className="flex items-center gap-2">
                    <NavLink to="/" end className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
                        ⤴ Upload
                    </NavLink>
                    <NavLink to="/documents" className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
                        📑 Documents
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}
