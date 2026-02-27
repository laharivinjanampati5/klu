"use client";
import { GSTInvoice, MismatchRecord, VendorRisk, ReconciliationStats } from "./types";

const VENDORS = [
    { gstin: "29ABCDE1234F1Z5", name: "Reliance Industries Ltd" },
    { gstin: "27FGHIJ5678K2Z6", name: "Tata Consultancy Services" },
    { gstin: "33KLMNO9012L3Z7", name: "Infosys Limited" },
    { gstin: "19PQRST3456M4Z8", name: "Wipro Technologies" },
    { gstin: "07UVWXY7890N5Z9", name: "HCL Technologies" },
    { gstin: "24ABCFG2345P6Z0", name: "Mahindra Electric" },
    { gstin: "09HIJKL6789Q7Z1", name: "Bajaj Auto Limited" },
    { gstin: "32MNOPQ0123R8Z2", name: "Hero MotoCorp Ltd" },
    { gstin: "21RSTUV4567S9Z3", name: "Larsen & Toubro" },
    { gstin: "06WXYZ8901T0Z4", name: "HDFC Bank Limited" },
    { gstin: "18ABCDE3456U1Z5", name: "ICICI Bank Ltd" },
    { gstin: "36FGHIJ7890V2Z6", name: "State Bank of India" },
    { gstin: "22KLMNO1234W3Z7", name: "Tech Mahindra Ltd" },
    { gstin: "11PQRST5678X4Z8", name: "Adani Enterprises" },
    { gstin: "02UVWXY9012Y5Z9", name: "Vedanta Resources" },
];

function randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateInvoiceNo(i: number) {
    return `INV-2024-${String(i).padStart(5, "0")}`;
}

function randomDate(start: Date, end: Date) {
    const d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return d.toISOString().split("T")[0];
}

export function generateDemoInvoices(count = 100): GSTInvoice[] {
    const invoices: GSTInvoice[] = [];
    const startDate = new Date("2024-04-01");
    const endDate = new Date("2024-09-30");

    // Mismatch indices
    const mismatchIndices = new Set<number>();
    while (mismatchIndices.size < 15) {
        mismatchIndices.add(randomBetween(0, count - 1));
    }

    for (let i = 0; i < count; i++) {
        const vendor = VENDORS[i % VENDORS.length];
        const taxable = randomBetween(10000, 500000);
        const isMismatch = mismatchIndices.has(i);
        const isMissing = i % 23 === 0 && isMismatch;
        const cgst = Math.round(taxable * 0.09);
        const sgst = Math.round(taxable * 0.09);
        const sources: GSTInvoice["source"][] = ["GSTR1", "GSTR2B", "PurchaseRegister", "eInvoice"];

        invoices.push({
            id: `inv_${i}`,
            invoiceNo: generateInvoiceNo(i + 1),
            gstin: vendor.gstin,
            vendorName: vendor.name,
            supplyType: "B2B",
            invoiceDate: randomDate(startDate, endDate),
            taxableAmount: taxable,
            cgst,
            sgst,
            igst: 0,
            totalAmount: taxable + cgst + sgst,
            source: sources[i % sources.length],
            status: isMissing ? "Missing" : isMismatch ? "Mismatch" : "Matched",
        });
    }
    return invoices;
}

const ROOT_CAUSES = [
    "Invoice missing in GSTR-2B – Possible suppression by supplier",
    "Tax amount mismatch – Likely rounding error in calculation",
    "Invoice date discrepancy – Filed in wrong tax period",
    "GSTIN mismatch – Incorrect vendor registration number",
    "Duplicate invoice detected – Same invoice filed twice",
    "Amount mismatch – Partial credit note not adjusted",
    "HSN code difference – Wrong commodity classification",
    "ITC claim without corresponding GSTR-2B entry",
];

export function generateMismatches(invoices: GSTInvoice[]): MismatchRecord[] {
    return invoices
        .filter((inv) => inv.status === "Mismatch" || inv.status === "Missing")
        .map((inv, i) => {
            const amountDiff = randomBetween(500, 50000);
            const taxDiff = Math.round(amountDiff * 0.18);
            const riskScore = randomBetween(30, 95);
            return {
                id: `mm_${i}`,
                invoiceNo: inv.invoiceNo,
                gstin: inv.gstin,
                vendorName: inv.vendorName,
                amountDiff,
                taxDiff,
                rootCause: ROOT_CAUSES[i % ROOT_CAUSES.length],
                riskLevel: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
                riskScore,
                source1: "GSTR-1",
                source2: "GSTR-2B",
                details: `Invoice ${inv.invoiceNo} shows ₹${amountDiff.toLocaleString()} difference. ${ROOT_CAUSES[i % ROOT_CAUSES.length]}.`,
            };
        });
}

export function generateVendorRisks(invoices: GSTInvoice[]): VendorRisk[] {
    const vendorMap = new Map<string, GSTInvoice[]>();
    for (const inv of invoices) {
        if (!vendorMap.has(inv.gstin)) vendorMap.set(inv.gstin, []);
        vendorMap.get(inv.gstin)!.push(inv);
    }

    return Array.from(vendorMap.entries()).map(([gstin, invs]) => {
        const mismatchCount = invs.filter((i) => i.status !== "Matched").length;
        const riskScore = Math.min(100, Math.round((mismatchCount / invs.length) * 100 * 2 + randomBetween(0, 20)));
        const totalValue = invs.reduce((sum, i) => sum + i.totalAmount, 0);
        return {
            gstin,
            name: invs[0].vendorName,
            riskScore,
            trend: riskScore > 60 ? "up" : riskScore < 30 ? "down" : "stable",
            mismatchCount,
            totalValue,
            predictedRisk: riskScore >= 70 ? "High" : riskScore >= 40 ? "Medium" : "Low",
            invoiceCount: invs.length,
            complianceScore: Math.max(20, 100 - riskScore),
        };
    });
}

export function computeStats(invoices: GSTInvoice[], mismatches: MismatchRecord[]): ReconciliationStats {
    const totalITC = invoices.reduce((s, i) => s + i.cgst + i.sgst + i.igst, 0);
    const leakage = mismatches.reduce((s, m) => s + m.taxDiff, 0);
    const highRisk = mismatches.filter((m) => m.riskLevel === "High").length;
    const matched = invoices.filter((i) => i.status === "Matched").length;
    const complianceScore = Math.round((matched / invoices.length) * 100);

    return {
        totalInvoices: invoices.length,
        matched,
        mismatches: mismatches.length,
        missing: invoices.filter((i) => i.status === "Missing").length,
        totalITCClaimed: totalITC,
        leakageRisk: leakage,
        complianceScore,
        highRiskVendors: highRisk,
    };
}

export function getMismatchTrend() {
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    return months.map((month, i) => ({
        month,
        mismatches: randomBetween(5, 20) - i,
        value: randomBetween(50000, 200000),
    }));
}

export function getRiskDistribution(mismatches: MismatchRecord[]) {
    const high = mismatches.filter((m) => m.riskLevel === "High").length;
    const med = mismatches.filter((m) => m.riskLevel === "Medium").length;
    const low = mismatches.filter((m) => m.riskLevel === "Low").length;
    return [
        { name: "High Risk", value: high, color: "#EF4444" },
        { name: "Medium Risk", value: med, color: "#EAB308" },
        { name: "Low Risk", value: low, color: "#10B981" },
    ];
}
