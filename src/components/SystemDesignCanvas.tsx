"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────
export interface DesignNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DesignConnection {
  id: string;
  from: string;
  to: string;
  label?: string;
}

const COMPONENT_PALETTE: { type: string; label: string; icon: string; color: string; w: number; h: number; shape?: string }[] = [
  { type: "client", label: "Client", icon: "client", color: "#60a5fa", w: 120, h: 54 },
  { type: "server", label: "Server", icon: "server", color: "#818cf8", w: 130, h: 64, shape: "rack" },
  { type: "api", label: "API Gateway", icon: "api", color: "#818cf8", w: 140, h: 48, shape: "pill" },
  { type: "loadbalancer", label: "Load Balancer", icon: "loadbalancer", color: "#38bdf8", w: 100, h: 100, shape: "diamond" },
  { type: "database", label: "Database", icon: "database", color: "#60a5fa", w: 90, h: 74, shape: "cylinder" },
  { type: "cache", label: "Cache", icon: "cache", color: "#38bdf8", w: 88, h: 68, shape: "cylinder" },
  { type: "queue", label: "Message Queue", icon: "queue", color: "#a78bfa", w: 160, h: 48, shape: "pipe" },
  { type: "storage", label: "Object Store", icon: "storage", color: "#38bdf8", w: 110, h: 70, shape: "cylinder" },
  { type: "cdn", label: "CDN", icon: "cdn", color: "#60a5fa", w: 90, h: 90, shape: "circle" },
  { type: "service", label: "Microservice", icon: "service", color: "#a78bfa", w: 110, h: 64, shape: "hex" },
  { type: "worker", label: "Worker", icon: "worker", color: "#94a3b8", w: 100, h: 56 },
  { type: "dns", label: "DNS", icon: "dns", color: "#60a5fa", w: 80, h: 80, shape: "circle" },
];

// ── SVG Icons (Figma-style line icons) ──────────────────────────────────
function ComponentIcon({ type, color, size = 16 }: { type: string; color: string; size?: number }) {
  const stroke = color;
  const sw = 1.5;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "client":
      return <svg {...common}><rect x="3" y="4" width="18" height="12" rx="2" /><line x1="8" y1="20" x2="16" y2="20" /><line x1="12" y1="16" x2="12" y2="20" /></svg>;
    case "server":
      return <svg {...common}><rect x="4" y="2" width="16" height="6" rx="1.5" /><rect x="4" y="10" width="16" height="6" rx="1.5" /><circle cx="7" cy="5" r="0.8" fill={stroke} stroke="none" /><circle cx="7" cy="13" r="0.8" fill={stroke} stroke="none" /><line x1="4" y1="18" x2="8" y2="22" /><line x1="20" y1="18" x2="16" y2="22" /></svg>;
    case "api":
      return <svg {...common}><path d="M4 12h4l2-6 4 12 2-6h4" /><circle cx="4" cy="12" r="1.5" /><circle cx="20" cy="12" r="1.5" /></svg>;
    case "loadbalancer":
      return <svg {...common}><circle cx="12" cy="5" r="3" /><line x1="12" y1="8" x2="5" y2="19" /><line x1="12" y1="8" x2="12" y2="19" /><line x1="12" y1="8" x2="19" y2="19" /><circle cx="5" cy="19" r="2" /><circle cx="12" cy="19" r="2" /><circle cx="19" cy="19" r="2" /></svg>;
    case "database":
      return <svg {...common}><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" /><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" /></svg>;
    case "cache":
      return <svg {...common}><polygon points="13,2 3,14 12,14 11,22 21,10 12,10" /></svg>;
    case "queue":
      return <svg {...common}><rect x="2" y="6" width="5" height="12" rx="1" /><rect x="9.5" y="6" width="5" height="12" rx="1" /><rect x="17" y="6" width="5" height="12" rx="1" /><line x1="7" y1="12" x2="9.5" y2="12" /><line x1="14.5" y1="12" x2="17" y2="12" /></svg>;
    case "storage":
      return <svg {...common}><path d="M22 12a10 10 0 0 1-10 10 10 10 0 0 1-7.07-2.93" /><path d="M2 12A10 10 0 0 1 12 2a10 10 0 0 1 7.07 2.93" /><path d="M12 2v20" /><path d="M2 12h20" /><path d="M4.93 4.93l14.14 14.14" /></svg>;
    case "cdn":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2c2.76 2.67 4.33 6.2 4.33 10S14.76 19.33 12 22" /><path d="M12 2c-2.76 2.67-4.33 6.2-4.33 10S9.24 19.33 12 22" /></svg>;
    case "service":
      return <svg {...common}><polygon points="12,2 20,7 20,17 12,22 4,17 4,7" /></svg>;
    case "worker":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
    case "dns":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>;
    default:
      return <svg {...common}><polygon points="12,2 20,7 20,17 12,22 4,17 4,7" /></svg>;
  }
}

let idCounter = 0;
function nextId() {
  return `node-${Date.now()}-${idCounter++}`;
}
function nextConnId() {
  return `conn-${Date.now()}-${idCounter++}`;
}

// ── Component ────────────────────────────────────────────────────────────
export default function SystemDesignCanvas({
  onNodesChange,
}: {
  onNodesChange?: (nodes: DesignNode[], connections: DesignConnection[]) => void;
}) {
  const [nodes, setNodes] = useState<DesignNode[]>([]);
  const [connections, setConnections] = useState<DesignConnection[]>([]);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [connecting, setConnecting] = useState<{ fromId: string; x: number; y: number } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addingText, setAddingText] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Notify parent when nodes/connections change
  useEffect(() => {
    onNodesChange?.(nodes, connections);
  }, [nodes, connections, onNodesChange]);

  // ── Drop from palette ─────────────────────────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("component-type");
      const label = e.dataTransfer.getData("component-label");
      if (!type || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const palItem = COMPONENT_PALETTE.find(p => p.type === type);
      const w = palItem?.w || 130;
      const h = palItem?.h || 54;
      const x = e.clientX - rect.left - w / 2;
      const y = e.clientY - rect.top - h / 2;
      const newNode: DesignNode = {
        id: nextId(),
        type,
        label,
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: w,
        height: h,
      };
      setNodes((prev) => [...prev, newNode]);
    },
    []
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // ── Node dragging ─────────────────────────────────────────────────────
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDragging({
      id: nodeId,
      offsetX: e.clientX - rect.left - node.x,
      offsetY: e.clientY - rect.top - node.y,
    });
    setSelected(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setMousePos({ x: mx, y: my });

    if (dragging) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === dragging.id
            ? { ...n, x: Math.max(0, mx - dragging.offsetX), y: Math.max(0, my - dragging.offsetY) }
            : n
        )
      );
    }
    if (connecting) {
      setConnecting((prev) => (prev ? { ...prev, x: mx, y: my } : null));
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // If connecting, check if we dropped on a node
    if (connecting && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const targetNode = nodes.find(
        (n) =>
          n.id !== connecting.fromId &&
          mx >= n.x &&
          mx <= n.x + n.width &&
          my >= n.y &&
          my <= n.y + n.height
      );
      if (targetNode) {
        const exists = connections.some(
          (c) =>
            (c.from === connecting.fromId && c.to === targetNode.id) ||
            (c.from === targetNode.id && c.to === connecting.fromId)
        );
        if (!exists) {
          setConnections((prev) => [
            ...prev,
            { id: nextConnId(), from: connecting.fromId, to: targetNode.id },
          ]);
        }
      }
    }
    setDragging(null);
    setConnecting(null);
  };

  // ── Connection drawing (right-click drag from node) ────────────────────
  const handleNodeRightDown = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setConnecting({
      fromId: nodeId,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // ── Delete ────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selected && !editingLabel) {
        setNodes((prev) => prev.filter((n) => n.id !== selected));
        setConnections((prev) => prev.filter((c) => c.from !== selected && c.to !== selected));
        setSelected(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, editingLabel]);

  // ── Double-click to rename ────────────────────────────────────────────
  const handleDoubleClick = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setEditingLabel(nodeId);
    setEditValue(node.label);
  };

  const commitLabel = () => {
    if (editingLabel && editValue.trim()) {
      setNodes((prev) =>
        prev.map((n) => (n.id === editingLabel ? { ...n, label: editValue.trim() } : n))
      );
    }
    setEditingLabel(null);
    setEditValue("");
  };

  // ── Connection line helper ────────────────────────────────────────────
  const getNodeCenter = (nodeId: string) => {
    const n = nodes.find((nd) => nd.id === nodeId);
    if (!n) return { x: 0, y: 0 };
    return { x: n.x + n.width / 2, y: n.y + n.height / 2 };
  };

  const paletteColor = (type: string) => {
    return COMPONENT_PALETTE.find((p) => p.type === type)?.color || "#64748b";
  };

  // ── Canvas click (deselect or add text) ────────────────────────────────
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (addingText && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - 40;
      const y = e.clientY - rect.top - 14;
      const newNode: DesignNode = {
        id: nextId(),
        type: "text",
        label: "Text",
        x: Math.max(0, x),
        y: Math.max(0, y),
        width: 100,
        height: 32,
      };
      setNodes((prev) => [...prev, newNode]);
      setAddingText(false);
      // Auto-enter edit mode for the new text
      setEditingLabel(newNode.id);
      setEditValue("Text");
      return;
    }
    if (e.target === containerRef.current || e.target === svgRef.current) {
      setSelected(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Component palette */}
      <div
        data-onboarding="sd-palette"
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid hsl(220, 20%, 18%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "hsl(222, 40%, 8%)",
          flexWrap: "wrap",
          minHeight: 48,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            color: "hsl(215, 15%, 45%)",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginRight: 6,
            flexShrink: 0,
          }}
        >
          Components
        </span>
        {COMPONENT_PALETTE.map((comp) => (
          <div
            key={comp.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("component-type", comp.type);
              e.dataTransfer.setData("component-label", comp.label);
            }}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              background: "rgba(59,130,246,0.06)",
              border: "1px solid hsl(220, 20%, 18%)",
              color: "#f8fafc",
              cursor: "grab",
              fontFamily: "'Inter', sans-serif",
              fontSize: "0.72rem",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 5,
              userSelect: "none",
              whiteSpace: "nowrap",
              transition: "border-color 0.15s, background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(220, 20%, 18%)'; e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; }}
          >
            <span style={{ display: "flex", alignItems: "center", opacity: 0.7 }}><ComponentIcon type={comp.type} color={comp.color} size={13} /></span>
            {comp.label}
          </div>
        ))}
        <div style={{ width: 1, height: 20, background: "hsl(220, 20%, 18%)", margin: "0 2px" }} />
        <button
          onClick={() => setAddingText(!addingText)}
          style={{
            padding: "5px 12px",
            borderRadius: 6,
            background: addingText ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.06)",
            border: addingText ? "1px solid rgba(59,130,246,0.3)" : "1px solid hsl(220, 20%, 18%)",
            color: addingText ? "#60a5fa" : "#f8fafc",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.72rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,7 4,4 20,4 20,7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
          </svg>
          Text
        </button>
      </div>

      {/* Canvas area */}
      <div
        ref={containerRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleCanvasClick}
        style={{
          flex: 1,
          position: "relative",
          background: "hsl(222.2, 84%, 4.9%)",
          overflow: "hidden",
          cursor: addingText ? "text" : connecting ? "crosshair" : "default",
        }}
      >
        {/* Grid dots */}
        <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
          <defs>
            <pattern id="grid-dots" width="30" height="30" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.5" fill="rgba(59,130,246,0.08)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-dots)" />
        </svg>

        {/* SVG layer for connections */}
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
        >
          <defs>
            <marker id="arrow" markerWidth="12" markerHeight="8" refX="11" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L12,4 L0,8 Z" fill="hsl(215, 15%, 45%)" />
            </marker>
          </defs>
          {connections.map((conn) => {
            const fromNode = nodes.find(nd => nd.id === conn.from);
            const toNode = nodes.find(nd => nd.id === conn.to);
            if (!fromNode || !toNode) return null;
            const from = { x: fromNode.x + fromNode.width / 2, y: fromNode.y + fromNode.height / 2 };
            const to = { x: toNode.x + toNode.width / 2, y: toNode.y + toNode.height / 2 };
            // Shorten line so arrow tip sits at the edge of the target node
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const pad = Math.max(toNode.width, toNode.height) / 2 + 4;
            const ax = to.x - (dx / dist) * pad;
            const ay = to.y - (dy / dist) * pad;
            return (
              <g key={conn.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={ax}
                  y2={ay}
                  stroke="hsl(215, 15%, 45%)"
                  strokeWidth={1.5}
                  markerEnd="url(#arrow)"
                  strokeDasharray="6 3"
                />
                {conn.label && (
                  <text
                    x={(from.x + to.x) / 2}
                    y={(from.y + to.y) / 2 - 6}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="Inter, sans-serif"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}
          {/* Temporary connection line while dragging */}
          {connecting && (
            <line
              x1={getNodeCenter(connecting.fromId).x}
              y1={getNodeCenter(connecting.fromId).y}
              x2={mousePos.x}
              y2={mousePos.y}
              stroke="#3b82f6"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              opacity={0.7}
            />
          )}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const color = paletteColor(node.type);
          const isSelected = selected === node.id;
          const palette = COMPONENT_PALETTE.find((p) => p.type === node.type);
          const isText = node.type === "text";
          const shape = palette?.shape || "rect";
          const borderRadius = shape === "circle" ? "50%" : shape === "pill" ? 999 : shape === "diamond" ? 6 : shape === "cylinder" ? "10px 10px 14px 14px" : shape === "hex" ? 10 : 10;
          const transform = shape === "diamond" ? "rotate(45deg)" : undefined;
          const innerTransform = shape === "diamond" ? "rotate(-45deg)" : undefined;
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onContextMenu={(e) => handleNodeRightDown(e, node.id)}
              onDoubleClick={() => handleDoubleClick(node.id)}
              style={{
                position: "absolute",
                left: node.x,
                top: node.y,
                width: isText ? "auto" : node.width,
                height: isText ? "auto" : node.height,
                minWidth: isText ? 40 : undefined,
                background: isText ? "transparent" : "hsl(222, 40%, 8%)",
                border: isText
                  ? (isSelected ? `1px dashed ${color}60` : "1px dashed transparent")
                  : `1.5px solid ${isSelected ? color : 'hsl(220, 20%, 20%)'}`,
                borderRadius: isText ? 4 : borderRadius,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: isText ? 0 : 3,
                cursor: dragging?.id === node.id ? "grabbing" : "grab",
                boxShadow: isText
                  ? "none"
                  : isSelected
                    ? `0 0 0 2px ${color}25, 0 8px 24px rgba(0,0,0,0.4)`
                    : "0 2px 12px rgba(0,0,0,0.3)",
                transition: dragging?.id === node.id ? "none" : "box-shadow 0.15s, border-color 0.15s",
                transform,
                userSelect: "none",
                zIndex: dragging?.id === node.id ? 100 : isSelected ? 50 : 1,
                padding: isText ? "4px 8px" : "8px 10px",
              }}
            >
              <div style={{ transform: innerTransform, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: isText ? 0 : 2, width: "100%", height: "100%" }}>
              {!isText && (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}><ComponentIcon type={node.type} color={color} size={18} /></span>
              )}
              {editingLabel === node.id ? (
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={commitLabel}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitLabel();
                    if (e.key === "Escape") setEditingLabel(null);
                  }}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    borderRadius: 4,
                    color: "#f8fafc",
                    fontSize: "0.72rem",
                    fontFamily: "'Inter', sans-serif",
                    textAlign: "center",
                    padding: "2px 4px",
                    width: "90%",
                    outline: "none",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.72rem",
                    fontWeight: 500,
                    color: "#f8fafc",
                    textAlign: "center",
                    lineHeight: 1.2,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.label}
                </span>
              )}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "hsl(215, 15%, 35%)",
                fontSize: "0.95rem",
                fontWeight: 500,
                margin: "0 0 6px",
              }}
            >
              Drag components here to design your system
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", color: "hsl(215, 15%, 25%)", fontSize: "0.78rem" }}>
              Right-click drag between components to draw connections
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
