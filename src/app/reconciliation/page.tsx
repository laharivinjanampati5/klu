"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell,
} from "recharts";
import { getMismatchTrend } from "@/lib/demoData";
import { Play, Download, RefreshCw, ArrowUpDown, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const TAB_IDS = ["mismatches", "rootcause", "charts"];

export default function ReconciliationPage() {
    const { mismatches, stats, runReconciliation, isReconciling, reconciliationDone, graphBuilt, loadDemoData, setActiveNav } = useStore();
    const [activeTab, setActiveTab] = useState("mismatches");
    const [sortField, setSortField] = useState("riskScore");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [filterRisk, setFilterRisk] = useState<string>("All");
    const [search, setSearch] = useState("");

    useEffect(() => { setActiveNav("reconciliation"); }, [setActiveNav]);

    const handleRun = async () => {
        if (!graphBuilt) { loadDemoData(); await new Promise(r => setTimeout(r, 500)); }
        await runReconciliation();
        if (stats && stats.mismatches === 0) {
            confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ["#10B981", "#F97316", "#2563EB"] });
            toast.success("🎉 Perfect reconciliation! Zero mismatches detected.");
        } else {
            toast.success(`Reconciliation complete. ${stats?.mismatches || mismatches.length} mismatches found.`);
        }
    };

    const sorted = [...mismatches]
        .filter(m => filterRisk === "All" || m.riskLevel === filterRisk)
        .filter(m => search === "" || m.invoiceNo.toLowerCase().includes(search.toLowerCase()) || m.vendorName.toLowerCase().includes(search.toLowerCase()) || m.gstin.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const av = a[sortField as keyof typeof a] as number | string;
            const bv = b[sortField as keyof typeof b] as number | string;
            if (typeof av === "number" && typeof bv === "number") return sortDir === "desc" ? bv - av : av - bv;
            return sortDir === "desc" ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
        });

    const TREND_DATA = getMismatchTrend();

    const toggleSort = (field: string) => {
        if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortField(field); setSortDir("desc"); }
    };

    return (
        <div className="page-enter">
            {/* Header controls */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
                <button
                    className="btn-primary"
                    style={{ fontSize: 15, padding: "12px 28px" }}
                    onClick={handleRun}
                    disabled={isReconciling}
                >
                    {isReconciling ? <><RefreshCw size={15} className="animate-spin" /> Running…</> : <><Play size={15} /> Run Full Reconciliation</>}
                </button>
                {reconciliationDone && (
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                            borderRadius: 10, color: "var(--emerald)", fontSize: 13, fontWeight: 600
                        }}>
                        <CheckCircle size={14} /> Reconciliation Complete
                    </motion.div>
                )}
                <button className="btn-secondary" style={{ marginLeft: "auto" }} onClick={() => toast.info("Export coming soon!")}>
                    <Download size={14} /> Export Report
                </button>
            </div>

            {/* Summary stats */}
            {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                    {[
                        { label: "Total Invoices", value: stats.totalInvoices, color: "#2563EB" },
                        { label: "Matched", value: stats.matched, color: "#10B981" },
                        { label: "Mismatches", value: stats.mismatches, color: "#F97316" },
                        { label: "Missing", value: stats.missing, color: "#EF4444" },
                    ].map(s => (
                        <div key={s.label} className="glass-card" style={{ padding: 16, textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 4, background: "var(--bg-card)", padding: 4, borderRadius: 12, border: "1px solid var(--border)", marginBottom: 20, width: "fit-content" }}>
                {[
                    { id: "mismatches", label: "📋 Mismatch Table" },
                    { id: "rootcause", label: "🔍 Root Cause Analysis" },
                    { id: "charts", label: "📊 Visual Analytics" },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
                            background: activeTab === tab.id ? "var(--emerald)" : "transparent",
                            color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                            border: "none", transition: "all 0.2s",
                        }}
                    >{tab.label}</button>
                ))}
            </div>

            {/* Mismatch Table Tab */}
            {activeTab === "mismatches" && (
                <div className="glass-card" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                        <input className="input-field" style={{ width: 240 }} placeholder="Search invoice, vendor, GSTIN…" value={search} onChange={e => setSearch(e.target.value)} />
                        <div style={{ display: "flex", gap: 4 }}>
                            {["All", "High", "Medium", "Low"].map(r => (
                                <button key={r} onClick={() => setFilterRisk(r)} style={{
                                    padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    background: filterRisk === r ? (r === "High" ? "#EF4444" : r === "Medium" ? "#EAB308" : r === "Low" ? "#10B981" : "var(--emerald)") : "var(--bg-secondary)",
                                    color: filterRisk === r ? "white" : "var(--text-secondary)", border: "none",
                                }}>{r}</button>
                            ))}
                        </div>
                        <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>{sorted.length} records</span>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {[
                                        { key: "invoiceNo", label: "Invoice No" },
                                        { key: "gstin", label: "GSTIN" },
                                        { key: "vendorName", label: "Vendor" },
                                        { key: "amountDiff", label: "Amt Diff" },
                                        { key: "taxDiff", label: "Tax Diff" },
                                        { key: "rootCause", label: "Root Cause" },
                                        { key: "riskScore", label: "Risk Score" },
                                        { key: "riskLevel", label: "Risk Level" },
                                    ].map(col => (
                                        <th key={col.key} onClick={() => toggleSort(col.key)} style={{ cursor: "pointer", userSelect: "none" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                {col.label} <ArrowUpDown size={11} />
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {sorted.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
                                        {graphBuilt ? "No mismatches found! 🎉" : "Run reconciliation to see results"}
                                    </td></tr>
                                ) : sorted.map(m => (
                                    <tr key={m.id}>
                                        <td style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 12 }}>{m.invoiceNo}</td>
                                        <td style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>{m.gstin.slice(0, 15)}…</td>
                                        <td style={{ fontSize: 13 }}>{m.vendorName}</td>
                                        <td style={{ color: "#EF4444", fontWeight: 600 }}>₹{m.amountDiff.toLocaleString()}</td>
                                        <td style={{ color: "#F97316", fontWeight: 600 }}>₹{m.taxDiff.toLocaleString()}</td>
                                        <td style={{ fontSize: 12, color: "var(--text-secondary)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.rootCause}</td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <div style={{ width: 60, height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                                                    <div style={{ height: "100%", borderRadius: 3, width: `${m.riskScore}%`, background: m.riskScore >= 70 ? "#EF4444" : m.riskScore >= 40 ? "#EAB308" : "#10B981" }} />
                                                </div>
                                                <span style={{ fontSize: 12, fontWeight: 700, color: m.riskScore >= 70 ? "#EF4444" : m.riskScore >= 40 ? "#EAB308" : "#10B981" }}>{m.riskScore}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge-${m.riskLevel.toLowerCase()}`} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                                                {m.riskLevel}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Root Cause Tab */}
            {activeTab === "rootcause" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mismatches.slice(0, 8).map((m, i) => (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            className="glass-card" style={{ padding: 20 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                <div>
                                    <span style={{ fontFamily: "monospace", fontWeight: 700, color: "var(--emerald)", fontSize: 13 }}>{m.invoiceNo}</span>
                                    <span style={{ marginLeft: 10, fontSize: 12, color: "var(--text-muted)" }}>{m.vendorName}</span>
                                </div>
                                <span className={`badge-${m.riskLevel.toLowerCase()}`} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                                    {m.riskLevel} Risk
                                </span>
                            </div>
                            <div style={{ padding: 12, borderRadius: 10, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", marginBottom: 10 }}>
                                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, fontWeight: 600 }}>🤖 AI ROOT CAUSE</div>
                                <div style={{ fontSize: 14, color: "var(--text-primary)", fontStyle: "italic" }}>"{m.rootCause}"</div>
                            </div>
                            <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text-secondary)" }}>
                                <span>Amount Diff: <strong style={{ color: "#EF4444" }}>₹{m.amountDiff.toLocaleString()}</strong></span>
                                <span>Tax Diff: <strong style={{ color: "#F97316" }}>₹{m.taxDiff.toLocaleString()}</strong></span>
                                <span>Source: {m.source1} ↔ {m.source2}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Charts Tab */}
            {activeTab === "charts" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>Mismatch by Value</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={TREND_DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
                                <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} name="Value (₹)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="glass-card" style={{ padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>Supplier Compliance Trend</div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={TREND_DATA}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
                                <Line type="monotone" dataKey="mismatches" stroke="#10B981" strokeWidth={2.5} dot={{ fill: "#10B981", r: 4 }} name="Compliance %" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="glass-card" style={{ padding: 20, gridColumn: "span 2" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>Risk Heatmap (by Risk Score)</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
                            {mismatches.map(m => (
                                <div key={m.id} title={`${m.invoiceNo}: ${m.riskScore}`} style={{
                                    height: 28, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 9, fontWeight: 700, color: "white",
                                    background: m.riskScore >= 70 ? `rgba(239,68,68,${0.4 + m.riskScore / 200})` : m.riskScore >= 40 ? `rgba(234,179,8,${0.4 + m.riskScore / 200})` : `rgba(16,185,129,${0.3 + m.riskScore / 200})`,
                                }}>{m.riskScore}</div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
