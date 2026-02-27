"use client";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useStore } from "@/lib/store";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const { sidebarOpen } = useStore();

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            <div
                className="main-content"
                style={{ marginLeft: sidebarOpen ? "260px" : "70px", flex: 1, display: "flex", flexDirection: "column", transition: "margin-left 0.3s" }}
            >
                <Navbar />
                <main style={{ flex: 1, padding: "28px", overflowY: "auto" }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
