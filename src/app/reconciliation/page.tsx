"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { buildCausalityReplay, buildMonthlyCompliance, buildReconciliationCases, buildScenarioInsights } from "@/lib/insights";
import { AlertTriangle, Play, RefreshCw, Sparkles } from "lucide-react";

export default function ReconciliationPage() {
  const { mismatches, invoices, stats, runReconciliation, isReconciling, loadDemoData, graphBuilt, setActiveNav } = useStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  useEffect(() => {
    setActiveNav("reconciliation");
  }, [setActiveNav]);

  const cases = useMemo(() => buildReconciliationCases(mismatches, invoices), [mismatches, invoices]);
  const monthly = useMemo(() => buildMonthlyCompliance(mismatches), [mismatches]);
  const scenarios = useMemo(() => buildScenarioInsights(mismatches, []), [mismatches]);
  const activeCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const replay = activeCase ? buildCausalityReplay(mismatches.find((item) => item.id === activeCase.id) ?? mismatches[0]) : [];

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
              {cases.slice(0, 8).map((item) => (
                <button key={item.id} onClick={() => setSelectedCaseId(item.id)} style={{ textAlign: "left", borderRadius: 14, padding: 14, border: item.id === activeCase?.id ? "1px solid rgba(16,185,129,0.35)" : "1px solid var(--border)", background: item.id === activeCase?.id ? "rgba(16,185,129,0.08)" : "var(--bg-secondary)", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.invoiceNo}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.vendorName}</div></div><span className={`badge-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</span></div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>{item.rootCauseLabel}</div>
                  <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 700, marginTop: 6 }}>Exposure {formatCurrency(item.exposure)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>{item.recommendation}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
