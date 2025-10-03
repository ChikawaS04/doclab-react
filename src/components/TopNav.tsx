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
                "sticky top-0 z-50 border-b transition-all duration-200",
                scrolled ? "shadow-md" : "shadow-none",
            ].join(" ")}
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
            }}
        >
            <div className="mx-auto w-full px-6 lg:px-8" style={{ maxWidth: '1200px' }}>
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 group"
                        style={{ textDecoration: 'none' }}
                    >
                        <div
                            className="relative flex items-center justify-center w-11 h-11 rounded-xl shadow-md transition-transform duration-200 group-hover:scale-105"
                            style={{
                                background: 'linear-gradient(135deg, var(--doclab-blue-600) 0%, var(--doclab-blue-700) 100%)',
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <path d="M7 3h7l4 4v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 3v5h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M9 13h6M9 17h4" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="leading-tight">
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-blue-600">
                                DocLab
                            </h1>
                            <p className="text-xs font-medium text-gray-500 -mt-0.5">
                                Document Intelligence
                            </p>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                [
                                    "relative px-5 py-2 text-sm font-semibold transition-all duration-200 rounded-lg",
                                    isActive
                                        ? "text-white"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                                ].join(" ")
                            }
                            style={({ isActive }) =>
                                isActive ? {
                                    background: 'linear-gradient(135deg, var(--doclab-blue-600) 0%, var(--doclab-blue-700) 100%)',
                                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
                                    textDecoration: 'none',
                                } : {
                                    textDecoration: 'none',
                                }
                            }
                        >
                            <span className="relative z-10">Upload</span>
                        </NavLink>

                        <NavLink
                            to="/documents"
                            className={({ isActive }) =>
                                [
                                    "relative px-5 py-2 text-sm font-semibold transition-all duration-200 rounded-lg",
                                    isActive
                                        ? "text-white"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50",
                                ].join(" ")
                            }
                            style={({ isActive }) =>
                                isActive ? {
                                    background: 'linear-gradient(135deg, var(--doclab-blue-600) 0%, var(--doclab-blue-700) 100%)',
                                    boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)',
                                    textDecoration: 'none',
                                } : {
                                    textDecoration: 'none',
                                }
                            }
                        >
                            <span className="relative z-10">Documents</span>
                        </NavLink>
                    </nav>
                </div>
            </div>
        </header>
    );
}