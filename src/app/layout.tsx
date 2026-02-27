import type { Metadata } from "next";
import "./globals.css";
import { AppStoreProvider } from "@/lib/store";
import { Toaster } from "sonner";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "GST GraphRecon AI – India's Most Intelligent GST Reconciliation Platform",
  description: "Stop ITC Leakage. Reconcile in Minutes with Knowledge Graphs. AI-powered GST reconciliation using advanced graph analytics.",
  keywords: "GST reconciliation, ITC, GSTR-2B, knowledge graph, AI, India",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppStoreProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster position="top-right" theme="dark" richColors />
        </AppStoreProvider>
      </body>
    </html>
  );
}
