"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Activity, AlertTriangle, ArrowRight, CheckCircle, DollarSign, Network, Sparkles, TrendingDown, TrendingUp, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { getMismatchTrend, getRiskDistribution } from "@/lib/demoData";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { buildGraphMetrics } from "@/lib/insights";

const METRIC_CARDS = [
  { id: "itc", label: "Total ITC Claimed", icon: DollarSign, color: "#10B981", key: "totalITCClaimed", currency: true },
  { id: "mismatches", label: "Mismatches Detected", icon: AlertTriangle, color: "#F97316", key: "mismatches" },
  { id: "leakage", label: "Leakage Risk", icon: TrendingDown, color: "#EF4444", key: "leakageRisk", currency: true },
  { id: "compliance", label: "Compliance Score", icon: CheckCircle, color: "#10B981", key: "complianceScore", suffix: "%" },
];

export default function DashboardPage() {
  const { stats, mismatches, invoices, vendors, loadDemoData, graphBuilt, setActiveNav } = useStore();

  useEffect(() => {
    setActiveNav("dashboard");
  }, [setActiveNav]);

  const trendData = useMemo(() => getMismatchTrend(), []);
  const riskDistribution = useMemo(() => getRiskDistribution(mismatches), [mismatches]);
  const graphMetrics = useMemo(() => buildGraphMetrics(invoices, mismatches, vendors), [invoices, mismatches, vendors]);

  const topVendorData = useMemo(() => {
    return vendors
      .slice()
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 6)
      .map((vendor) => ({ name: vendor.name.split(" ")[0], value: vendor.totalValue, risk: vendor.riskScore }));
  }, [vendors]);

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success("Demo data loaded! 100 invoices ready.");
  };

  return (
    <div className="page-enter">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ borderRadius: 24, overflow: "hidden", marginBottom: 28, background: "linear-gradient(135deg, #0B1929 0%, #0F2941 52%, #12324B 100%)", border: "1px solid var(--border)", position: "relative", padding: "36px" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.06, backgroundImage: "radial-gradient(circle at 1px 1px, #10B981 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.28)", marginBottom: 16, fontSize: 12, fontWeight: 700, color: "var(--emerald)" }}><Sparkles size={12} />Powered by Knowledge Graph AI</div>
          <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.15, marginBottom: 10 }}><span className="gradient-text">Stop ITC Leakage.</span><br />Reconcile in Minutes with Knowledge Graphs.</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 620, marginBottom: 24, lineHeight: 1.6 }}>India&apos;s most intelligent GST reconciliation platform detect mismatches, trace audit paths, and score vendor risk in real-time.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/upload" onClick={() => setActiveNav("upload")}><button className="btn-primary" style={{ fontSize: 14, padding: "12px 22px" }}><Upload size={16} />Upload GST Data</button></Link>
            <button className="btn-secondary" onClick={handleLoadDemo}><Activity size={16} />Load Demo Data (100 invoices)</button>
          </div>
        </div>
      </motion.div>

      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16, marginBottom: 28 }}>
          {METRIC_CARDS.map((card) => {
            const Icon = card.icon;
            const rawValue = stats[card.key as keyof typeof stats] as number;
            return <div key={card.id} className="glass-card" style={{ padding: 20 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{card.label}</div><div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${card.color}1A` }}><Icon size={16} color={card.color} /></div></div><div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.currency ? formatCurrency(rawValue) : `${formatNumber(rawValue)}${card.suffix ?? ""}`}</div><div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}><TrendingUp size={11} color="var(--emerald)" />live reconciliation snapshot</div></div>;
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 32, marginBottom: 28, textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No data loaded yet</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 18 }}>Load the demo set to activate the dashboard charts, vendor risk views, and graph insights.</div><button className="btn-primary" onClick={handleLoadDemo}><Activity size={15} />Load Demo Data</button></div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Mismatch Trend</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Apr-Sep 2024</div></div><span style={{ fontSize: 11, color: "#EF4444", background: "rgba(239,68,68,0.1)", padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(239,68,68,0.2)" }}>↑ 3 this month</span></div>
          <ResponsiveContainer width="100%" height={240}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)" }} /><Line type="monotone" dataKey="mismatches" stroke="#F97316" strokeWidth={3} dot={{ fill: "#F97316", r: 4 }} /></LineChart></ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Risk Distribution</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 14 }}>By severity level</div>
          <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" paddingAngle={4}>{riskDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)" }} /></PieChart></ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{riskDistribution.map((item) => <div key={item.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)" }}><span style={{ width: 8, height: 8, borderRadius: 999, background: item.color, display: "inline-block" }} />{item.name}</span><span style={{ fontWeight: 700, color: item.color }}>{item.value}</span></div>)}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Top Vendors by Risk Value</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Mismatch amount (₹)</div></div><Link href="/vendors" onClick={() => setActiveNav("vendors")}><button className="btn-secondary" style={{ fontSize: 12, padding: "6px 12px" }}>View All<ArrowRight size={12} /></button></Link></div>
          <ResponsiveContainer width="100%" height={240}><BarChart data={topVendorData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text-primary)" }} /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#1E3A8A" /></BarChart></ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><div><div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>Knowledge Graph Pulse</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Live linked-entity coverage</div></div><Network size={18} color="#3B82F6" /></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>{graphMetrics.layers.map((layer) => <div key={layer.label}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}><span style={{ color: "var(--text-secondary)" }}>{layer.label}</span><span style={{ color: layer.color, fontWeight: 700 }}>{layer.value}%</span></div><div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}><div style={{ width: `${layer.value}%`, height: "100%", background: layer.color }} /></div></div>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}><div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Connected Invoices</div><div style={{ fontSize: 20, fontWeight: 800, color: "#3B82F6", marginTop: 6 }}>{formatNumber(graphMetrics.connectedInvoices)}</div></div><div style={{ borderRadius: 12, padding: 14, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}><div style={{ fontSize: 11, color: "var(--text-muted)" }}>Broken Chains</div><div style={{ fontSize: 20, fontWeight: 800, color: "#EF4444", marginTop: 6 }}>{formatNumber(graphMetrics.brokenChains)}</div></div></div>
        </div>
      </div>
    </div>
  );
}
