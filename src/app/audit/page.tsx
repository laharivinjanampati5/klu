"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { buildCausalityReplay, buildReconciliationCases } from "@/lib/insights";
import VendorActionPanel from "@/components/VendorActionPanel";
import { Download, FileText } from "lucide-react";

export default function AuditPage() {
  const { mismatches, invoices, graphBuilt, loadDemoData, setActiveNav } = useStore();
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  useEffect(() => {
    setActiveNav("audit");
  }, [setActiveNav]);

  const cases = useMemo(() => buildReconciliationCases(mismatches, invoices), [mismatches, invoices]);
  const activeCase = cases.find((item) => item.id === selectedCaseId) ?? cases[0];
  const activeMismatch = mismatches.find((item) => item.id === activeCase?.id) ?? mismatches[0];
  const replay = activeMismatch ? buildCausalityReplay(activeMismatch) : [];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div><div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Explainable Audit Trail</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Natural-language explanations, evidence path, and recommended action.</div></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button className="btn-secondary"><Download size={15} />Export PDF</button><button className="btn-primary" onClick={loadDemoData}><FileText size={15} />Load Audit Demo</button></div>
      </div>

      {!graphBuilt ? (
        <div className="glass-card" style={{ padding: 28, textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>No audit trail yet</div><button className="btn-primary" onClick={loadDemoData}>Load Demo Data</button></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 20 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Audit Cases</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{cases.slice(0, 8).map((item) => (<button key={item.id} onClick={() => setSelectedCaseId(item.id)} style={{ textAlign: "left", borderRadius: 14, padding: 14, border: item.id === activeCase?.id ? "1px solid rgba(16,185,129,0.35)" : "1px solid var(--border)", background: item.id === activeCase?.id ? "rgba(16,185,129,0.08)" : "var(--bg-secondary)", cursor: "pointer" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{item.invoiceNo}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{item.vendorName}</div></div><span className={`badge-${item.riskLevel.toLowerCase()}`}>{item.riskLevel}</span></div><div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>{item.rootCauseLabel}</div></button>))}</div>
          </div>

          <div className="glass-card" style={{ padding: 20 }}>
            {activeMismatch && (<><div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{activeMismatch.invoiceNo}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>{activeMismatch.vendorName} · Risk {activeMismatch.riskScore}/100</div><div style={{ borderRadius: 14, padding: 16, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", marginBottom: 14 }}><div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700, marginBottom: 8 }}>AI Narrative</div><div style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6 }}>This invoice was matched into the purchase chain, but the linked supplier evidence did not fully complete the expected GST reflection path. The break likely comes from {activeMismatch.rootCause.toLowerCase()}, which raises the claim to {activeMismatch.riskLevel.toLowerCase()} risk and justifies {activeCase?.recommendation?.toLowerCase() ?? "manual review"}.</div></div><div style={{ marginBottom: 14 }}><VendorActionPanel gstin={activeMismatch.gstin} vendorName={activeMismatch.vendorName} invoiceNo={activeMismatch.invoiceNo} rootCause={activeMismatch.rootCause} recommendation={activeCase?.recommendation ?? "Manual review"} origin="Audit Trail" /></div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>Evidence Path</div><div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>{replay.map((step, index) => (<div key={step.step} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{index + 1}. {step.step}</span><span style={{ fontSize: 11, fontWeight: 700, color: step.status === "done" ? "#10B981" : step.status === "break" ? "#EF4444" : "#EAB308" }}>{step.status.toUpperCase()}</span></div><div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6 }}>{step.note}</div></div>))}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}><div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Confidence</div><div style={{ fontSize: 20, fontWeight: 800, color: "#10B981" }}>{Math.max(72, activeMismatch.riskScore)}%</div></div><div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Amount Diff</div><div style={{ fontSize: 20, fontWeight: 800, color: "#EF4444" }}>{activeMismatch.amountDiff}</div></div><div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Tax Diff</div><div style={{ fontSize: 20, fontWeight: 800, color: "#F97316" }}>{activeMismatch.taxDiff}</div></div></div></>)}
          </div>
        </div>
      )}
    </div>
  );
}
