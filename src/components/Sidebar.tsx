"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import {
    LayoutDashboard, Upload, Share2, GitMerge, ShieldAlert,
    FileText, ChevronLeft, ChevronRight, Zap, TrendingUp,
} from "lucide-react";

const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { id: "upload", label: "Data Upload", icon: Upload, href: "/upload" },
    { id: "graph", label: "Knowledge Graph", icon: Share2, href: "/graph" },
    { id: "reconciliation", label: "Reconciliation", icon: GitMerge, href: "/reconciliation" },
    { id: "vendors", label: "Vendor Risk", icon: ShieldAlert, href: "/vendors" },
    { id: "audit", label: "Audit Trail", icon: FileText, href: "/audit" },
];

export default function Sidebar() {
    const { sidebarOpen, setSidebarOpen, activeNav, setActiveNav, stats } = useStore();

    return (
        <aside
            className="sidebar"
            style={{ width: sidebarOpen ? "260px" : "70px" }}
        >
            {/* Logo */}
            <div style={{
                padding: "20px 16px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minHeight: "70px",
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "linear-gradient(135deg, #10B981, #059669)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <Zap size={18} color="white" />
                </div>
                {sidebarOpen && (
                    <div style={{ overflow: "hidden" }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1 }}>
                            GST GraphRecon
                        </div>
                        <div style={{ fontSize: 10, color: "var(--emerald)", fontWeight: 600, letterSpacing: "0.05em" }}>
                            AI PLATFORM
                        </div>
                    </div>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                    position: "absolute", top: 22, right: -12,
                    width: 24, height: 24, borderRadius: "50%",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text-secondary)", zIndex: 50,
                }}
            >
                {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>

            {/* Nav Items */}
            <nav style={{ padding: "12px 8px", flex: 1 }}>
                {sidebarOpen && (
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 8px 8px" }}>
                        MAIN MENU
                    </div>
                )}
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeNav === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setActiveNav(item.id)}
                            style={{
                                display: "flex", alignItems: "center", gap: 10,
                                padding: sidebarOpen ? "10px 12px" : "10px",
                                borderRadius: 10, marginBottom: 2, textDecoration: "none",
                                background: isActive ? "var(--emerald-glow)" : "transparent",
                                border: isActive ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                                color: isActive ? "var(--emerald)" : "var(--text-secondary)",
                                fontWeight: isActive ? 600 : 400, fontSize: 14,
                                transition: "all 0.15s",
                                justifyContent: sidebarOpen ? "flex-start" : "center",
                            }}
                        >
                            <Icon size={16} style={{ flexShrink: 0 }} />
                            {sidebarOpen && <span>{item.label}</span>}
                            {isActive && sidebarOpen && (
                                <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "var(--emerald)" }} />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Stats Summary */}
            {sidebarOpen && stats && (
                <div style={{
                    margin: "0 12px 16px",
                    padding: "12px",
                    borderRadius: 12,
                    background: "rgba(16,185,129,0.05)",
                    border: "1px solid rgba(16,185,129,0.15)",
                }}>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>
                        LIVE STATUS
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Compliance</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--emerald)" }}>{stats.complianceScore}%</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
                        <div style={{
                            height: "100%", borderRadius: 2,
                            width: `${stats.complianceScore}%`,
                            background: "linear-gradient(90deg, #10B981, #059669)",
                            transition: "width 1s ease",
                        }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
                        <TrendingUp size={10} color="var(--emerald)" />
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{stats.mismatches} mismatches found</span>
                    </div>
                </div>
            )}

            {/* Footer */}
            {sidebarOpen && (
                <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", fontSize: 10, color: "var(--text-muted)" }}>
                    Built for FinTech/GovTech Graph AI
                </div>
            )}
        </aside>
    );
}
