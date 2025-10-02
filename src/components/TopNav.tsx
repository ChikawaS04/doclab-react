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
        "rounded-xl px-3.5 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]";

    return (
        <header
            className={[
                // sticky + glass
                "sticky top-0 z-40 backdrop-blur bg-white/80 border-b",
                // elevate after scroll for depth
                scrolled ? "shadow-sm" : "shadow-none",
            ].join(" ")}
        >
            <div className="mx-auto w-full max-w-[1200px] px-6 md:px-10 py-3 flex items-center justify-between">
                {/* Brand */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="h-9 w-9 rounded-2xl bg-[var(--doclab-blue-600)] text-white grid place-items-center shadow-sm">
                        {/* inline doc icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M7 3h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="white" strokeWidth="1.6"/>
                            <path d="M14 3v5h5" stroke="white" strokeWidth="1.6"/>
                            <path d="M8.5 12h7M8.5 15h7M8.5 18h7" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <div className="text-heading text-[20px] tracking-tight">DocLab</div>
                        <div className="text-[12px] text-[color:var(--doclab-slate-500)] -mt-0.5">
                            Document Intelligence
                        </div>
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
                                isActive
                                    ? "bg-[var(--doclab-blue-50)] text-[var(--doclab-blue-700)]"
                                    : "text-[color:var(--doclab-slate-700)] hover:bg-[var(--doclab-slate-100)]",
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
                                isActive
                                    ? "bg-[var(--doclab-blue-50)] text-[var(--doclab-blue-700)]"
                                    : "text-[color:var(--doclab-slate-700)] hover:bg-[var(--doclab-slate-100)]",
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
