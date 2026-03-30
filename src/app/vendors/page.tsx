"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { buildFraudSignals, buildTrustSignals } from "@/lib/insights";
import { Activity, BellRing, ShieldAlert, Waves } from "lucide-react";

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VendorsPage() {
  const { vendors, mismatches, graphBuilt, loadDemoData, setActiveNav } = useStore();
  const [selectedGstin, setSelectedGstin] = useState<string | null>(null);

  useEffect(() => {
    setActiveNav("vendors");
  }, [setActiveNav]);

  const trustSignals = useMemo(() => buildTrustSignals(vendors, mismatches), [vendors, mismatches]);
  const fraudSignals = useMemo(() => buildFraudSignals(mismatches, vendors), [mismatches, vendors]);
  const selected = vendors.find((vendor) => vendor.gstin === selectedGstin) ?? vendors[0];
  const selectedTrust = trustSignals.find((item) => item.id === selected?.gstin);
  const notifications = selected?.notifications ?? [];

  return (
    <div className="page-enter">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div><div style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>Trust and Contagion Intelligence</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Vendor trust score, downstream exposure, and suspicious network behavior.</div></div>
        <button className="btn-primary" onClick={loadDemoData}><Activity size={15} />Load Demo Vendors</button>
      </div>

      {!graphBuilt ? (
        <div className="glass-card" style={{ padding: 28, textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 10 }}>No vendor intelligence yet</div><button className="btn-primary" onClick={loadDemoData}>Load Demo Data</button></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 20 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Vendor Trust Board</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {vendors.slice().sort((a, b) => b.riskScore - a.riskScore).map((vendor) => {
                const trust = trustSignals.find((item) => item.id === vendor.gstin);
                return (
                  <button key={vendor.gstin} onClick={() => setSelectedGstin(vendor.gstin)} style={{ textAlign: "left", borderRadius: 14, padding: 14, border: vendor.gstin === selected?.gstin ? "1px solid rgba(16,185,129,0.35)" : "1px solid var(--border)", background: vendor.gstin === selected?.gstin ? "rgba(16,185,129,0.08)" : "var(--bg-secondary)", cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{vendor.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, fontFamily: "monospace" }}>{vendor.gstin}</div></div><span className={`badge-${vendor.predictedRisk.toLowerCase()}`}>{vendor.predictedRisk}</span></div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 10 }}>
                      <div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Trust</div><div style={{ fontSize: 18, fontWeight: 800, color: trust?.color ?? "#10B981" }}>{trust?.trustScore ?? 0}</div></div>
                      <div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Mismatches</div><div style={{ fontSize: 18, fontWeight: 800, color: "#EF4444" }}>{vendor.mismatchCount}</div></div>
                      <div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Value</div><div style={{ fontSize: 18, fontWeight: 800, color: "#3B82F6" }}>{formatCurrency(vendor.totalValue)}</div></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Selected Vendor</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Trust and contagion profile</div></div><ShieldAlert size={18} color="#F97316" /></div>
              {selected && (<><div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", marginBottom: 4 }}>{selected.name}</div><div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, fontFamily: "monospace" }}>{selected.gstin}</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>{selected.flagged ? <span className="badge-high">Flagged</span> : null}{selected.reported ? <span className="badge-medium">Reported</span> : null}{notifications.length > 0 ? <span className="badge-pending">{notifications.length} Notifications</span> : null}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 14 }}><div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Trust Score</div><div style={{ fontSize: 22, fontWeight: 800, color: selectedTrust?.color ?? "#10B981" }}>{selectedTrust?.trustScore ?? 0}</div></div><div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Compliance</div><div style={{ fontSize: 22, fontWeight: 800, color: "#10B981" }}>{selected.complianceScore}%</div></div></div><div style={{ borderRadius: 12, padding: 14, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}><div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700, marginBottom: 6 }}>Contagion Note</div><div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>{selectedTrust?.summary ?? "No contagion summary available."}</div></div></>)}
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Vendor Notification Center</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Complaint and flag messages delivered only to the selected vendor</div></div><BellRing size={18} color="#3B82F6" /></div>
              {notifications.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {notifications.map((notification) => (
                    <div key={notification.id} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{notification.title}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: notification.type === "Flag" ? "#EF4444" : "#3B82F6" }}>{notification.type}</div>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{notification.message}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                        <span>{notification.invoiceNo} - {notification.origin}</span>
                        <span>{formatNotificationTime(notification.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)", fontSize: 13, color: "var(--text-secondary)" }}>
                  No notifications have been delivered to this vendor yet.
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Trust Shockwave</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Network exposure from risky vendors</div></div><Waves size={18} color="#8B5CF6" /></div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{trustSignals.map((signal) => (<div key={signal.id} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{signal.headline}</div><div style={{ fontSize: 12, fontWeight: 700, color: signal.color }}>{signal.trustScore}/100</div></div><div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{signal.summary}</div></div>))}</div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Fraud Signals Around Vendors</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{fraudSignals.map((signal) => (<div key={signal.id} style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{signal.title}</div><div style={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>{signal.severity}%</div></div><div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{signal.description}</div></div>))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
