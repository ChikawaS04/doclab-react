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

    return (
        <header
            className={[
                "sticky top-0 z-50 border-b bg-white",
                scrolled ? "shadow-sm" : "shadow-none",
            ].join(" ")}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <div className="mx-auto w-full px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem' }}>
                <div className="flex justify-between items-center h-16">
                    {/* Brand (left) */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group"
                        style={{ textDecoration: 'none' }}
                    >
                        <div
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-white shadow-sm"
                            style={{ backgroundColor: 'var(--doclab-blue-600)' }}
                        >
                            {/* simple doc icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M7 3h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="white" strokeWidth="1.6"/>
                                <path d="M14 3v5h5" stroke="white" strokeWidth="1.6"/>
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <div className="text-xl font-semibold tracking-tight text-gray-900">DocLab</div>
                            <div className="text-xs text-gray-500 -mt-0.5">Document Intelligence</div>
                        </div>
                    </Link>

                    {/* Centered nav */}
                    <nav className="hidden md:flex items-center gap-2">
                        <NavLink
                            to="/"
                            end
                            className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? '#dbeafe' : 'transparent',
                                color: isActive ? '#1e40af' : '#374151',
                                textDecoration: 'none',
                            })}
                            onMouseEnter={(e) => {
                                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = '#bfdbfe';
                                }
                            }}
                            onMouseLeave={(e) => {
                                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                                e.currentTarget.style.backgroundColor = isActive ? '#dbeafe' : 'transparent';
                            }}
                        >
                            Upload
                        </NavLink>

                        <NavLink
                            to="/documents"
                            className="rounded-xl px-4 py-2 text-sm font-medium transition-colors"
                            style={({ isActive }) => ({
                                backgroundColor: isActive ? '#dbeafe' : 'transparent',
                                color: isActive ? '#1e40af' : '#374151',
                                textDecoration: 'none',
                            })}
                            onMouseEnter={(e) => {
                                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = '#bfdbfe';
                                }
                            }}
                            onMouseLeave={(e) => {
                                const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                                e.currentTarget.style.backgroundColor = isActive ? '#dbeafe' : 'transparent';
                            }}
                        >
                            Documents
                        </NavLink>
                    </nav>

                    {/* Right column intentionally empty to keep nav centered */}
                    <div className="justify-self-end" />
                </div>
            </div>
        </header>
    );
}