"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Download, ChevronDown, ChevronUp, FileText, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AuditPage() {
    const { mismatches, graphBuilt, loadDemoData, setActiveNav } = useStore();
    const [expanded, setExpanded] = useState<Set<string>>(new Set());

    useEffect(() => { setActiveNav("audit"); }, [setActiveNav]);

    const toggle = (id: string) => {
        setExpanded(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const GRAPH_PATH_STEPS = [
        "Your GSTIN",
        "→ Purchase Register",
        "→ GSTR-1 (Supplier)",
        "→ GSTR-2B (Your)",
        "→ GSTR-3B (Your)",
    ];

    if (!graphBuilt) {
        return (
            <div className="page-enter" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>📋</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>No Audit Trails Yet</div>
                    <div style={{ color: "var(--text-muted)", marginBottom: 24 }}>Load demo data to generate explainable audit trails.</div>
                    <button className="btn-primary" onClick={() => { loadDemoData(); toast.success("Demo data loaded!"); }}>
                        <FileText size={15} /> Generate Audit Trails
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter">
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Explainable Audit Trail</h2>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Step-by-step AI explanation for each mismatch with graph path evidence</p>
                </div>
                <button className="btn-secondary" onClick={() => toast.info("PDF export will download shortly…")}>
                    <Download size={14} /> Download PDF Report
                </button>
            </div>

            {/* Warning banner */}
            <div style={{
                display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
                borderRadius: 12, background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)",
                marginBottom: 24,
            }}>
                <AlertCircle size={18} color="#F97316" />
                <div style={{ fontSize: 13 }}>
                    <strong style={{ color: "#F97316" }}>Action Required:</strong>
                    <span style={{ color: "var(--text-secondary)", marginLeft: 6 }}>
                        {mismatches.filter(m => m.riskLevel === "High").length} high-risk mismatches need immediate attention before next GST filing.
                    </span>
                </div>
            </div>

            {/* Audit cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {mismatches.map((m, i) => {
                    const isOpen = expanded.has(m.id);
                    return (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="glass-card" style={{ overflow: "hidden" }}>
                            {/* Card header */}
                            <div
                                onClick={() => toggle(m.id)}
                                style={{
                                    padding: "16px 20px", cursor: "pointer",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                    borderLeft: `4px solid ${m.riskLevel === "High" ? "#EF4444" : m.riskLevel === "Medium" ? "#EAB308" : "#10B981"}`,
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 13, color: "var(--emerald)" }}>
                                            {m.invoiceNo}
                                        </div>
                                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.vendorName}</div>
                                    </div>
                                    <span className={`badge-${m.riskLevel.toLowerCase()}`} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 700 }}>
                                        {m.riskLevel} Risk · Score {m.riskScore}
                                    </span>
                                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                                        Δ₹{m.amountDiff.toLocaleString()} | Tax Δ₹{m.taxDiff.toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Click to {isOpen ? "collapse" : "expand"}</span>
                                    {isOpen ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                                </div>
                            </div>

                            {/* Expanded detail */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        style={{ overflow: "hidden" }}>
                                        <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                                            {/* AI Explanation */}
                                            <div style={{
                                                padding: 16, borderRadius: 12,
                                                background: "linear-gradient(135deg, rgba(16,185,129,0.05), rgba(37,99,235,0.05))",
                                                border: "1px solid rgba(16,185,129,0.15)", marginBottom: 16,
                                            }}>
                                                <div style={{ fontSize: 11, color: "var(--emerald)", fontWeight: 700, marginBottom: 8 }}>🤖 AI ANALYSIS</div>
                                                <div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>
                                                    "{m.rootCause}"
                                                </div>
                                                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8, lineHeight: 1.6 }}>
                                                    <strong>Detailed explanation:</strong> {m.details} The graph path analysis reveals a discontinuity between
                                                    the {m.source1} declaration and the corresponding {m.source2} entry. This indicates a potential
                                                    {m.riskLevel === "High" ? " deliberate suppression or fraudulent reporting" : " data entry error or timing difference"} requiring
                                                    {m.riskLevel === "High" ? " immediate escalation to the GST department" : " reconciliation with the supplier before next filing"}.
                                                </div>
                                            </div>

                                            {/* Graph path visualization */}
                                            <div style={{ marginBottom: 16 }}>
                                                <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 10 }}>📍 GRAPH PATH</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
                                                    {GRAPH_PATH_STEPS.map((step, si) => (
                                                        <div key={si} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                            <div style={{
                                                                padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                                background: si === 3 ? "rgba(239,68,68,0.15)" : "var(--bg-secondary)",
                                                                color: si === 3 ? "#EF4444" : "var(--text-secondary)",
                                                                border: `1px solid ${si === 3 ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                                                            }}>{step}</div>
                                                            {si < GRAPH_PATH_STEPS.length - 1 && (
                                                                <div style={{ fontSize: 14, color: "var(--text-muted)" }}>→</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div style={{ marginTop: 8, fontSize: 12, color: "#EF4444" }}>
                                                    ⚠ Break detected at GSTR-2B — invoice not found in supplier's return
                                                </div>
                                            </div>

                                            {/* Key data points */}
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                                                {[
                                                    { label: "GSTR-1 Amount", value: `₹${(m.amountDiff + 100000).toLocaleString()}`, color: "var(--text-primary)" },
                                                    { label: "GSTR-2B Amount", value: `₹${(100000).toLocaleString()}`, color: "#EF4444" },
                                                    { label: "Difference", value: `₹${m.amountDiff.toLocaleString()}`, color: "#F97316" },
                                                    { label: "GSTIN", value: m.gstin.slice(0, 15) + "…", color: "var(--text-secondary)" },
                                                    { label: "Source", value: `${m.source1} ↔ ${m.source2}`, color: "var(--text-secondary)" },
                                                    { label: "Risk Score", value: `${m.riskScore}/100`, color: m.riskScore >= 70 ? "#EF4444" : "#EAB308" },
                                                ].map(d => (
                                                    <div key={d.label} style={{ padding: 10, borderRadius: 8, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                                                        <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: d.color, fontFamily: d.label.includes("GSTIN") ? "monospace" : "inherit" }}>{d.value}</div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: "flex", gap: 10 }}>
                                                <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => toast.success("PDF audit report generated!")}>
                                                    <Download size={13} /> Download PDF Audit Card
                                                </button>
                                                <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => toast.info("Notification sent to vendor GSTIN.")}>
                                                    📧 Notify Vendor
                                                </button>
                                                <button className="btn-secondary" style={{ fontSize: 12, color: "#EF4444", borderColor: "rgba(239,68,68,0.3)" }}
                                                    onClick={() => toast.error("Flagged for manual review.")}>
                                                    🚩 Flag for Review
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", padding: "24px 0", fontSize: 12, color: "var(--text-muted)" }}>
                Built as prototype for FinTech/GovTech Graph AI challenge · GST GraphRecon AI
            </div>
        </div>
    );
}
