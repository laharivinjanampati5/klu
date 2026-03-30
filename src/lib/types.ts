export type RiskLevel = "High" | "Medium" | "Low";

export interface GSTInvoice {
    id: string;
    invoiceNo: string;
    gstin: string;
    vendorName: string;
    supplyType: "B2B" | "B2BUR";
    invoiceDate: string;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    source: "GSTR1" | "GSTR2B" | "PurchaseRegister" | "eInvoice";
    status: "Matched" | "Mismatch" | "Missing" | "Pending";
}

export interface MismatchRecord {
    id: string;
    invoiceNo: string;
    gstin: string;
    vendorName: string;
    amountDiff: number;
    taxDiff: number;
    rootCause: string;
    riskLevel: RiskLevel;
    riskScore: number;
    source1: string;
    source2: string;
    details: string;
}

export interface VendorNotification {
    id: string;
    type: "Flag" | "Report";
    invoiceNo: string;
    title: string;
    message: string;
    origin: "Reconciliation" | "Audit Trail";
    status: "Sent";
    createdAt: string;
}

export interface VendorRisk {
    gstin: string;
    name: string;
    riskScore: number;
    trend: "up" | "down" | "stable";
    mismatchCount: number;
    totalValue: number;
    predictedRisk: RiskLevel;
    invoiceCount: number;
    complianceScore: number;
    flagged?: boolean;
    flagReason?: string;
    flaggedAt?: string;
    reported?: boolean;
    reportedSubject?: string;
    reportedMessage?: string;
    reportedAt?: string;
    notifications?: VendorNotification[];
}

export interface UploadedFile {
    id: string;
    name: string;
    type: "GSTR-1" | "GSTR-2B" | "GSTR-3B" | "Purchase Register" | "e-Invoice" | "e-Way Bill";
    size: number;
    uploadedAt: string;
    status: "Uploaded" | "Processing" | "Processed" | "Error";
    recordCount?: number;
    data?: GSTInvoice[];
}

export interface GraphNode {
    id: string;
    type: "taxpayer" | "invoice" | "vendor" | "irn";
    label: string;
    data: Record<string, unknown>;
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    label: string;
    type: "supplied" | "itcClaimed" | "matched" | "mismatch" | "payment";
}

export interface ReconciliationStats {
    totalInvoices: number;
    matched: number;
    mismatches: number;
    missing: number;
    totalITCClaimed: number;
    leakageRisk: number;
    complianceScore: number;
    highRiskVendors: number;
}
