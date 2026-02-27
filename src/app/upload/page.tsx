"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { UploadedFile } from "@/lib/types";
import { Upload, X, Eye, Trash2, Play, CheckCircle, AlertCircle, FileSpreadsheet, FileJson, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

const FILE_TYPES = ["GSTR-1", "GSTR-2B", "GSTR-3B", "Purchase Register", "e-Invoice", "e-Way Bill"] as const;
const TYPE_COLORS: Record<string, string> = {
    "GSTR-1": "#10B981", "GSTR-2B": "#2563EB", "GSTR-3B": "#8B5CF6",
    "Purchase Register": "#F97316", "e-Invoice": "#06B6D4", "e-Way Bill": "#EAB308",
};

function formatSize(bytes: number) {
    if (bytes > 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

function FileIcon({ name }: { name: string }) {
    if (name.endsWith(".json")) return <FileJson size={16} color="#06B6D4" />;
    if (name.endsWith(".xlsx") || name.endsWith(".csv")) return <FileSpreadsheet size={16} color="#10B981" />;
    return <File size={16} color="var(--text-muted)" />;
}

export default function UploadPage() {
    const { uploadedFiles, addFiles, removeFile, removeFiles, processFiles, isProcessing, graphBuilt, setActiveNav } = useStore();
    const [dragOver, setDragOver] = useState(false);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [progress, setProgress] = useState(0);
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => { setActiveNav("upload"); }, [setActiveNav]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        ingestFiles(files);
    }, [uploadedFiles]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) ingestFiles(Array.from(e.target.files));
    };

    const ingestFiles = (files: File[]) => {
        const allowed = files.filter(f => [".csv", ".xlsx", ".json"].some(ext => f.name.endsWith(ext)));
        if (allowed.length === 0) { toast.error("Only CSV, XLSX, and JSON files are supported."); return; }
        const newFiles: UploadedFile[] = allowed.map((f, i) => ({
            id: `f_${Date.now()}_${i}`,
            name: f.name,
            type: guessType(f.name),
            size: f.size,
            uploadedAt: new Date().toISOString(),
            status: "Uploaded",
        }));
        addFiles(newFiles);
        toast.success(`${newFiles.length} file(s) uploaded successfully.`);
    };

    const guessType = (name: string): UploadedFile["type"] => {
        const n = name.toLowerCase();
        if (n.includes("gstr1") || n.includes("gstr-1")) return "GSTR-1";
        if (n.includes("gstr2b") || n.includes("gstr-2b")) return "GSTR-2B";
        if (n.includes("gstr3b") || n.includes("gstr-3b")) return "GSTR-3B";
        if (n.includes("purchase") || n.includes("pr_")) return "Purchase Register";
        if (n.includes("einvoice") || n.includes("irn")) return "e-Invoice";
        if (n.includes("eway") || n.includes("e-way")) return "e-Way Bill";
        return FILE_TYPES[Math.floor(Math.random() * FILE_TYPES.length)];
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    };

    const handleProcess = async () => {
        let p = 0;
        const interval = setInterval(() => {
            p += 2;
            setProgress(Math.min(p, 95));
            if (p >= 95) clearInterval(interval);
        }, 50);
        await processFiles();
        setProgress(100);
        clearInterval(interval);
        toast.success("Knowledge Graph built successfully! 100 invoices indexed.", { icon: "🎉" });
    };

    return (
        <div className="page-enter">
            {/* Upload Zone */}
            <div
                className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                style={{ padding: "60px 40px", textAlign: "center", marginBottom: 28, cursor: "pointer" }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
            >
                <input ref={fileRef} type="file" multiple accept=".csv,.xlsx,.json" style={{ display: "none" }} onChange={handleFileInput} />
                <motion.div animate={{ scale: dragOver ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: 20, margin: "0 auto 16px",
                        background: dragOver ? "var(--emerald-glow)" : "var(--bg-card)",
                        border: `2px solid ${dragOver ? "var(--emerald)" : "var(--border-light)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <Upload size={28} color={dragOver ? "var(--emerald)" : "var(--text-muted)"} />
                    </div>
                </motion.div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                    {dragOver ? "Drop files here" : "Drag & Drop your GST files"}
                </div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                    Supports CSV, Excel (.xlsx), JSON · Max 50MB per file
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {FILE_TYPES.map(t => (
                        <span key={t} style={{
                            fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20,
                            background: `${TYPE_COLORS[t]}15`, color: TYPE_COLORS[t], border: `1px solid ${TYPE_COLORS[t]}30`,
                        }}>{t}</span>
                    ))}
                </div>
            </div>

            {/* Progress bar */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                                🔮 Building Knowledge Graph…
                            </span>
                            <span style={{ fontSize: 13, color: "var(--emerald)", fontWeight: 700 }}>{progress}%</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 4, background: "var(--border)", overflow: "hidden" }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #10B981, #059669)" }}
                                transition={{ ease: "linear" }}
                            />
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                            Parsing invoices → Building nodes → Resolving edges → Scoring vendors…
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Files Table */}
            {uploadedFiles.length > 0 && (
                <div className="glass-card" style={{ marginBottom: 20, overflow: "hidden" }}>
                    <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                            Uploaded Files ({uploadedFiles.length})
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            {selected.size > 0 && (
                                <button className="btn-danger" onClick={() => { removeFiles(Array.from(selected)); setSelected(new Set()); toast.info(`${selected.size} file(s) removed.`); }}>
                                    <Trash2 size={13} /> Remove Selected ({selected.size})
                                </button>
                            )}
                        </div>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}>
                                        <input type="checkbox" checked={selected.size === uploadedFiles.length && uploadedFiles.length > 0}
                                            onChange={e => setSelected(e.target.checked ? new Set(uploadedFiles.map(f => f.id)) : new Set())} />
                                    </th>
                                    <th>File Name</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Uploaded</th>
                                    <th>Records</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uploadedFiles.map(f => (
                                    <motion.tr key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td><input type="checkbox" checked={selected.has(f.id)} onChange={() => toggleSelect(f.id)} /></td>
                                        <td>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <FileIcon name={f.name} />
                                                <span style={{ fontWeight: 500, fontSize: 13 }}>{f.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                                                background: `${TYPE_COLORS[f.type]}15`, color: TYPE_COLORS[f.type],
                                                border: `1px solid ${TYPE_COLORS[f.type]}30`,
                                            }}>{f.type}</span>
                                        </td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatSize(f.size)}</td>
                                        <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{new Date(f.uploadedAt).toLocaleDateString("en-IN")}</td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{f.recordCount || "--"}</td>
                                        <td>
                                            <span className={f.status === "Processed" ? "badge-matched" : f.status === "Error" ? "badge-high" : "badge-pending"}
                                                style={{ fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>
                                                {f.status === "Processed" ? <CheckCircle size={10} style={{ display: "inline", marginRight: 4 }} /> : null}
                                                {f.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: 6 }}>
                                                <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12 }}>
                                                    <Eye size={12} /> Preview
                                                </button>
                                                <button className="btn-danger" style={{ padding: "4px 8px" }} onClick={() => { removeFile(f.id); toast.info("File removed."); }}>
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Process Button */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <button
                    className="btn-primary"
                    style={{ fontSize: 15, padding: "14px 32px" }}
                    disabled={uploadedFiles.length === 0 || isProcessing}
                    onClick={handleProcess}
                >
                    <Play size={16} /> Process & Build Knowledge Graph
                </button>
                {graphBuilt && (
                    <Link href="/graph" onClick={() => setActiveNav("graph")}>
                        <button className="btn-secondary" style={{ fontSize: 14, padding: "14px 24px" }}>
                            🔗 View Knowledge Graph →
                        </button>
                    </Link>
                )}
            </div>
        </div>
    );
}
