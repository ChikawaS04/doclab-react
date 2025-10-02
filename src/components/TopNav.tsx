import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";

export default function TopNav() {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 0);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const linkBase =
        "rounded-xl px-3.5 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

    return (
        <header
            className={[
                "sticky top-0 z-40 border-b bg-white/80 backdrop-blur",
                scrolled ? "shadow-sm" : "shadow-none",
            ].join(" ")}
        >
            <div className="app-container py-3 flex items-center justify-between">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-600 text-white">
                        {/* simple doc icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M7 3h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="white" strokeWidth="1.6"/>
                            <path d="M14 3v5h5" stroke="white" strokeWidth="1.6"/>
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <div className="text-lg font-semibold tracking-tight">DocLab</div>
                        <div className="text-xs text-gray-500 -mt-0.5">Document Intelligence</div>
                    </div>
                </Link>

                {/* Nav */}
                <nav className="flex items-center gap-2">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            [
                                linkBase,
                                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100",
                            ].join(" ")
                        }
                    >
                        Upload
                    </NavLink>
                    <NavLink
                        to="/documents"
                        className={({ isActive }) =>
                            [
                                linkBase,
                                isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100",
                            ].join(" ")
                        }
                    >
                        Documents
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}
