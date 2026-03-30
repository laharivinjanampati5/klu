"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowRight, Play, Radar, ShieldAlert, Sparkles, Waves } from "lucide-react";
import { useStore } from "@/lib/store";
import { buildDigitalTwinSnapshot, buildFraudSignals, buildFraudSimulationScenarios, buildTrustSignals } from "@/lib/insights";
import { formatCurrency } from "@/lib/utils";

export default function FraudLabPage() {
  const { invoices, mismatches, vendors, loadDemoData, setActiveNav } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [injectedId, setInjectedId] = useState<string | null>(null);

  useEffect(() => {
    setActiveNav("fraudLab");
  }, [setActiveNav]);

  const scenarios = useMemo(() => buildFraudSimulationScenarios(mismatches, vendors), [mismatches, vendors]);
  const signals = useMemo(() => buildFraudSignals(mismatches, vendors), [mismatches, vendors]);
  const trustSignals = useMemo(() => buildTrustSignals(vendors, mismatches), [vendors, mismatches]);
  const twin = useMemo(() => buildDigitalTwinSnapshot(invoices, mismatches, vendors), [invoices, mismatches, vendors]);
  const active = scenarios.find((item) => item.id === activeId) ?? scenarios[0];

  const handleInject = () => {
    if (active) setInjectedId(active.id);
  };

  return (
    <div className="page-enter">
      <div className="glass-card" style={{ padding: 26, marginBottom: 22, background: "linear-gradient(135deg, rgba(139,92,246,0.14), rgba(14,165,233,0.08))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)", color: "#A78BFA", fontSize: 12, fontWeight: 700, marginBottom: 14 }}><Sparkles size={12} />Interactive Fraud Simulator</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>Fraud Simulator Lab</div>
            <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Select a fraud pattern, inject it into the GST graph story, and instantly see leakage risk, trust shock, and next-action guidance.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignSelf: "flex-start" }}>
            <button className="btn-secondary" onClick={loadDemoData}><Activity size={15} />Reload Demo Graph</button>
            <button className="btn-primary" onClick={handleInject}><Play size={15} />Inject Scenario</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        <div className="glass-card" style={{ padding: 18 }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Injected Scenario</div><div style={{ fontSize: 22, fontWeight: 800, color: injectedId ? "#8B5CF6" : "#94A3B8", marginTop: 8 }}>{injectedId ? "Active" : "Standby"}</div></div>
        <div className="glass-card" style={{ padding: 18 }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Projected Leakage</div><div style={{ fontSize: 22, fontWeight: 800, color: "#EF4444", marginTop: 8 }}>{formatCurrency(active?.leakageImpact ?? 0)}</div></div>
        <div className="glass-card" style={{ padding: 18 }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Twin Coverage</div><div style={{ fontSize: 22, fontWeight: 800, color: "#10B981", marginTop: 8 }}>{twin.coverage}%</div></div>
        <div className="glass-card" style={{ padding: 18 }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Signal Pressure</div><div style={{ fontSize: 22, fontWeight: 800, color: "#F59E0B", marginTop: 8 }}>{signals[0]?.severity ?? 0}%</div></div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 20, marginBottom: 22 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Choose a Scenario</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {scenarios.map((scenario) => {
              const isActive = scenario.id === active?.id;
              const isInjected = scenario.id === injectedId;
              return (
                <button key={scenario.id} onClick={() => setActiveId(scenario.id)} style={{ textAlign: "left", borderRadius: 14, padding: 14, border: isActive ? "1px solid rgba(139,92,246,0.35)" : "1px solid var(--border)", background: isActive ? "rgba(139,92,246,0.08)" : "var(--bg-secondary)", cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{scenario.title}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {isInjected && <span style={{ fontSize: 11, color: "#10B981", fontWeight: 700 }}>Injected</span>}
                      <span style={{ fontSize: 12, fontWeight: 700, color: scenario.color }}>{scenario.shockLabel}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55 }}>{scenario.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Scenario Control Panel</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Current active simulation</div>
            </div>
            <ShieldAlert size={18} color={active?.color ?? "#EF4444"} />
          </div>
          <div style={{ borderRadius: 14, padding: 16, background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.14)", marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{active?.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>{active?.description}</div>
            <div style={{ fontSize: 12, color: "#EF4444", fontWeight: 700 }}>Projected Leakage {formatCurrency(active?.leakageImpact ?? 0)}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 12 }}>
            {active?.metrics.map((metric) => (
              <div key={metric.label} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{metric.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: metric.color, marginTop: 6 }}>{metric.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{metric.helper}</div>
              </div>
            ))}
          </div>
          <div style={{ borderRadius: 12, padding: 14, background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.14)", marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "var(--emerald)", fontWeight: 700, marginBottom: 6 }}>Responder Action</div>
            <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{active?.responderAction}</div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={handleInject}><Play size={15} />Inject Scenario</button>
            <Link href="/reconciliation" onClick={() => setActiveNav("reconciliation")}><button className="btn-secondary">Open Reconciliation<ArrowRight size={14} /></button></Link>
            <Link href="/vendors" onClick={() => setActiveNav("vendors")}><button className="btn-secondary">Vendor Impact<ArrowRight size={14} /></button></Link>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Detection Signals</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>What the engine would flag</div></div><Radar size={18} color="#EF4444" /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{signals.map((signal) => <div key={signal.id} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{signal.title}</div><div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>{signal.severity}%</div></div><div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{signal.description}</div></div>)}</div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Trust Shockwave</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Downstream contagion and twin state</div></div><Waves size={18} color="#F59E0B" /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>{trustSignals.slice(0, 3).map((signal) => <div key={signal.id} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{signal.headline}</div><div style={{ fontSize: 12, fontWeight: 700, color: signal.color }}>{signal.trustScore}/100</div></div><div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{signal.summary}</div></div>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>{twin.signals.slice(0, 4).map((signal) => <div key={signal.label} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{signal.label}</div><div style={{ fontSize: 18, fontWeight: 800, color: signal.color, marginTop: 6 }}>{signal.value}</div><div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>{signal.helper}</div></div>)}</div>
        </div>
      </div>
    </div>
  );
}
