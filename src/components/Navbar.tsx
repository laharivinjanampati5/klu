"use client";
import { useStore } from "@/lib/store";
import { Bell, Sun, Moon, Globe, Menu, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
    const { theme, toggleTheme, setSidebarOpen, sidebarOpen, activeNav } = useStore();
    const [lang, setLang] = useState<"en" | "hi">("en");

    const PAGE_TITLES: Record<string, string> = {
        dashboard: "Dashboard",
        upload: "Data Upload Center",
        graph: "Knowledge Graph Explorer",
        reconciliation: "Reconciliation Engine",
        vendors: "Vendor Risk Dashboard",
        audit: "Audit Trail Generator",
    };

    return (
        <header className="navbar" style={{ height: 64, display: "flex", alignItems: "center", padding: "0 24px", gap: 16 }}>
            {/* Mobile menu toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    display: "none", alignItems: "center", justifyContent: "center",
                    width: 36, height: 36, borderRadius: 8,
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    color: "var(--text-secondary)", cursor: "pointer",
                }}
                className="mobile-menu-btn"
            >
                <Menu size={16} />
            </button>

            {/* Page title */}
            <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                    {PAGE_TITLES[activeNav] || "Dashboard"}
                </h1>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>
                    {lang === "en" ? "India's Most Intelligent GST Reconciliation Platform" : "भारत का सबसे बुद्धिमान GST समाधान मंच"}
                </div>
            </div>

            {/* Right controls */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {/* AI badge */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 6, padding: "5px 12px",
                    borderRadius: 20, background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)", fontSize: 12, fontWeight: 600,
                    color: "var(--emerald)",
                }}>
                    <Sparkles size={12} />
                    AI Active
                </div>

                {/* Language toggle */}
                <button
                    onClick={() => setLang(l => l === "en" ? "hi" : "en")}
                    title="Toggle Language"
                    style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                        borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border)",
                        color: "var(--text-secondary)", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    }}
                >
                    <Globe size={13} />
                    {lang === "en" ? "EN" : "हि"}
                </button>

                {/* Theme toggle */}
                <button
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text-secondary)", cursor: "pointer",
                    }}
                >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                </button>

                {/* Notifications */}
                <button
                    style={{
                        width: 36, height: 36, borderRadius: 8, position: "relative",
                        background: "var(--bg-card)", border: "1px solid var(--border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text-secondary)", cursor: "pointer",
                    }}
                >
                    <Bell size={15} />
                    <span style={{
                        position: "absolute", top: 7, right: 7, width: 7, height: 7,
                        borderRadius: "50%", background: "#F97316",
                        border: "1.5px solid var(--bg-primary)",
                    }} />
                </button>

                {/* User avatar */}
                <div style={{
                    width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
                    background: "linear-gradient(135deg, #1E3A8A, #2563EB)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: 14,
                    border: "2px solid var(--border)",
                }}>
                    G
                </div>
            </div>
        </header>
    );
}
