import { Link, NavLink } from "react-router-dom";

export default function TopNav() {
    const linkBase =
        "rounded-lg px-3 py-2 text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";

    return (
        <header className="border-b bg-white">
            <div className="container mx-auto max-w-6xl px-6 py-3 flex items-center justify-between">
                {/* Brand → click to go home (Upload page) */}
                <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-90">
                    DocLab
                </Link>

                <nav className="flex items-center gap-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `${linkBase} ${isActive ? "bg-gray-100 font-medium" : "text-gray-700"}`
                        }
                        end
                    >
                        Upload
                    </NavLink>
                    <NavLink
                        to="/documents"
                        className={({ isActive }) =>
                            `${linkBase} ${isActive ? "bg-gray-100 font-medium" : "text-gray-700"}`
                        }
                    >
                        Documents
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}
