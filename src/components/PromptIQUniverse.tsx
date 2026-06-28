"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, BookOpen, Cpu, Layers, FileText, Search, type LucideIcon } from "lucide-react";

interface Node {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: LucideIcon;
  color: string;
  glow: string;
  side: "left" | "right";
  gridR: number; // Row index in 3D grid
  gridC: number; // Column index in 3D grid
  delay: number;
}

// Symmetric left and right node placement - leaving the center 100% clear.
const NODES: Node[] = [
  // Left side nodes
  { id: "opt", title: "Prompt Optimization", shortDesc: "AI-driven enhancement",    fullDesc: "Refines instructions using contextual expansion and model-specific styling.",        icon: Sparkles, color: "#8B5CF6", glow: "rgba(139,92,246,0.28)", side: "left",  gridR: 5,  gridC: 2,  delay: 0 },
  { id: "cmp", title: "Prompt Comparison",   shortDesc: "Side-by-side evaluation",  fullDesc: "Compare models simultaneously with custom criteria and token cost details.",         icon: Layers,   color: "#6366F1", glow: "rgba(99,102,241,0.28)",  side: "left",  gridR: 7,  gridC: 4,  delay: 0.25 },
  { id: "lib", title: "Prompt Library",      shortDesc: "Centralized repository",   fullDesc: "Organize, tag, version, and deploy approved prompts with access control.",          icon: BookOpen, color: "#A855F7", glow: "rgba(168,85,247,0.28)", side: "left",  gridR: 9,  gridC: 2,  delay: 0.5 },

  // Right side nodes
  { id: "src", title: "Semantic Search",     shortDesc: "AI vector search",         fullDesc: "Find prompts conceptually using natural language queries and intent understanding.",   icon: Search,   color: "#8B5CF6", glow: "rgba(139,92,246,0.28)", side: "right", gridR: 5,  gridC: 15, delay: 0.15 },
  { id: "tpl", title: "Variables & Templates", shortDesc: "Reusable setups",        fullDesc: "Dynamic prompts using variable placeholders for context, profiles, or data.",        icon: FileText, color: "#6366F1", glow: "rgba(99,102,241,0.28)",  side: "right", gridR: 7,  gridC: 13, delay: 0.65 },
  { id: "mdl", title: "AI Models",           shortDesc: "Unified provider routing", fullDesc: "Test prompts across GPT-4o, Claude 3.5, Gemini 1.5, Llama 3 seamlessly.",           icon: Cpu,      color: "#60A5FA", glow: "rgba(96,165,250,0.28)",  side: "right", gridR: 9,  gridC: 15, delay: 1.0 },
];

export default function PromptIQUniverse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  // refs for dynamic positioning from the canvas animation loop
  const nodeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const aiEngineRef = useRef<HTMLDivElement>(null);

  const activeRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);

  useEffect(() => {
    activeRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    hoverRef.current = hoverId;
  }, [hoverId]);

  // ── Canvas: 3D wave grid ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const TILT = 1.05, cosT = Math.cos(TILT), sinT = Math.sin(TILT), CAM = 700;
    const COLS = 18, ROWS = 14, SX = 72, SY = 52;
    let cw = 0, ch = 0;

    function resize() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      cw = canvas!.clientWidth; ch = canvas!.clientHeight;
      canvas!.width = cw * dpr; canvas!.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);

    function proj(u: number, v: number, z: number, mcx: number, mcy: number) {
      const ry = v * cosT - z * sinT, rz = v * sinT + z * cosT;
      const s = CAM / (CAM + rz + 80);
      return { px: mcx + u * s, py: mcy + ry * s };
    }

    let t = 0;
    function draw() {
      t += 0.013;
      ctx.clearRect(0, 0, cw, ch);
      const mcx = cw / 2, mcy = ch * 0.66;

      // Build vertex grid
      type V = { px: number; py: number; vy: number };
      const G: V[][] = [];
      for (let r = 0; r < ROWS; r++) {
        G[r] = [];
        for (let c = 0; c < COLS; c++) {
          const u = (c - (COLS - 1) / 2) * SX, v = (r - (ROWS - 1) / 2) * SY;
          const d = Math.sqrt(u * u + v * v);
          const wz = Math.sin(u * 0.008 + t) * Math.cos(v * 0.008 + t * 0.75) * 30 + Math.sin(d * 0.01 - t * 1.3) * 12;
          const { px, py } = proj(u, v, wz, mcx, mcy);
          G[r][c] = { px, py, vy: v };
        }
      }

      // Draw soft shadows on canvas under the weighted balls to ground them
      NODES.forEach(n => {
        const pt = G[n.gridR]?.[n.gridC];
        if (pt) {
          const bob = Math.sin(t * 1.5 + n.delay * 2) * 3;
          const shadowScale = 1 - (bob / 12);
          ctx.beginPath();
          ctx.ellipse(pt.px, pt.py + 5, 17 * shadowScale, 5 * shadowScale, 0, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(0, 0, 0, 0.07)";
          ctx.fill();
        }
      });

      // Draw shadow for the central AI Engine
      const centerPt = G[7]?.[9];
      if (centerPt) {
        ctx.beginPath();
        ctx.ellipse(centerPt.px, centerPt.py + 8, 32, 8, 0, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(234, 88, 12, 0.12)";
        ctx.fill();
      }

      // ─ Horizontal lines (gorgeous soft warm grey-violet) ─
      const GC = "175, 170, 185";
      ctx.lineWidth = 1.15;
      for (let r = 0; r < ROWS; r++) {
        ctx.beginPath();
        for (let c = 0; c < COLS; c++) {
          const { px, py } = G[r][c];
          c === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        const depthNorm = r / (ROWS - 1);
        const a = 0.12 + depthNorm * 0.46; // 0.12 (far) to 0.58 (near)
        const g = ctx.createLinearGradient(G[r][0].px, 0, G[r][COLS - 1].px, 0);
        g.addColorStop(0, `rgba(${GC}, 0)`);
        g.addColorStop(0.12, `rgba(${GC}, ${a})`);
        g.addColorStop(0.88, `rgba(${GC}, ${a})`);
        g.addColorStop(1, `rgba(${GC}, 0)`);
        ctx.strokeStyle = g; ctx.stroke();
      }

      // ─ Vertical lines ─
      for (let c = 0; c < COLS; c++) {
        ctx.beginPath();
        for (let r = 0; r < ROWS; r++) {
          const { px, py } = G[r][c];
          r === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        const side = 1 - Math.abs((c - (COLS - 1) / 2) / ((COLS - 1) / 2));
        ctx.strokeStyle = `rgba(${GC}, ${0.06 + side * 0.34})`; ctx.stroke();
      }

      // ─ Intersection dots ─
      for (let r = 1; r < ROWS - 1; r += 2) for (let c = 1; c < COLS - 1; c += 2) {
        const { px, py } = G[r][c];
        const a = 0.18 + (r / (ROWS - 1)) * 0.52;
        ctx.beginPath(); ctx.arc(px, py, 1.8, 0, 6.28);
        ctx.fillStyle = `rgba(${GC}, ${a})`; ctx.fill();
      }

      // ─ Edge fades ─
      const fL = ctx.createLinearGradient(0, 0, cw * 0.09, 0);
      fL.addColorStop(0, "rgba(255,255,255,1)"); fL.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = fL; ctx.fillRect(0, 0, cw * 0.09, ch);

      const fR = ctx.createLinearGradient(cw * 0.91, 0, cw, 0);
      fR.addColorStop(0, "rgba(255,255,255,0)"); fR.addColorStop(1, "rgba(255,255,255,1)");
      ctx.fillStyle = fR; ctx.fillRect(cw * 0.91, 0, cw * 0.09, ch);

      const fB = ctx.createLinearGradient(0, ch * 0.91, 0, ch);
      fB.addColorStop(0, "rgba(255,255,255,0)"); fB.addColorStop(1, "rgba(255,255,255,1)");
      ctx.fillStyle = fB; ctx.fillRect(0, ch * 0.91, cw, ch * 0.09);

      // Top fade — keep above 40% clean
      const fT = ctx.createLinearGradient(0, 0, 0, ch * 0.40);
      fT.addColorStop(0, "rgba(255,255,255,1)"); fT.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = fT; ctx.fillRect(0, 0, cw, ch * 0.40);

      // Dynamically position the Central AI Engine
      const engineEl = aiEngineRef.current;
      if (engineEl) {
        const pt = G[7]?.[9];
        if (pt) {
          engineEl.style.left = `${pt.px}px`;
          engineEl.style.top = `${pt.py}px`;
          engineEl.style.transform = "translate(-50%,-50%)";
        }
      }

      // Dynamically position nodes in sync with wave animation
      NODES.forEach(n => {
        const el = nodeRefs.current[n.id];
        if (!el) return;
        const pt = G[n.gridR]?.[n.gridC];
        if (pt) {
          const isActive = activeRef.current === n.id;
          const isDimmed = activeRef.current !== null && !isActive;
          const bob = Math.sin(t * 1.5 + n.delay * 2) * 3;
          el.style.left = `${pt.px}px`;
          el.style.top = `${pt.py + bob}px`;
          el.style.transform = `translate(-50%,-50%) scale(${isActive ? 1.15 : 1})`;
          el.style.opacity = String(isActive ? 1 : isDimmed ? 0.22 : 1);
          el.style.zIndex = String(isActive ? 500 : 10);
        }
      });

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <div className="absolute inset-0" onClick={() => setActiveId(null)}>
      {/* Canvas wave grid */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ width: "100%", height: "100%" }} />

      {/* Ambient purple glow at grid center */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 40% at 50% 66%, rgba(139,92,246,0.05) 0%, transparent 70%)" }} />

      {/* ── Central AI Engine ── */}
      <div ref={aiEngineRef} className="absolute" style={{ zIndex: 50 }}>
        <div className="relative flex items-center justify-center">
          <motion.div className="absolute rounded-full"
            style={{ width: 144, height: 144, background: "radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(234,88,12,0.06) 55%, transparent 100%)" }}
            animate={{ scale: [1, 1.14, 1], opacity: [0.65, 0.95, 0.65] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} />
          <motion.div className="absolute rounded-full"
            style={{ width: 96, height: 96, background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(251,146,60,0.70) 28%, rgba(234,88,12,0.15) 65%, transparent 100%)" }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.65, 0.9, 0.65] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
          <div className="absolute pointer-events-none" style={{ transform: "rotateX(70deg) rotateY(-20deg)" }}>
            <motion.div className="border border-[#F97316]/30 rounded-full" style={{ width: 138, height: 138 }}
              animate={{ rotate: 360 }} transition={{ duration: 13, repeat: Infinity, ease: "linear" }} />
          </div>
          <div className="absolute pointer-events-none" style={{ transform: "rotateX(65deg) rotateY(25deg)" }}>
            <motion.div className="border border-[#8B5CF6]/20 rounded-full" style={{ width: 166, height: 166 }}
              animate={{ rotate: -360 }} transition={{ duration: 17, repeat: Infinity, ease: "linear" }} />
          </div>
          <motion.div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg,#F97316,#EA580C,#DC2626)", boxShadow: "0 0 28px #EA580C,0 0 10px #F97316 inset", border: "1.5px solid rgba(255,255,255,0.35)" }}
            animate={{ y: [-2, 2, -2] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L22 7L22 17L12 22L2 17L2 7Z" /><path d="M2 7L12 12L22 7" /><path d="M12 12L12 22" />
            </svg>
          </motion.div>
          <div className="absolute pointer-events-none" style={{ top: "calc(50% + 42px)", left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
            <span className="text-[10px] tracking-[0.22em] font-extrabold uppercase text-[#EA580C] bg-white/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-orange-400/20 shadow-sm">AI Engine</span>
          </div>
        </div>
      </div>

      {/* ── Feature nodes — LEFT & RIGHT sides only ── */}
      {NODES.map(n => {
        const NodeIcon = n.icon;
        const isActive = activeId === n.id;
        const isHovered = hoverId === n.id;
        const labelOnRight = n.side === "left";

        return (
          <div
            key={n.id}
            ref={el => { nodeRefs.current[n.id] = el; }}
            className="absolute cursor-pointer"
            style={{ left: 0, top: 0, transform: "translate(-50%,-50%)", zIndex: isActive ? 200 : 10 }}
            onClick={e => { e.stopPropagation(); setActiveId(isActive ? null : n.id); }}
            onMouseEnter={() => setHoverId(n.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            {/* Pulse ring */}
            <AnimatePresence>
              {(isHovered || isActive) && (
                <motion.div className="absolute -inset-3 rounded-full pointer-events-none"
                  style={{ border: `1.5px solid ${n.color}`, boxShadow: `0 0 12px ${n.glow}` }}
                  initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: [0.8, 0.35, 0.8], scale: [1, 1.06, 1] }}
                  exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
              )}
            </AnimatePresence>

            {/* Sphere — premium glossy 3D glass ball resting on grid */}
            <div className="relative flex items-center justify-center rounded-full"
              style={{
                width: 52, height: 52,
                background: `radial-gradient(circle at 35% 35%, #ffffff 0%, #f9fafb 32%, #f3f4f6 60%, ${n.glow.replace('0.28', '0.12')} 85%, ${n.glow.replace('0.28', '0.22')} 100%)`,
                boxShadow: isHovered || isActive
                  ? `0 10px 24px -4px rgba(0,0,0,0.12), inset 2px 2px 4px rgba(255,255,255,0.9), inset -2px -2px 6px rgba(0,0,0,0.06)`
                  : `0 6px 18px -4px rgba(0,0,0,0.08), inset 2px 2px 3px rgba(255,255,255,0.95), inset -2px -2px 5px rgba(0,0,0,0.04)`,
                border: `1px solid ${isHovered || isActive ? n.color : "rgba(210, 205, 225, 0.55)"}`,
                transition: "box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease",
              }}>
              <NodeIcon size={17} style={{ color: isHovered || isActive ? n.color : "#9CA3AF", transition: "color 0.2s" }} />
            </div>

            {/* Floating label */}
            {!isActive && (
              <div className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider pointer-events-none border transition-all duration-150 ${labelOnRight ? "left-15" : "right-15"}`}
                style={{
                  opacity: isHovered ? 1 : 0.50, background: isHovered ? "white" : "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)",
                  borderColor: isHovered ? n.color : "rgba(229,231,235,0.7)", color: isHovered ? "#1A1A2E" : "#5B6278"
                }}>
                {n.title}
              </div>
            )}

            {/* Info panel */}
            <AnimatePresence>
              {(isHovered || isActive) && (
                <motion.div className={`absolute z-50 p-4 rounded-xl border pointer-events-auto ${labelOnRight ? "left-15" : "right-15"}`}
                  style={{
                    top: "-10px", width: isActive ? "260px" : "180px", background: "rgba(255,255,255,0.96)", backdropFilter: "blur(18px)",
                    borderColor: isActive ? n.color : "rgba(139,92,246,0.13)",
                    boxShadow: isActive ? `0 12px 32px rgba(99,102,241,0.13), 0 4px 10px ${n.glow}` : "0 8px 20px rgba(0,0,0,0.07)"
                  }}
                  initial={{ opacity: 0, scale: 0.92, x: labelOnRight ? -6 : 6 }} animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.92, x: labelOnRight ? -6 : 6 }} transition={{ duration: 0.18, ease: [0.215, 0.61, 0.355, 1] }}
                  onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-md" style={{ background: n.glow }}>
                      <NodeIcon size={11} style={{ color: n.color }} />
                    </div>
                    <h4 className="text-[11px] font-bold text-[#0A0A0A] uppercase tracking-wide">{n.title}</h4>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#6B7280]">{isActive ? n.fullDesc : n.shortDesc}</p>
                  {isActive && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[9px] text-[#8B5CF6] font-semibold">
                      <span>Active Module</span>
                      <button className="hover:underline" onClick={() => setActiveId(null)}>Dismiss</button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
