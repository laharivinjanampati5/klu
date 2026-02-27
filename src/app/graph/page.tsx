"use client";
import { useEffect, useState, useCallback } from "react";
import ReactFlow, {
    Background, Controls, MiniMap,
    Node, Edge, NodeTypes,
    Handle, Position, useNodesState, useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { useStore } from "@/lib/store";
import { Search, Layers, Filter, X, Info, Network } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

// Custom node component
function CustomNode({ data }: { data: { label: string; type: string; detail: string; color: string; icon: string } }) {
    return (
        <div style={{
            padding: "10px 16px", borderRadius: 12,
            background: `${data.color}15`, border: `2px solid ${data.color}50`,
            minWidth: 120, textAlign: "center", position: "relative",
            backdropFilter: "blur(10px)",
        }}>
            <Handle type="target" position={Position.Top} style={{ background: data.color, border: "none" }} />
            <div style={{ fontSize: 20, marginBottom: 4 }}>{data.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: data.color }}>{data.label}</div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>{data.type}</div>
            <Handle type="source" position={Position.Bottom} style={{ background: data.color, border: "none" }} />
        </div>
    );
}

const nodeTypes: NodeTypes = { custom: CustomNode };

const NODE_CONFIG: Record<string, { color: string; icon: string }> = {
    taxpayer: { color: "#2563EB", icon: "🏢" },
    invoice: { color: "#10B981", icon: "📄" },
    vendor: { color: "#F97316", icon: "👤" },
    irn: { color: "#8B5CF6", icon: "🔗" },
};

function buildGraphNodes(invoices: ReturnType<typeof import("@/lib/demoData").generateDemoInvoices>) {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const nodeSet = new Set<string>();
    let edgeIdx = 0;

    // Add taxpayer node
    nodes.push({
        id: "taxpayer_main",
        type: "custom",
        position: { x: 450, y: 50 },
        data: { label: "Your GSTIN", type: "Taxpayer", detail: "27MYGSTIN1234Z5", color: "#2563EB", icon: "🏢" },
    });

    const vendorsSeen = new Map<string, { x: number; y: number }>();
    let vIdx = 0;
    const maxVendors = 8;

    invoices.slice(0, 30).forEach((inv, i) => {
        // Vendor node
        if (!vendorsSeen.has(inv.gstin) && vendorsSeen.size < maxVendors) {
            const angle = (vIdx / maxVendors) * 2 * Math.PI;
            const vPos = { x: 450 + Math.cos(angle) * 300, y: 220 + Math.sin(angle) * 200 };
            vendorsSeen.set(inv.gstin, vPos);
            const vid = `vendor_${inv.gstin}`;
            nodes.push({
                id: vid,
                type: "custom",
                position: vPos,
                data: { label: inv.vendorName.split(" ").slice(0, 2).join(" "), type: "Vendor", detail: inv.gstin, color: "#F97316", icon: "👤" },
            });
            edges.push({
                id: `e_tv_${vIdx}`,
                source: "taxpayer_main",
                target: vid,
                label: "Supplied to",
                style: { stroke: "#F97316", strokeOpacity: 0.5 },
                labelStyle: { fill: "#94A3B8", fontSize: 10 },
                animated: true,
            });
            vIdx++;
        }

        // Invoice node for first few
        if (i < 12) {
            const vid = `vendor_${inv.gstin}`;
            const vPos = vendorsSeen.get(inv.gstin) || { x: 200, y: 400 };
            const invId = `inv_${inv.id}`;
            const isMismatch = inv.status !== "Matched";
            const col = isMismatch ? "#EF4444" : "#10B981";
            nodes.push({
                id: invId,
                type: "custom",
                position: { x: vPos.x + (i % 3 - 1) * 90, y: vPos.y + 130 },
                data: { label: inv.invoiceNo, type: isMismatch ? "⚠ Mismatch" : "Matched", detail: `₹${inv.totalAmount.toLocaleString()}`, color: col, icon: isMismatch ? "⚠️" : "📄" },
            });
            edges.push({
                id: `e_vi_${i}`,
                source: vid,
                target: invId,
                label: isMismatch ? "Mismatch" : "ITC Claimed",
                style: { stroke: col, strokeOpacity: 0.6, strokeDasharray: isMismatch ? "5,5" : "none" },
                labelStyle: { fill: "#94A3B8", fontSize: 9 },
            });
        }
    });

    return { nodes, edges };
}

const LAYER_OPTIONS = [
    { id: "all", label: "All Nodes" },
    { id: "mismatches", label: "Mismatches Only" },
    { id: "highRisk", label: "High Risk" },
];

export default function GraphPage() {
    const { invoices, graphBuilt, loadDemoData, setActiveNav } = useStore();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [search, setSearch] = useState("");
    const [activeLayer, setActiveLayer] = useState("all");

    useEffect(() => { setActiveNav("graph"); }, [setActiveNav]);

    useEffect(() => {
        if (!graphBuilt || invoices.length === 0) return;
        const { nodes: n, edges: e } = buildGraphNodes(invoices);
        setNodes(n);
        setEdges(e);
    }, [graphBuilt, invoices]);

    const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const filteredNodes = nodes.filter(n =>
        search === "" ||
        n.data.label?.toLowerCase().includes(search.toLowerCase()) ||
        n.data.detail?.toLowerCase().includes(search.toLowerCase())
    );

    if (!graphBuilt) {
        return (
            <div className="page-enter" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🔮</div>
                    <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--text-primary)" }}>Knowledge Graph Not Built Yet</div>
                    <div style={{ color: "var(--text-muted)", marginBottom: 24 }}>Upload GST data or load demo data to visualize the knowledge graph.</div>
                    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                        <button className="btn-primary" onClick={() => { loadDemoData(); toast.success("Demo data loaded!"); }}>
                            <Network size={15} /> Load Demo Graph
                        </button>
                        <Link href="/upload" onClick={() => setActiveNav("upload")}>
                            <button className="btn-secondary">Upload Files</button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-enter" style={{ position: "relative" }}>
            {/* Controls bar */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
                {/* Search */}
                <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                    <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: 36 }}
                        placeholder="Search nodes (GSTIN, Invoice, Vendor…)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                {/* Layer toggle */}
                <div style={{ display: "flex", gap: 4, background: "var(--bg-card)", padding: 4, borderRadius: 10, border: "1px solid var(--border)" }}>
                    {LAYER_OPTIONS.map(l => (
                        <button
                            key={l.id}
                            onClick={() => setActiveLayer(l.id)}
                            style={{
                                padding: "6px 12px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
                                background: activeLayer === l.id ? "var(--emerald)" : "transparent",
                                color: activeLayer === l.id ? "white" : "var(--text-secondary)",
                                border: "none",
                            }}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", gap: 12 }}>
                    <span>🟦 {nodes.filter(n => n.data.type === "Taxpayer").length} Taxpayer</span>
                    <span>🟧 {nodes.filter(n => n.data.type === "Vendor").length} Vendors</span>
                    <span>🟩 {nodes.filter(n => n.data.type?.includes("Matched")).length} Matched</span>
                    <span>🔴 {nodes.filter(n => n.data.type?.includes("Mismatch")).length} Mismatches</span>
                </div>
            </div>

            {/* Graph canvas */}
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid var(--border)", height: "calc(100vh - 260px)", minHeight: 500, position: "relative" }}>
                <ReactFlow
                    nodes={filteredNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    onNodeClick={handleNodeClick}
                    fitView
                    attributionPosition="bottom-left"
                    style={{ background: "var(--bg-primary)" }}
                >
                    <Background color="var(--border)" gap={30} size={1} />
                    <Controls style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }} />
                    <MiniMap
                        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 10 }}
                        nodeColor={(n) => n.data.color || "#888"}
                    />
                </ReactFlow>

                {/* Selected Node Panel */}
                <AnimatePresence>
                    {selectedNode && (
                        <motion.div
                            initial={{ x: 320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0 }}
                            style={{
                                position: "absolute", right: 16, top: 16, bottom: 16,
                                width: 280, borderRadius: 14, padding: 20,
                                background: "var(--bg-card)", border: "1px solid var(--border)",
                                overflowY: "auto", zIndex: 10,
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Node Details</div>
                                <button onClick={() => setSelectedNode(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div style={{ textAlign: "center", marginBottom: 16 }}>
                                <div style={{ fontSize: 36 }}>{selectedNode.data.icon}</div>
                                <div style={{ fontWeight: 700, marginTop: 8, color: selectedNode.data.color }}>{selectedNode.data.label}</div>
                                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{selectedNode.data.type}</div>
                            </div>
                            <div className="glass-card" style={{ padding: 12 }}>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8, fontWeight: 600 }}>DETAILS</div>
                                <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{selectedNode.data.detail}</div>
                            </div>
                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8 }}>CONNECTED EDGES</div>
                                {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).slice(0, 5).map(e => (
                                    <div key={e.id} style={{ fontSize: 12, padding: "4px 0", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>
                                        ↔ {String(e.label)}
                                    </div>
                                ))}
                            </div>
                            <button className="btn-secondary" style={{ width: "100%", marginTop: 12, justifyContent: "center", fontSize: 12 }}>
                                <Info size={12} /> Show Full Subgraph
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="glass-card" style={{ padding: 12, marginTop: 16, display: "flex", gap: 20, flexWrap: "wrap" }}>
                {Object.entries(NODE_CONFIG).map(([type, cfg]) => (
                    <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-secondary)" }}>
                        <span style={{ width: 12, height: 12, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </div>
                ))}
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>— — Mismatch edge</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>–— Matched edge</div>
            </div>
        </div>
    );
}
