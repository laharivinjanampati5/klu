"use client";

import { useStore } from "@/lib/store";
import { BellRing, Flag, Send } from "lucide-react";
import { toast } from "sonner";

interface VendorActionPanelProps {
  gstin: string;
  vendorName: string;
  invoiceNo: string;
  rootCause: string;
  recommendation: string;
  origin: "Reconciliation" | "Audit Trail";
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VendorActionPanel({
  gstin,
  vendorName,
  invoiceNo,
  rootCause,
  recommendation,
  origin,
}: VendorActionPanelProps) {
  const { vendors, flagVendor, reportVendor } = useStore();
  const vendor = vendors.find((item) => item.gstin === gstin);
  const caseNotifications = (vendor?.notifications ?? []).filter((item) => item.invoiceNo === invoiceNo).slice(0, 3);

  const handleFlag = () => {
    const status = flagVendor({
      gstin,
      invoiceNo,
      reason: `Reason recorded: ${rootCause}`,
      origin,
    });

    if (status === "sent") {
      toast.success(`Flag notification sent to ${vendorName}.`);
      return;
    }

    if (status === "duplicate") {
      toast.info(`${vendorName} has already been flagged for ${invoiceNo}.`);
      return;
    }

    toast.error("Vendor notification could not be delivered.");
  };

  const handleReport = () => {
    const status = reportVendor({
      gstin,
      invoiceNo,
      subject: `Complaint raised for ${invoiceNo}`,
      message: `Complaint registered successfully for invoice ${invoiceNo}. Recommended action: ${recommendation}. Root cause: ${rootCause}`,
      origin,
    });

    if (status === "sent") {
      toast.success(`Complaint sent to ${vendorName} successfully.`);
      return;
    }

    if (status === "duplicate") {
      toast.info(`${vendorName} has already received a complaint for ${invoiceNo}.`);
      return;
    }

    toast.error("Vendor complaint could not be delivered.");
  };

  return (
    <div style={{ borderRadius: 12, padding: 14, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.18)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: "#60A5FA", fontWeight: 700, marginBottom: 4 }}>VENDOR ACTIONS</div>
          <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.6 }}>
            Send a flag or complaint directly to {vendorName}. This notification is attached only to GSTIN {gstin}.
          </div>
        </div>
        <BellRing size={16} color="#60A5FA" />
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: caseNotifications.length > 0 ? 12 : 0 }}>
        <button className="btn-danger" onClick={handleFlag}>
          <Flag size={14} />
          Flag Vendor
        </button>
        <button className="btn-secondary" onClick={handleReport}>
          <Send size={14} />
          Report Vendor
        </button>
      </div>

      {caseNotifications.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {caseNotifications.map((notification) => (
            <div key={notification.id} style={{ borderRadius: 10, padding: 12, background: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{notification.title}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>{notification.status}</div>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.55 }}>{notification.message}</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
                {notification.origin} - {formatTimestamp(notification.createdAt)}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
