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
        "rounded-xl px-4 py-2 text-sm transition-colors focus:outline-none focus-visible:ring-2";

    return (
        <header
            className={[
                "sticky top-0 z-40 border-b bg-white",
                scrolled ? "shadow-sm" : "shadow-none",
            ].join(" ")}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            {/* 3-column grid centers the nav regardless of brand width */}
            <div className="app-container py-3 grid grid-cols-[1fr_auto_1fr] items-center">
                {/* Brand (left) */}
                <Link to="/" className="flex items-center gap-3 justify-self-start group">
                    <div
                        className="grid h-9 w-9 place-items-center rounded-2xl text-white shadow-sm"
                        style={{ backgroundColor: 'var(--doclab-blue-600)' }}
                    >
                        {/* simple doc icon */}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M7 3h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="white" strokeWidth="1.6"/>
                            <path d="M14 3v5h5" stroke="white" strokeWidth="1.6"/>
                        </svg>
                    </div>
                    <div className="leading-tight">
                        <div className="text-lg font-semibold tracking-tight">DocLab</div>
                        <div className="text-xs text-gray-500 -mt-0.5">Document Intelligence</div>
                    </div>
                </Link>

                {/* Centered nav */}
                <nav className="flex items-center gap-2 justify-self-center">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            [
                                linkBase,
                                isActive
                                    ? "text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100",
                            ].join(" ")
                        }
                        style={({ isActive }) =>
                            isActive ? { backgroundColor: 'var(--doclab-blue-50)' } : {}
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
                                    ? "text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100",
                            ].join(" ")
                        }
                        style={({ isActive }) =>
                            isActive ? { backgroundColor: 'var(--doclab-blue-50)' } : {}
                        }
                    >
                        Documents
                    </NavLink>
                </nav>

                {/* Right column intentionally empty to keep nav perfectly centered */}
                <div className="justify-self-end" />
            </div>
        </header>
    );
}