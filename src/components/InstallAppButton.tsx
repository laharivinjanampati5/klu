"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";

function isLocalhost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

export default function InstallAppButton() {
  const [isWorking, setIsWorking] = useState(false);

  const handleInstall = async () => {
    if (isWorking) return;

    if (!isLocalhost()) {
      toast.info("Open this app on http://localhost:3000 to download the ZIP directly to your Desktop.");
      return;
    }

    setIsWorking(true);

    try {
      const response = await fetch("/api/desktop-package", {
        method: "POST",
      });
      const payload = await response.json();

      if (response.ok) {
        toast.success(`Project ZIP saved to Desktop at ${payload.path}.`);
        return;
      }

      throw new Error(payload.error ?? "Desktop export failed.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Desktop export failed.";
      toast.error(message);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <button
      className="btn-primary"
      onClick={handleInstall}
      style={{ fontSize: 14, padding: "12px 22px" }}
      disabled={isWorking}
    >
      <Download size={16} />
      {isWorking ? "Preparing Desktop ZIP..." : "Download to Desktop"}
    </button>
  );
}
