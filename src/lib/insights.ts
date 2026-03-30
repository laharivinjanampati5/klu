import { GSTInvoice, MismatchRecord, VendorRisk } from "./types";
import { getRiskColor } from "./utils";

export interface DigitalTwinSignal {
  label: string;
  value: string;
  helper: string;
  color: string;
}

export interface DigitalTwinSnapshot {
  coverage: number;
  signals: DigitalTwinSignal[];
}

export interface GraphMetricLayer {
  label: string;
  value: number;
  color: string;
}

export interface GraphMetrics {
  relationships: number;
  connectedInvoices: number;
  brokenChains: number;
  layers: GraphMetricLayer[];
}

export interface ExecutiveSummary {
  highRiskCases: number;
  story: string;
}

export interface ReconciliationCase {
  id: string;
  invoiceNo: string;
  vendorName: string;
  riskLevel: "High" | "Medium" | "Low";
  riskScore: number;
  rootCauseLabel: string;
  exposure: number;
  recommendation: string;
}

export interface MonthlyCompliancePoint {
  month: string;
  score: number;
  mismatches: number;
  delayedSuppliers: number;
}

export interface FraudSignal {
  id: string;
  title: string;
  severity: number;
  description: string;
}

export interface ScenarioInsight {
  id: string;
  title: string;
  summary: string;
}

export interface ReplayStep {
  step: string;
  status: "done" | "risk" | "break";
  note: string;
}

export interface TrustSignal {
  id: string;
  headline: string;
  trustScore: number;
  summary: string;
  color: string;
}

export interface FraudSimulationMetric {
  label: string;
  value: string;
  helper: string;
  color: string;
}

export interface FraudSimulationScenario {
  id: string;
  title: string;
  description: string;
  shockLabel: string;
  color: string;
  leakageImpact: number;
  responderAction: string;
  metrics: FraudSimulationMetric[];
}

function riskBucketLabel(rootCause: string): string {
  const value = rootCause.toLowerCase();
  if (value.includes("duplicate")) return "Duplicate claim cluster";
  if (value.includes("gstin")) return "Identity break in vendor chain";
  if (value.includes("period") || value.includes("date")) return "Timing mismatch across returns";
  if (value.includes("suppression") || value.includes("2b")) return "Supplier filing gap";
  if (value.includes("credit note")) return "Adjustment chain incomplete";
  return "Invoice to tax chain break";
}

export function buildDigitalTwinSnapshot(
  invoices: GSTInvoice[],
  mismatches: MismatchRecord[],
  vendors: VendorRisk[],
): DigitalTwinSnapshot {
  const coverage = invoices.length
    ? Math.max(68, Math.min(96, Math.round(((invoices.length - mismatches.length) / invoices.length) * 100)))
    : 72;
  const highRisk = mismatches.filter((item) => item.riskLevel === "High").length;
  const riskyVendors = vendors.filter((vendor) => vendor.predictedRisk === "High").length;
  const leakage = mismatches.reduce((sum, item) => sum + item.taxDiff, 0);

  return {
    coverage,
    signals: [
      {
        label: "Twin Coverage",
        value: `${coverage}%`,
        helper: "core invoice and return links mapped",
        color: "#10B981",
      },
      {
        label: "High Risk Cases",
        value: `${highRisk}`,
        helper: "cases with immediate audit urgency",
        color: "#EF4444",
      },
      {
        label: "Risky Suppliers",
        value: `${riskyVendors}`,
        helper: "vendors weakening trust propagation",
        color: "#F59E0B",
      },
      {
        label: "Leakage Exposure",
        value: `${Math.round(leakage / 1000)}K`,
        helper: "estimated tax exposure in current graph",
        color: "#8B5CF6",
      },
    ],
  };
}

export function buildGraphMetrics(
  invoices: GSTInvoice[],
  mismatches: MismatchRecord[],
  vendors: VendorRisk[],
): GraphMetrics {
  const relationships = invoices.length * 4 + mismatches.length * 3 + vendors.length * 2;
  const connectedInvoices = invoices.filter((invoice) => invoice.status !== "Missing").length;
  const brokenChains = mismatches.length;

  return {
    relationships,
    connectedInvoices,
    brokenChains,
    layers: [
      { label: "Invoice to IRN", value: invoices.length ? 91 : 70, color: "#3B82F6" },
      { label: "IRN to e-Way", value: invoices.length ? 84 : 66, color: "#10B981" },
      { label: "Supplier to GSTR-1", value: 88, color: "#F59E0B" },
      { label: "GSTR-1 to GSTR-2B", value: invoices.length ? 79 : 62, color: "#EF4444" },
    ],
  };
}

export function buildExecutiveSummary(
  invoices: GSTInvoice[],
  mismatches: MismatchRecord[],
  vendors: VendorRisk[],
): ExecutiveSummary {
  const highRiskCases = mismatches.filter((item) => item.riskLevel === "High").length;
  const riskyVendors = vendors.filter((item) => item.predictedRisk === "High").length;
  const brokenChains = mismatches.filter(
    (item) => item.rootCause.toLowerCase().includes("2b") || item.rootCause.toLowerCase().includes("missing"),
  ).length;

  return {
    highRiskCases,
    story: invoices.length
      ? `The GST digital twin currently tracks ${invoices.length} invoices across ${vendors.length} vendors. ${highRiskCases} cases are high risk, and ${brokenChains} of them point to broken invoice to return chains. ${riskyVendors} suppliers are now influencing downstream trust and ITC exposure.`
      : "Load the demo ecosystem to generate a full GST digital twin story with connected filings, supplier trust, and audit-ready explanations.",
  };
}

export function buildReconciliationCases(
  mismatches: MismatchRecord[],
  _invoices: GSTInvoice[],
): ReconciliationCase[] {
  return mismatches
    .map((item) => ({
      id: item.id,
      invoiceNo: item.invoiceNo,
      vendorName: item.vendorName,
      riskLevel: item.riskLevel,
      riskScore: item.riskScore,
      rootCauseLabel: riskBucketLabel(item.rootCause),
      exposure: item.amountDiff + item.taxDiff,
      recommendation:
        item.riskLevel === "High"
          ? "Hold ITC and escalate to vendor compliance review"
          : item.riskLevel === "Medium"
            ? "Request supplier amendment in next filing cycle"
            : "Monitor for resolution in the next return window",
    }))
    .sort((a, b) => b.riskScore - a.riskScore);
}

export function buildMonthlyCompliance(mismatches: MismatchRecord[]): MonthlyCompliancePoint[] {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
  return months.map((month, index) => {
    const mismatchBase = Math.max(2, Math.round(mismatches.length / 6));
    const current = mismatchBase + ((index + mismatches.length) % 4);
    return {
      month,
      score: Math.max(68, 93 - current * 4 + (index % 2)),
      mismatches: current,
      delayedSuppliers: Math.max(1, current - 1),
    };
  });
}

export function buildFraudSignals(mismatches: MismatchRecord[], vendors: VendorRisk[]): FraudSignal[] {
  const highRisk = mismatches.filter((item) => item.riskLevel === "High").length;
  const riskyVendors = vendors.filter((item) => item.predictedRisk === "High").length;
  return [
    {
      id: "ring",
      title: "Circular invoice pressure",
      severity: Math.min(96, 48 + highRisk * 4),
      description:
        "Repeated high-risk breaks across connected vendors suggest circular trading behavior and elevated ITC leakage probability.",
    },
    {
      id: "shell",
      title: "Shell vendor burst",
      severity: Math.min(92, 42 + riskyVendors * 5),
      description:
        "Low-trust suppliers with dense mismatch activity are behaving like temporary pass-through entities in the graph.",
    },
    {
      id: "duplicate",
      title: "Duplicate ITC wave",
      severity: Math.min(
        90,
        35 + mismatches.filter((item) => item.rootCause.toLowerCase().includes("duplicate")).length * 12,
      ),
      description:
        "Duplicate invoice patterns are forming local clusters that could amplify wrongful claim exposure.",
    },
  ];
}

export function buildScenarioInsights(mismatches: MismatchRecord[], vendors: VendorRisk[]): ScenarioInsight[] {
  const highRisk = mismatches.filter((item) => item.riskLevel === "High").length;
  const lowCompliance = vendors.filter((item) => item.complianceScore < 55).length;
  return [
    {
      id: "late-filing",
      title: "Late supplier filing shock",
      summary: `${Math.max(3, highRisk)} current cases would stay blocked if suppliers delay GSTR-1 by one more filing cycle.`,
    },
    {
      id: "missing-irn",
      title: "IRN absence simulation",
      summary: `${Math.max(2, lowCompliance)} vendors would move into elevated review if IRN validation fails across linked invoices.`,
    },
    {
      id: "duplicate-claim",
      title: "Duplicate claim stress test",
      summary: "The graph engine predicts fast spillover if duplicate claims begin repeating across already risky counterparties.",
    },
  ];
}

export function buildCausalityReplay(item: MismatchRecord): ReplayStep[] {
  return [
    {
      step: "Invoice recorded in purchase register",
      status: "done",
      note: `${item.invoiceNo} was booked against ${item.vendorName}.`,
    },
    {
      step: "Supplier return expectation created",
      status: "done",
      note: `The engine expected a matching declaration through ${item.source1}.`,
    },
    {
      step: "Reflection check in recipient chain",
      status: item.riskLevel === "Low" ? "risk" : "break",
      note: `${item.source2} did not fully support the claim path for this invoice.`,
    },
    {
      step: "Risk propagation",
      status: "risk",
      note: `${riskBucketLabel(item.rootCause)} raised the case to ${item.riskLevel.toLowerCase()} risk with score ${item.riskScore}.`,
    },
  ];
}

export function buildTrustSignals(vendors: VendorRisk[], mismatches: MismatchRecord[]): TrustSignal[] {
  return vendors
    .slice()
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 5)
    .map((vendor, index) => ({
      id: vendor.gstin,
      headline: vendor.name,
      trustScore: Math.max(18, 100 - vendor.riskScore - index * 3),
      summary: `${vendor.mismatchCount} mismatches and ${Math.max(2, mismatches.filter((item) => item.gstin === vendor.gstin).length + 2)} downstream nodes are exposed to trust decay if this vendor remains non-compliant.`,
      color: getRiskColor(vendor.riskScore),
    }));
}

export function buildFraudSimulationScenarios(
  mismatches: MismatchRecord[],
  vendors: VendorRisk[],
): FraudSimulationScenario[] {
  const leakageBase = mismatches.reduce((sum, item) => sum + item.taxDiff, 0) || 120000;
  const riskyVendors = vendors.filter((vendor) => vendor.predictedRisk === "High").length || 3;
  return [
    {
      id: "circular-trading",
      title: "Circular trading ring",
      description:
        "Inject a tight vendor loop where invoices and credits circulate without genuine movement of goods.",
      shockLabel: "Critical",
      color: "#EF4444",
      leakageImpact: leakageBase + 180000,
      responderAction:
        "Freeze linked ITC claims, inspect the repeated route, and push the case into manual officer review with graph evidence.",
      metrics: [
        { label: "Affected invoices", value: `${Math.max(8, mismatches.length + 4)}`, helper: "chain becomes cyclic", color: "#EF4444" },
        { label: "Vendors pulled in", value: `${Math.max(4, riskyVendors + 1)}`, helper: "densely connected cluster", color: "#F59E0B" },
        { label: "Twin shock", value: "High", helper: "trust map collapses quickly", color: "#8B5CF6" },
        { label: "Containment", value: "Immediate", helper: "stop claim progression", color: "#10B981" },
      ],
    },
    {
      id: "shell-burst",
      title: "Shell vendor burst",
      description:
        "Create a wave of low-history vendors that suddenly emit high-value invoices with weak graph support.",
      shockLabel: "Severe",
      color: "#F97316",
      leakageImpact: leakageBase + 120000,
      responderAction:
        "Raise onboarding scrutiny, score the vendor neighborhood, and request proof of supply before ITC confirmation.",
      metrics: [
        { label: "Affected invoices", value: `${Math.max(6, riskyVendors * 2)}`, helper: "new vendors enter together", color: "#EF4444" },
        { label: "Vendors pulled in", value: `${Math.max(5, riskyVendors + 2)}`, helper: "thin trust history", color: "#F59E0B" },
        { label: "Twin shock", value: "Medium", helper: "trust propagation weakens", color: "#8B5CF6" },
        { label: "Containment", value: "Fast", helper: "ask for evidence", color: "#10B981" },
      ],
    },
    {
      id: "duplicate-wave",
      title: "Duplicate ITC wave",
      description: "Replay repeated claim attempts against similar invoices and linked counterparties.",
      shockLabel: "Elevated",
      color: "#8B5CF6",
      leakageImpact: leakageBase + 90000,
      responderAction:
        "Pin duplicate edges, de-duplicate claims at the invoice node, and notify affected compliance teams.",
      metrics: [
        { label: "Affected invoices", value: `${Math.max(5, Math.round(mismatches.length / 2))}`, helper: "claim repetition detected", color: "#EF4444" },
        { label: "Vendors pulled in", value: `${Math.max(3, riskyVendors)}`, helper: "shared invoice behavior", color: "#F59E0B" },
        { label: "Twin shock", value: "Measured", helper: "localized anomaly", color: "#8B5CF6" },
        { label: "Containment", value: "Rule-based", helper: "auto hold available", color: "#10B981" },
      ],
    },
    {
      id: "silent-delay",
      title: "Silent supplier delay",
      description:
        "Delay supplier filing while keeping purchase activity stable to see how downstream ITC claims deteriorate.",
      shockLabel: "Watch",
      color: "#3B82F6",
      leakageImpact: leakageBase + 60000,
      responderAction:
        "Queue reminder workflows, hold the most exposed claims, and re-check the graph after the next filing window.",
      metrics: [
        { label: "Affected invoices", value: `${Math.max(4, Math.round(mismatches.length / 3))}`, helper: "timing mismatch grows", color: "#EF4444" },
        { label: "Vendors pulled in", value: `${Math.max(2, Math.round(riskyVendors / 2) + 1)}`, helper: "delay spreads downstream", color: "#F59E0B" },
        { label: "Twin shock", value: "Gradual", helper: "trust erodes over time", color: "#8B5CF6" },
        { label: "Containment", value: "Monitor", helper: "watch next cycle", color: "#10B981" },
      ],
    },
  ];
}
