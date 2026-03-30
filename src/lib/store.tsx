"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { GSTInvoice, MismatchRecord, VendorNotification, VendorRisk, UploadedFile, ReconciliationStats } from "./types";
import {
    generateDemoInvoices,
    generateMismatches,
    generateVendorRisks,
    computeStats,
} from "./demoData";

interface VendorFlagPayload {
    gstin: string;
    invoiceNo: string;
    reason: string;
    origin: "Reconciliation" | "Audit Trail";
}

interface VendorReportPayload {
    gstin: string;
    invoiceNo: string;
    subject: string;
    message: string;
    origin: "Reconciliation" | "Audit Trail";
}

type VendorActionStatus = "sent" | "duplicate" | "missing";

interface AppStore {
    theme: "dark" | "light";
    toggleTheme: () => void;
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
    uploadedFiles: UploadedFile[];
    addFiles: (files: UploadedFile[]) => void;
    removeFile: (id: string) => void;
    removeFiles: (ids: string[]) => void;
    invoices: GSTInvoice[];
    mismatches: MismatchRecord[];
    vendors: VendorRisk[];
    stats: ReconciliationStats | null;
    isProcessing: boolean;
    isReconciling: boolean;
    reconciliationDone: boolean;
    processFiles: () => Promise<void>;
    runReconciliation: () => Promise<void>;
    loadDemoData: () => void;
    graphBuilt: boolean;
    activeNav: string;
    setActiveNav: (v: string) => void;
    flagVendor: (payload: VendorFlagPayload) => VendorActionStatus;
    reportVendor: (payload: VendorReportPayload) => VendorActionStatus;
}

const StoreCtx = createContext<AppStore | null>(null);

function notificationExists(
    notifications: VendorNotification[] | undefined,
    type: VendorNotification["type"],
    invoiceNo: string,
) {
    return notifications?.some((item) => item.type === type && item.invoiceNo === invoiceNo) ?? false;
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [invoices, setInvoices] = useState<GSTInvoice[]>([]);
    const [mismatches, setMismatches] = useState<MismatchRecord[]>([]);
    const [vendors, setVendors] = useState<VendorRisk[]>([]);
    const [stats, setStats] = useState<ReconciliationStats | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isReconciling, setIsReconciling] = useState(false);
    const [reconciliationDone, setReconciliationDone] = useState(false);
    const [graphBuilt, setGraphBuilt] = useState(false);
    const [activeNav, setActiveNav] = useState("dashboard");

    const flagVendor = useCallback((payload: VendorFlagPayload) => {
        const createdAt = new Date().toISOString();
        let status: VendorActionStatus = "missing";

        setVendors((prev) => prev.map((vendor) => {
            if (vendor.gstin !== payload.gstin) return vendor;
            if (notificationExists(vendor.notifications, "Flag", payload.invoiceNo)) {
                status = "duplicate";
                return vendor;
            }

            status = "sent";
            const notification: VendorNotification = {
                id: `flag_${payload.gstin}_${payload.invoiceNo}`,
                type: "Flag",
                invoiceNo: payload.invoiceNo,
                title: `Flag raised for ${payload.invoiceNo}`,
                message: `Complaint registered successfully for invoice ${payload.invoiceNo}. ${payload.reason}`,
                origin: payload.origin,
                status: "Sent",
                createdAt,
            };

            return {
                ...vendor,
                flagged: true,
                flagReason: payload.reason,
                flaggedAt: createdAt,
                notifications: [notification, ...(vendor.notifications ?? [])],
            };
        }));

        return status;
    }, []);

    const reportVendor = useCallback((payload: VendorReportPayload) => {
        const createdAt = new Date().toISOString();
        let status: VendorActionStatus = "missing";

        setVendors((prev) => prev.map((vendor) => {
            if (vendor.gstin !== payload.gstin) return vendor;
            if (notificationExists(vendor.notifications, "Report", payload.invoiceNo)) {
                status = "duplicate";
                return vendor;
            }

            status = "sent";
            const notification: VendorNotification = {
                id: `report_${payload.gstin}_${payload.invoiceNo}`,
                type: "Report",
                invoiceNo: payload.invoiceNo,
                title: payload.subject,
                message: payload.message,
                origin: payload.origin,
                status: "Sent",
                createdAt,
            };

            return {
                ...vendor,
                reported: true,
                reportedSubject: payload.subject,
                reportedMessage: payload.message,
                reportedAt: createdAt,
                notifications: [notification, ...(vendor.notifications ?? [])],
            };
        }));

        return status;
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

    const addFiles = (files: UploadedFile[]) => {
        setUploadedFiles((prev) => [...prev, ...files]);
    };

    const removeFile = (id: string) => {
        setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    };

    const removeFiles = (ids: string[]) => {
        setUploadedFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
    };

    const processFiles = useCallback(async () => {
        setIsProcessing(true);
        const demoInvoices = generateDemoInvoices(100);
        await new Promise((r) => setTimeout(r, 2000));
        const mms = generateMismatches(demoInvoices);
        const vr = generateVendorRisks(demoInvoices);
        const st = computeStats(demoInvoices, mms);
        setInvoices(demoInvoices);
        setMismatches(mms);
        setVendors(vr);
        setStats(st);
        setGraphBuilt(true);
        setUploadedFiles((prev) =>
            prev.map((f) => ({ ...f, status: "Processed", recordCount: Math.floor(Math.random() * 30) + 10 }))
        );
        setIsProcessing(false);
    }, []);

    const runReconciliation = useCallback(async () => {
        setIsReconciling(true);
        setReconciliationDone(false);
        await new Promise((r) => setTimeout(r, 2500));
        setIsReconciling(false);
        setReconciliationDone(true);
    }, []);

    const loadDemoData = useCallback(() => {
        const demoFiles: UploadedFile[] = [
            { id: "f1", name: "GSTR1_Q2_2024.csv", type: "GSTR-1", size: 48200, uploadedAt: new Date().toISOString(), status: "Processed", recordCount: 42 },
            { id: "f2", name: "GSTR2B_Sep2024.xlsx", type: "GSTR-2B", size: 89600, uploadedAt: new Date().toISOString(), status: "Processed", recordCount: 38 },
            { id: "f3", name: "PurchaseRegister_2024.csv", type: "Purchase Register", size: 62400, uploadedAt: new Date().toISOString(), status: "Processed", recordCount: 100 },
            { id: "f4", name: "eInvoice_IRN_Q2.json", type: "e-Invoice", size: 31800, uploadedAt: new Date().toISOString(), status: "Processed", recordCount: 55 },
        ];
        setUploadedFiles(demoFiles);
        const demoInvoices = generateDemoInvoices(100);
        const mms = generateMismatches(demoInvoices);
        const vr = generateVendorRisks(demoInvoices);
        const st = computeStats(demoInvoices, mms);
        setInvoices(demoInvoices);
        setMismatches(mms);
        setVendors(vr);
        setStats(st);
        setGraphBuilt(true);
    }, []);

    return (
        <StoreCtx.Provider
            value={{
                theme, toggleTheme,
                sidebarOpen, setSidebarOpen,
                uploadedFiles, addFiles, removeFile, removeFiles,
                invoices, mismatches, vendors, stats,
                isProcessing, isReconciling, reconciliationDone,
                processFiles, runReconciliation, loadDemoData,
                graphBuilt, activeNav, setActiveNav,
                flagVendor, reportVendor,
            }}
        >
            {children}
        </StoreCtx.Provider>
    );
}

export function useStore() {
    const ctx = useContext(StoreCtx);
    if (!ctx) throw new Error("useStore must be used within AppStoreProvider");
    return ctx;
}
