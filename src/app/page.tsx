"use client";
import { useStore } from "@/lib/store";
import { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { getMismatchTrend, getRiskDistribution } from "@/lib/demoData";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  DollarSign, Activity, Upload, ArrowRight, Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

function AnimatedNumber({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 50;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{prefix}{formatNumber(display)}{suffix}</span>;
}

const METRIC_CARDS = [
  { id: "itc", label: "Total ITC Claimed", icon: DollarSign, color: "#10B981", key: "totalITCClaimed", prefix: "₹", isCurrency: true },
  { id: "mismatches", label: "Mismatches Detected", icon: AlertTriangle, color: "#F97316", key: "mismatches", prefix: "", isCurrency: false },
  { id: "leakage", label: "Leakage Risk (₹)", icon: TrendingDown, color: "#EF4444", key: "leakageRisk", prefix: "₹", isCurrency: true },
  { id: "compliance", label: "Compliance Score", icon: CheckCircle, color: "#10B981", key: "complianceScore", prefix: "", suffix: "%", isCurrency: false },
  { id: "highRisk", label: "High-Risk Vendors", icon: Activity, color: "#8B5CF6", key: "highRiskVendors", prefix: "", isCurrency: false },
];

const TREND_DATA = getMismatchTrend();

export default function DashboardPage() {
  const { stats, loadDemoData, graphBuilt, setActiveNav } = useStore();

  useEffect(() => {
    setActiveNav("dashboard");
  }, [setActiveNav]);

  const handleLoadDemo = () => {
    loadDemoData();
    toast.success("Demo data loaded! 100 invoices, 15 mismatches.", { icon: "🚀" });
  };

  const riskDist = stats ? getRiskDistribution(
    Array(stats.mismatches).fill(null).map((_, i) => ({
      id: `m${i}`, invoiceNo: "", gstin: "", vendorName: "",
      amountDiff: 0, taxDiff: 0, rootCause: "",
      riskLevel: i < 6 ? "High" : i < 10 ? "Medium" : "Low",
      riskScore: i < 6 ? 80 : i < 10 ? 55 : 25,
      source1: "", source2: "", details: "",
    }))
  ) : [];

  return (
    <div className="page-enter">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          borderRadius: 20, overflow: "hidden", marginBottom: 32,
          background: "linear-gradient(135deg, #0B1929 0%, #0D2137 40%, #0D1F2E 100%)",
          border: "1px solid var(--border)", position: "relative", padding: "40px 40px",
        }}
      >
        {/* Background pattern */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.05,
          backgroundImage: "radial-gradient(circle at 1px 1px, #10B981 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "4px 14px",
            borderRadius: 20, background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
            marginBottom: 16, fontSize: 12, fontWeight: 600, color: "var(--emerald)",
          }}>
            <Sparkles size={12} /> Powered by Knowledge Graph AI
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12, maxWidth: 600 }}>
            <span className="gradient-text">Stop ITC Leakage.</span><br />
            Reconcile in Minutes with Knowledge Graphs.
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 500, marginBottom: 28 }}>
            India's most intelligent GST reconciliation platform—detect mismatches, trace audit paths, and score vendor risk in real-time.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/upload" onClick={() => setActiveNav("upload")}>
              <button className="btn-primary" style={{ fontSize: 14, padding: "12px 24px" }}>
                <Upload size={16} /> Upload GST Data
              </button>
            </Link>
            <button className="btn-secondary" onClick={handleLoadDemo}>
              <Activity size={16} /> Load Demo Data (100 invoices)
            </button>
          </div>
        </div>
        {/* Decorative orb */}
        <div style={{
          position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)",
        }} />
      </motion.div>

      {/* Metric Cards */}
      {stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          {METRIC_CARDS.map((card, i) => {
            const Icon = card.icon;
            const val = stats[card.key as keyof typeof stats] as number;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: 20 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{card.label}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${card.color}1A`, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={15} color={card.color} />
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: card.color }}>
                  {card.isCurrency ? formatCurrency(val) : (
                    <AnimatedNumber target={val} prefix={card.prefix} suffix={(card as { suffix?: string }).suffix} />
                  )}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <TrendingUp size={10} color="var(--emerald)" />
                  vs last quarter
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 40, textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>No Data Loaded</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 20 }}>Upload your GST data or load the demo dataset to see metrics</div>
          <button className="btn-primary" onClick={handleLoadDemo}><Activity size={15} /> Load Demo Data</button>
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 32 }}>
          {/* Mismatch Trend */}
          <div className="glass-card" style={{ padding: 20, gridColumn: "span 2" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Mismatch Trend</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Apr–Sep 2024</div>
              </div>
              <span style={{ fontSize: 11, color: "#EF4444", background: "rgba(239,68,68,0.1)", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
                ↑ 3 this month
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
                <Line type="monotone" dataKey="mismatches" stroke="#F97316" strokeWidth={2.5} dot={{ fill: "#F97316", r: 4 }} activeDot={{ r: 6 }} name="Mismatches" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Risk Distribution */}
          <div className="glass-card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>Risk Distribution</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 12 }}>By severity level</div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={riskDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                  {riskDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {riskDist.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, display: "inline-block" }} />
                    {d.name}
                  </span>
                  <span style={{ fontWeight: 700, color: d.color }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top vendors by risk bar chart */}
      {stats && (
        <div className="glass-card" style={{ padding: 20, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Top Vendors by Risk Value</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Mismatch amount (₹)</div>
            </div>
            <Link href="/vendors" onClick={() => setActiveNav("vendors")}>
              <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }}>
                View All <ArrowRight size={12} />
              </button>
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TREND_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)" }} />
              <Bar dataKey="value" fill="#1E3A8A" radius={[4, 4, 0, 0]} name="Risk Value (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      {!graphBuilt && (
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: "var(--text-primary)" }}>Quick Actions</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
            <Link href="/upload" onClick={() => setActiveNav("upload")}>
              <button className="btn-primary"><Upload size={14} /> Upload Files</button>
            </Link>
            <button className="btn-secondary" onClick={handleLoadDemo}><Activity size={14} /> Demo Dataset</button>
            <Link href="/graph" onClick={() => setActiveNav("graph")}>
              <button className="btn-secondary" style={{ fontSize: 13 }}>🔗 Knowledge Graph</button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
