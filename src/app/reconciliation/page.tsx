"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { buildCausalityReplay, buildMonthlyCompliance, buildReconciliationCases, buildScenarioInsights } from "@/lib/insights";
import VendorActionPanel from "@/components/VendorActionPanel";
import { AlertTriangle, ArrowRight, Play, RefreshCw, ShieldAlert, Sparkles } from "lucide-react";

function formatInvoiceDate(value?: string) {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRiskColor(level?: "High" | "Medium" | "Low") {
  if (level === "High") return "#EF4444";
  if (level === "Medium") return "#EAB308";
  return "#10B981";
}

export default function ReconciliationPage() {
  const { mismatches, invoices, stats, runReconciliation, isReconciling, loadDemoData, graphBuilt, setActiveNav } = useStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const detailPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveNav("reconciliation");
  }, [setActiveNav]);

  const cases = useMemo(() => buildReconciliationCases(mismatches, invoices), [mismatches, invoices]);
  const monthly = useMemo(() => buildMonthlyCompliance(mismatches), [mismatches]);
  const scenarios = useMemo(() => buildScenarioInsights(mismatches, []), [mismatches]);
  const activeCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const activeMismatch = activeCase ? mismatches.find((item) => item.id === activeCase.id) ?? mismatches[0] : mismatches[0];
  const activeInvoice = activeMismatch
    ? invoices.find((item) => item.invoiceNo === activeMismatch.invoiceNo && item.gstin === activeMismatch.gstin)
    : undefined;
  const activeRiskColor = getRiskColor(activeCase?.riskLevel);
  const replay = activeMismatch ? buildCausalityReplay(activeMismatch) : [];

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    requestAnimationFrame(() => {
      detailPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Causality Replay Reconciliation</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Risk-prioritized mismatches with replayable graph breaks and what-if support.</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn-secondary" onClick={loadDemoData}><Sparkles size={15} />Load Demo Graph</button>
          <button className="btn-primary" onClick={runReconciliation} disabled={isReconciling}>{isReconciling ? <><RefreshCw size={15} className="animate-spin" />Running</> : <><Play size={15} />Run Reconciliation</>}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[{ label: "Invoices", value: stats?.totalInvoices ?? 0, color: "#3B82F6" }, { label: "Mismatches", value: stats?.mismatches ?? 0, color: "#F97316" }, { label: "Missing", value: stats?.missing ?? 0, color: "#EF4444" }, { label: "Leakage Risk", value: stats ? formatCurrency(stats.leakageRisk) : formatCurrency(0), color: "#8B5CF6" }].map((item) => (
          <div key={item.label} className="glass-card" style={{ padding: 16 }}><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.label}</div><div style={{ fontSize: 26, fontWeight: 800, color: item.color, marginTop: 8 }}>{String(item.value)}</div></div>
        ))}
      </div>

      {!graphBuilt ? (
        <div className="glass-card" style={{ padding: 28, textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>No reconciliation graph yet</div><button className="btn-primary" onClick={loadDemoData}>Load Demo Data</button></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 14 }}>Priority Cases</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cases.length > 0 ? (
                cases.slice(0, 8).map((item) => (
                  <button key={item.id} onClick={() => handleSelectCase(item.id)} style={{ textAlign: "left", borderRadius: 14, padding: 14, border: item.id === activeCase?.id ? "1px solid rgba(16,185,129,0.35)" : "1px solid var(--border)", background: item.id === activeCase?.id ? "rgba(16,185,129,0.08)" : "var(--bg-secondary)", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.invoiceNo}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.vendorName}</div></div><span className={`badge-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</span></div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>{item.rootCauseLabel}</div>
                    <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 700, marginTop: 6 }}>Exposure {formatCurrency(item.exposure)}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>{item.recommendation}</div>
                  </button>
                ))
              ) : (
                <div style={{ borderRadius: 14, padding: 18, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-secondary)" }}>
                  No priority cases are available yet. Run reconciliation or load the demo graph to inspect case details.
                </div>
              )}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div ref={detailPanelRef} className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Selected Case Details</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Click a priority case to inspect its invoice, evidence chain, and remediation plan.</div>
                </div>
                {activeCase ? <span className={`badge-${activeCase.riskLevel.toLowerCase()}`}>{activeCase.riskLevel} Risk</span> : null}
              </div>

              {activeCase && activeMismatch ? (
                <>
                  <div style={{ borderRadius: 14, padding: 16, background: `${activeRiskColor}12`, border: `1px solid ${activeRiskColor}35`, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{activeCase.invoiceNo}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{activeCase.vendorName} - {activeMismatch.gstin}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: activeRiskColor }}>Risk score {activeCase.riskScore}/100</div>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{activeMismatch.details}</div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 14 }}>
                    {[
                      { label: "Exposure", value: formatCurrency(activeCase.exposure), color: "#EF4444" },
                      { label: "Amount Diff", value: formatCurrency(activeMismatch.amountDiff), color: "#F97316" },
                      { label: "Tax Diff", value: formatCurrency(activeMismatch.taxDiff), color: "#8B5CF6" },
                      { label: "Confidence", value: `${Math.max(72, activeCase.riskScore)}%`, color: "#10B981" },
                    ].map((metric) => (
                      <div key={metric.label} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{metric.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: metric.color, marginTop: 6 }}>{metric.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
                    {[
                      { label: "Supplier GSTIN", value: activeMismatch.gstin },
                      { label: "Invoice Date", value: formatInvoiceDate(activeInvoice?.invoiceDate) },
                      { label: "Supply Type", value: activeInvoice?.supplyType ?? "Not available" },
                      { label: "Booked Source", value: activeInvoice?.source ?? "Not available" },
                      { label: "Invoice Status", value: activeInvoice?.status ?? "Not linked" },
                      { label: "Primary Break", value: activeMismatch.rootCause },
                    ].map((detail) => (
                      <div key={detail.label} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>{detail.label}</div>
                        <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5 }}>{detail.value}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)", marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 700 }}>VALIDATION CHAIN</div>
                      <ShieldAlert size={16} color={activeRiskColor} />
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {[activeMismatch.source1, activeMismatch.source2, activeInvoice?.source ?? "Internal Review"].map((step, index) => (
                        <div key={`${step}-${index}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ padding: "6px 10px", borderRadius: 999, background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.18)", fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{step}</span>
                          {index < 2 ? <ArrowRight size={14} color="var(--text-muted)" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderRadius: 12, padding: 14, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)" }}>
                    <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700, marginBottom: 6 }}>NEXT ACTION</div>
                    <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{activeCase.recommendation}</div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <VendorActionPanel
                      gstin={activeMismatch.gstin}
                      vendorName={activeMismatch.vendorName}
                      invoiceNo={activeMismatch.invoiceNo}
                      rootCause={activeMismatch.rootCause}
                      recommendation={activeCase.recommendation}
                      origin="Reconciliation"
                    />
                  </div>
                </>
              ) : (
                <div style={{ borderRadius: 14, padding: 18, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-secondary)" }}>
                  Select a case from the priority list to open the detailed investigation panel.
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Causality Replay</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>How the mismatch became risky</div></div><AlertTriangle size={18} color="#F97316" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {replay.map((step, index) => (
                  <div key={step.step} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{index + 1}. {step.step}</span><span style={{ fontSize: 11, fontWeight: 700, color: step.status === "done" ? "#10B981" : step.status === "break" ? "#EF4444" : "#EAB308" }}>{step.status.toUpperCase()}</span></div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>{step.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Monthly Drift</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{monthly.map((month) => (<div key={month.month}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>{month.month}</span><span style={{ fontWeight: 700, color: month.score >= 85 ? "#10B981" : month.score >= 70 ? "#EAB308" : "#EF4444" }}>{month.score}%</span></div><div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}><div style={{ width: `${month.score}%`, height: "100%", background: month.score >= 85 ? "#10B981" : month.score >= 70 ? "#EAB308" : "#EF4444" }} /></div></div>))}</div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>What-if Simulation</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{scenarios.map((scenario) => (<div key={scenario.id} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{scenario.title}</div><div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{scenario.summary}</div></div>))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
