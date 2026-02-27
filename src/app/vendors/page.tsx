"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

function RiskBar({ score }: { score: number }) {
    const color = score >= 70 ? "#EF4444" : score >= 40 ? "#EAB308" : "#10B981";
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "var(--border)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${score}%`, borderRadius: 3, background: color, transition: "width 1s ease" }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 28 }}>{score}</span>
        </div>
    );
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
    if (trend === "up") return <TrendingUp size={14} color="#EF4444" />;
    if (trend === "down") return <TrendingDown size={14} color="#10B981" />;
    return <Minus size={14} color="#EAB308" />;
}

export default function VendorsPage() {
    const { vendors, loadDemoData, graphBuilt, setActiveNav } = useStore();
    const [search, setSearch] = useState("");
    const [filterRisk, setFilterRisk] = useState("All");
    const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

    useEffect(() => { setActiveNav("vendors"); }, [setActiveNav]);

    const filtered = vendors
        .filter(v => filterRisk === "All" || v.predictedRisk === filterRisk)
        .filter(v => search === "" || v.name.toLowerCase().includes(search.toLowerCase()) || v.gstin.includes(search))
        .sort((a, b) => b.riskScore - a.riskScore);

    if (!graphBuilt) {
        return (
            <div className="page-enter" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🛡️</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>No Vendor Data Available</div>
                    <div style={{ color: "var(--text-muted)", marginBottom: 24 }}>Load demo data to see vendor risk profiles.</div>
                    <button className="btn-primary" onClick={() => { loadDemoData(); toast.success("Demo data loaded!"); }}>
                        <Shield size={15} /> Load Demo Vendors
                    </button>
                </div>
            </div>
        );
    }

    const highCount = vendors.filter(v => v.predictedRisk === "High").length;
    const medCount = vendors.filter(v => v.predictedRisk === "Medium").length;
    const lowCount = vendors.filter(v => v.predictedRisk === "Low").length;

    return (
        <div className="page-enter">
            {/* Summary row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                    { label: "Total Vendors", value: vendors.length, color: "#2563EB" },
                    { label: "High Risk", value: highCount, color: "#EF4444" },
                    { label: "Medium Risk", value: medCount, color: "#EAB308" },
                    { label: "Low Risk", value: lowCount, color: "#10B981" },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: 16, textAlign: "center" }}>
                        <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                <input className="input-field" style={{ width: 280 }} placeholder="Search vendor name or GSTIN…" value={search} onChange={e => setSearch(e.target.value)} />
                <div style={{ display: "flex", gap: 4 }}>
                    {["All", "High", "Medium", "Low"].map(r => (
                        <button key={r} onClick={() => setFilterRisk(r)} style={{
                            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                            background: filterRisk === r ? (r === "High" ? "#EF4444" : r === "Medium" ? "#EAB308" : r === "Low" ? "#10B981" : "var(--emerald)") : "var(--bg-card)",
                            color: filterRisk === r ? "white" : "var(--text-secondary)", border: "1px solid var(--border)",
                        }}>{r}</button>
                    ))}
                </div>
                <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>{filtered.length} vendors</span>
            </div>

            {/* Table */}
            <div className="glass-card" style={{ overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Vendor / GSTIN</th>
                                <th>Risk Score</th>
                                <th>Trend</th>
                                <th>Mismatches</th>
                                <th>Total Value</th>
                                <th>Invoices</th>
                                <th>Compliance</th>
                                <th>AI Predicted</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((v, i) => (
                                <motion.tr key={v.gstin} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{v.name}</div>
                                        <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{v.gstin}</div>
                                    </td>
                                    <td style={{ minWidth: 130 }}><RiskBar score={v.riskScore} /></td>
                                    <td><TrendIcon trend={v.trend} /></td>
                                    <td>
                                        <span style={{ fontWeight: 700, color: v.mismatchCount > 2 ? "#EF4444" : v.mismatchCount > 0 ? "#EAB308" : "#10B981" }}>
                                            {v.mismatchCount}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>{formatCurrency(v.totalValue)}</td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{v.invoiceCount}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                            <div style={{ width: 50, height: 4, borderRadius: 2, background: "var(--border)", overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${v.complianceScore}%`, background: "#10B981", borderRadius: 2 }} />
                                            </div>
                                            <span style={{ fontSize: 12, color: "var(--emerald)" }}>{v.complianceScore}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-${v.predictedRisk.toLowerCase()}`} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                                            {v.predictedRisk}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}
                                            onClick={() => { setSelectedVendor(v.gstin); toast("Opening vendor subgraph…"); }}>
                                            <ExternalLink size={11} /> Details
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vendor detail modal placeholder */}
            {selectedVendor && (() => {
                const v = vendors.find(x => x.gstin === selectedVendor);
                if (!v) return null;
                return (
                    <div style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }} onClick={() => setSelectedVendor(null)}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20,
                                padding: 32, width: 500, maxWidth: "90vw",
                            }}>
                            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4, color: "var(--text-primary)" }}>{v.name}</div>
                            <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)", marginBottom: 20 }}>{v.gstin}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                                {[
                                    { label: "Risk Score", value: `${v.riskScore}/100`, color: v.riskScore >= 70 ? "#EF4444" : "#EAB308" },
                                    { label: "Mismatches", value: v.mismatchCount, color: "#F97316" },
                                    { label: "Total Value", value: formatCurrency(v.totalValue), color: "#10B981" },
                                    { label: "Compliance", value: `${v.complianceScore}%`, color: "#2563EB" },
                                ].map(s => (
                                    <div key={s.label} className="glass-card" style={{ padding: 12, textAlign: "center" }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{String(s.value)}</div>
                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ padding: 16, borderRadius: 10, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)", marginBottom: 16 }}>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6 }}>🤖 AI PREDICTION</div>
                                <div style={{ fontSize: 14, color: "var(--text-primary)" }}>
                                    Based on historical mismatch frequency and graph network density, this vendor is classified as <strong style={{ color: v.riskScore >= 70 ? "#EF4444" : "#EAB308" }}>{v.predictedRisk} Risk</strong>.
                                    {v.riskScore >= 70 ? " Consider escalating for detailed audit." : " Monitor for next quarter."}
                                </div>
                            </div>
                            <button className="btn-secondary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setSelectedVendor(null)}>Close</button>
                        </motion.div>
                    </div>
                );
            })()}
        </div>
    );
}
