"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LucideIcon,
  Sparkles,
  Folder,
  Cpu,
  Layers,
  History,
  BarChart3,
  Users,
  FileText,
  Search,
  Code2,
  Shield,
  BookOpen
} from "lucide-react";

// Feature node interface
interface FeatureNode {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  orbitIndex: number; // 0: Inner, 1: Middle, 2: Outer
  angleOffset: number; // phase offset in radians
}

// Grid vertex for 3D simulation
interface Vertex3D {
  x: number;
  y: number;
  z: number;
  px?: number; // projected screen x
  py?: number; // projected screen y
}

// Floating particle interface
interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  opacity: number;
}

export default function PromptIQUniverse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  // 12 PromptIQ capabilities
  const nodes: FeatureNode[] = useMemo(() => [
    // --- Orbit 0 (Inner): radius ~180px, speed ~0.15 rad/s
    {
      id: "opt",
      title: "Prompt Optimization",
      shortDesc: "AI-driven prompt enhancement",
      fullDesc: "Automatically refines user instructions using dynamic contextual expansion, structural improvements, and model-specific styling to output optimal responses.",
      icon: Sparkles,
      color: "var(--color-brand-violet)", // #8B5CF6
      glowColor: "rgba(139, 92, 246, 0.4)",
      orbitIndex: 0,
      angleOffset: 0,
    },
    {
      id: "lib",
      title: "Prompt Library",
      shortDesc: "Centralized secure repository",
      fullDesc: "A collaborative corporate hub for organizing, tagging, versioning, and deploying approved prompts across team workspaces with instant access control.",
      icon: BookOpen,
      color: "var(--color-brand-purple-light)", // #A855F7
      glowColor: "rgba(168, 85, 247, 0.4)",
      orbitIndex: 0,
      angleOffset: Math.PI / 2,
    },
    {
      id: "models",
      title: "AI Models Integration",
      shortDesc: "Unified provider routing",
      fullDesc: "Test, manage, and scale prompts across GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Llama 3, and custom fine-tuned model environments seamlessly.",
      icon: Cpu,
      color: "var(--color-brand-blue)", // #60A5FA
      glowColor: "rgba(96, 165, 250, 0.4)",
      orbitIndex: 0,
      angleOffset: Math.PI,
    },
    {
      id: "security",
      title: "Enterprise Security",
      shortDesc: "PII masking and audit logs",
      fullDesc: "Strict compliance controls featuring automated personal data (PII) redaction, encryption-at-rest, RBAC, and detailed usage logging audits.",
      icon: Shield,
      color: "var(--color-brand-pink)", // #EC4899
      glowColor: "rgba(236, 72, 153, 0.4)",
      orbitIndex: 0,
      angleOffset: (3 * Math.PI) / 2,
    },

    // --- Orbit 1 (Middle): radius ~260px, speed ~0.10 rad/s
    {
      id: "compare",
      title: "Prompt Comparison",
      shortDesc: "Side-by-side evaluation",
      fullDesc: "Run comparisons across models simultaneously. Grade output quality with custom evaluation criteria, response latencies, and token cost details.",
      icon: Layers,
      color: "var(--color-brand-purple)", // #6366F1
      glowColor: "rgba(99, 102, 241, 0.4)",
      orbitIndex: 1,
      angleOffset: Math.PI / 4,
    },
    {
      id: "colls",
      title: "Collections",
      shortDesc: "Custom tag-based folders",
      fullDesc: "Group prompts dynamically by product lines, clients, or specific tasks. Structure collections with search terms and tags for structured cataloging.",
      icon: Folder,
      color: "var(--color-brand-purple-light)",
      glowColor: "rgba(168, 85, 247, 0.4)",
      orbitIndex: 1,
      angleOffset: (3 * Math.PI) / 4,
    },
    {
      id: "history",
      title: "Version History",
      shortDesc: "Audit revision tracks",
      fullDesc: "Automatic tracking of modifications, code diff overlays, author stamps, rollback capabilities, and git-style prompt commit branches.",
      icon: History,
      color: "var(--color-brand-violet)",
      glowColor: "rgba(139, 92, 246, 0.4)",
      orbitIndex: 1,
      angleOffset: (5 * Math.PI) / 4,
    },
    {
      id: "analytics",
      title: "Advanced Analytics",
      shortDesc: "Token and cost reports",
      fullDesc: "Aggregated reports on token volume, billing estimates, performance curves, execution failure frequencies, and model success matrices.",
      icon: BarChart3,
      color: "var(--color-brand-pink)",
      glowColor: "rgba(236, 72, 153, 0.4)",
      orbitIndex: 1,
      angleOffset: (7 * Math.PI) / 4,
    },

    // --- Orbit 2 (Outer): radius ~340px, speed ~0.06 rad/s
    {
      id: "team",
      title: "Team Collaboration",
      shortDesc: "Real-time prompt reviews",
      fullDesc: "Review, test, comment, and iterate on prompts with team members. Includes peer approvals before promoting prompts to production endpoints.",
      icon: Users,
      color: "var(--color-brand-blue)",
      glowColor: "rgba(96, 165, 250, 0.4)",
      orbitIndex: 2,
      angleOffset: Math.PI / 6,
    },
    {
      id: "templates",
      title: "Variables & Templates",
      shortDesc: "Reusable structured setups",
      fullDesc: "Design dynamic prompts using curly-brace variable placeholders. Easily feed run-time client context, user profiles, or raw data streams.",
      icon: FileText,
      color: "var(--color-brand-purple)",
      glowColor: "rgba(99, 102, 241, 0.4)",
      orbitIndex: 2,
      angleOffset: (5 * Math.PI) / 6,
    },
    {
      id: "search",
      title: "Semantic Search",
      shortDesc: "AI-driven vector search",
      fullDesc: "Find prompts conceptually in milliseconds. Understands natural language queries, intent, and relationships instead of basic text filters.",
      icon: Search,
      color: "var(--color-brand-violet)",
      glowColor: "rgba(139, 92, 246, 0.4)",
      orbitIndex: 2,
      angleOffset: (9 * Math.PI) / 6,
    },
    {
      id: "api",
      title: "API Endpoint Access",
      shortDesc: "Direct deployment keys",
      fullDesc: "Deploy any prompt as a production-grade, low-latency API endpoint. Includes lightweight edge client SDKs and hot-reloading keys.",
      icon: Code2,
      color: "var(--color-brand-pink)",
      glowColor: "rgba(236, 72, 153, 0.4)",
      orbitIndex: 2,
      angleOffset: (13 * Math.PI) / 6,
    },
  ], []);

  // Animation ticks using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // Determine rotation speed. Slow down significantly when a node is active
      const speedFactor = activeNodeId ? 0.08 : 0.4;
      setTime((prev) => prev + delta * speedFactor);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [activeNodeId]);

  // 3D Wave grid mesh background + Floating particles (HTML5 Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.clientWidth;
    let height = canvas.height = canvas.clientHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.clientWidth;
      height = canvas.height = canvas.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Setup 3D mesh grid points
    const cols = 15;
    const rows = 12;
    const spacingX = 80;
    const spacingY = 55;
    const meshCY = height * 0.58; // grid center Y shifted slightly down for floor perspective
    const meshCX = width * 0.5;

    // Define 45 floating particles
    const particles: Particle3D[] = Array.from({ length: 45 }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 1.5,
      z: (Math.random() - 0.5) * 400,
      vx: (Math.random() - 0.5) * 6,
      vy: -12 - Math.random() * 20, // float upwards
      vz: (Math.random() - 0.5) * 8,
      size: 1 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.4,
    }));

    let localTime = 0;

    const render = () => {
      localTime += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Grid mesh tilt angle (in radians)
      const tilt = 1.05; // ~60 degrees tilt back
      const cosTilt = Math.cos(tilt);
      const sinTilt = Math.sin(tilt);
      const cameraDist = 650;

      // Project and store grid vertices
      const vertices: Vertex3D[][] = [];
      for (let r = 0; r < rows; r++) {
        vertices[r] = [];
        for (let c = 0; c < cols; c++) {
          const u = (c - (cols - 1) / 2) * spacingX;
          const v = (r - (rows - 1) / 2) * spacingY;

          // Wave function to compute height (z-axis displacement)
          // Simple combination of traveling sine wave & concentric circular wave
          const distFromCenter = Math.sqrt(u * u + v * v);
          const w1 = Math.sin(u * 0.007 + localTime) * Math.cos(v * 0.007 + localTime * 0.8) * 35;
          const w2 = Math.sin(distFromCenter * 0.009 - localTime * 1.5) * 15;
          const z = w1 + w2;

          // Camera transformation: rotate around X-axis (tilt)
          const rotY = v * cosTilt - z * sinTilt;
          const rotZ = v * sinTilt + z * cosTilt;

          // Perspective scaling
          const scale = cameraDist / (cameraDist + rotZ);
          const px = meshCX + u * scale;
          const py = meshCY + rotY * scale;

          vertices[r][c] = { x: u, y: v, z, px, py };
        }
      }

      // Draw Grid Lines with dynamic opacity based on depth
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const current = vertices[r][c];

          // 1. Draw horizontal connections (columns)
          if (c < cols - 1) {
            const next = vertices[r][c + 1];
            // Fade out lines in the distance (deeper z-values)
            const alpha = Math.max(0.01, Math.min(0.24, 0.22 - (current.y + 200) * 0.0004));
            
            ctx.beginPath();
            ctx.moveTo(current.px!, current.py!);
            ctx.lineTo(next.px!, next.py!);
            
            // Subtle indigo-to-purple gradient blend
            const grad = ctx.createLinearGradient(current.px!, current.py!, next.px!, next.py!);
            grad.addColorStop(0, `rgba(99, 102, 241, ${alpha})`);
            grad.addColorStop(1, `rgba(139, 92, 246, ${alpha})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }

          // 2. Draw vertical connections (rows)
          if (r < rows - 1) {
            const next = vertices[r + 1][c];
            const alpha = Math.max(0.01, Math.min(0.24, 0.22 - (current.y + 200) * 0.0004));
            
            ctx.beginPath();
            ctx.moveTo(current.px!, current.py!);
            ctx.lineTo(next.px!, next.py!);
            
            const grad = ctx.createLinearGradient(current.px!, current.py!, next.px!, next.py!);
            grad.addColorStop(0, `rgba(139, 92, 246, ${alpha})`);
            grad.addColorStop(1, `rgba(236, 72, 153, ${alpha})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }
      }

      // Draw glowing vertices (intersections) on the mesh
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Draw dots occasionally to keep it uncluttered
          if ((r + c) % 3 === 0) {
            const vert = vertices[r][c];
            const alpha = Math.max(0, Math.min(0.85, 0.65 - (vert.y + 200) * 0.0007));
            
            if (alpha > 0.05) {
              ctx.beginPath();
              ctx.arc(vert.px!, vert.py!, 1.5, 0, 2 * Math.PI);
              ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.fill();

              // Subtle glowing corona on the vertices
              if ((r + c) % 6 === 0) {
                ctx.beginPath();
                ctx.arc(vert.px!, vert.py!, 5, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.28})`;
                ctx.fill();
              }
            }
          }
        }
      }

      // Render Floating Particles in 3D Space
      particles.forEach((p) => {
        // Drift particle
        p.y += p.vy * 0.016; // float up
        p.x += p.vx * 0.016;
        p.z += p.vz * 0.016;

        // Reset if it drifts off top
        if (p.y < -height * 0.8) {
          p.y = height * 0.8;
          p.x = (Math.random() - 0.5) * width * 1.5;
        }

        // Camera tilt math
        const rotY = p.y * cosTilt - p.z * sinTilt;
        const rotZ = p.y * sinTilt + p.z * cosTilt;
        const scale = cameraDist / (cameraDist + rotZ);

        if (scale > 0) {
          const px = meshCX + p.x * scale;
          const py = meshCY + rotY * scale;

          // Draw if on-screen
          if (px > 0 && px < width && py > 0 && py < height) {
            const size = p.size * scale;
            const alpha = p.opacity * Math.max(0, Math.min(1, 1 - rotZ / 500));

            ctx.beginPath();
            ctx.arc(px, py, size, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.fill();
            
            // Inner core
            ctx.beginPath();
            ctx.arc(px, py, size * 0.5, 0, 2 * Math.PI);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
            ctx.fill();
          }
        }
      });
    };

    let localFrameId: number;
    const animationLoop = () => {
      render();
      localFrameId = requestAnimationFrame(animationLoop);
    };
    animationLoop();

    return () => {
      cancelAnimationFrame(localFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Compute absolute orbit coordinates based on current time
  const sceneDimensions = { width: 620, height: 480 };
  const CX = sceneDimensions.width / 2;
  const CY = sceneDimensions.height / 2 + 10; // offset center slightly down to balance

  // Calculate projected positions of all nodes
  const projectedNodes = useMemo(() => {
    // 3D orbit radii and inclination paths
    const orbitSetups = [
      { rx: 175, ry: 60, rz: 175, tiltAngle: -0.15, dir: 1, speed: 0.16 }, // Inner
      { rx: 245, ry: 90, rz: 245, tiltAngle: 0.22, dir: -1, speed: 0.11 }, // Middle
      { rx: 320, ry: 120, rz: 320, tiltAngle: -0.08, dir: 1, speed: 0.07 }, // Outer
    ];

    return nodes.map((node) => {
      const setup = orbitSetups[node.orbitIndex];
      // Angle: startOffset + direction * time * speed
      const angle = node.angleOffset + setup.dir * time * setup.speed;

      // 3D coordinates on inclined orbital plane
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      
      const x0 = cosA * setup.rx;
      const y0 = sinA * setup.ry;
      const z = sinA * setup.rz; // depth axis: positive is front, negative is back

      // Tilt orbit path around Z-axis
      const cosTilt = Math.cos(setup.tiltAngle);
      const sinTilt = Math.sin(setup.tiltAngle);
      const x = x0 * cosTilt - y0 * sinTilt;
      const y = x0 * sinTilt + y0 * cosTilt;

      // 3D depth scale factor
      // z ranges from -rz to +rz. Max depth maps to scale 0.76, max proximity maps to 1.24
      const scale = 1.0 + (z / setup.rz) * 0.22;
      const opacity = 0.55 + ((z + setup.rz) / (2 * setup.rz)) * 0.45; // dimmer in background
      
      // Project to 2D
      const px = CX + x;
      const py = CY + y;

      // Dynamic z-index: range ~1000 to ~7000 (central engine is at 4000)
      const zIndex = Math.round(4000 + (z / setup.rz) * 2900);

      // Float offset
      const floatOffset = Math.sin(time * 1.5 + node.angleOffset) * 6;

      return {
        ...node,
        px,
        py: py + floatOffset,
        scale,
        opacity,
        zIndex,
        zDepth: z,
      };
    });
  }, [nodes, time, CX, CY]);

  // Handle clicking on background to close active nodes
  const handleBackgroundClick = () => {
    if (activeNodeId) {
      setActiveNodeId(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{
        width: "100%",
        height: sceneDimensions.height,
        maxWidth: "680px",
        margin: "0 auto",
      }}
      onClick={handleBackgroundClick}
    >
      {/* 1. Canvas 3D Perspective Wave Grid and Particles */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none rounded-2xl"
        style={{
          width: "100%",
          height: "100%",
          maskImage: "radial-gradient(ellipse at center, black 60%, transparent 95%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 60%, transparent 95%)",
        }}
      />

      {/* 2. Soft Ambient Lighting Aura underneath the scene */}
      <div
        className="pointer-events-none absolute -inset-10 opacity-30 z-0 animate-pulse-glow"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.16) 0%, rgba(236, 72, 153, 0.08) 35%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      {/* 3. Central AI Engine Sphere */}
      <div
        className="absolute"
        style={{
          left: CX,
          top: CY,
          transform: "translate(-50%, -50%)",
          zIndex: 4000,
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Radial breathing glow backplates */}
          <motion.div
            className="absolute h-36 w-36 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(249, 115, 22, 0.35) 0%, rgba(234, 88, 12, 0.12) 40%, rgba(139, 92, 246, 0.02) 70%, transparent 100%)",
            }}
            animate={{
              scale: activeNodeId ? [1, 1.08, 1] : [1, 1.15, 1],
              opacity: activeNodeId ? [0.6, 0.8, 0.6] : [0.75, 0.95, 0.75],
            }}
            transition={{
              duration: activeNodeId ? 2.0 : 4.0,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute h-24 w-24 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(251, 146, 60, 0.8) 25%, rgba(234, 88, 12, 0.25) 60%, transparent 100%)",
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [0.7, 0.9, 0.7],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Central Orbiting Holographic Rings (Tilted) */}
          <div className="absolute pointer-events-none" style={{ transform: "rotateX(70deg) rotateY(-20deg)" }}>
            <motion.div
              className="border border-[#F97316]/40 rounded-full"
              style={{ width: 140, height: 140 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="absolute pointer-events-none" style={{ transform: "rotateX(65deg) rotateY(25deg)" }}>
            <motion.div
              className="border border-[#8B5CF6]/30 rounded-full"
              style={{ width: 165, height: 165 }}
              animate={{ rotate: -360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            />
          </div>

          {/* Main glowing engine ball */}
          <motion.div
            className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#DC2626] shadow-[0_0_35px_#EA580C,0_0_15px_#F97316_inset]"
            style={{ border: "1.5px solid rgba(255,255,255,0.4)" }}
            animate={{
              y: [-2, 2, -2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Inner Core icon - 3D Cube resembling AIEngine */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)] animate-pulse"
            >
              <path d="M12 2 L22 7 L22 17 L12 22 L2 17 L2 7 Z" />
              <path d="M2 7 L12 12 L22 7" />
              <path d="M12 12 L12 22" />
            </svg>
          </motion.div>

          {/* Glowing particle ring around core */}
          <div className="absolute text-center mt-28 z-20 pointer-events-none select-none">
            <span className="text-[10px] tracking-[0.25em] font-extrabold uppercase text-[#EA580C] bg-white/70 backdrop-blur-md px-2 py-0.5 rounded-full border border-orange-500/20 shadow-sm shadow-orange-500/10">
              AI Engine
            </span>
          </div>
        </div>
      </div>

      {/* 4. Orbiting Feature Nodes */}
      {projectedNodes.map((node) => {
        const NodeIcon = node.icon;
        
        // Active/inactive styling overrides
        const isActive = activeNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;
        const isDimmed = activeNodeId !== null && !isActive;

        // Base opacity based on depth, faded if another node is active
        const baseOpacity = isDimmed ? 0.12 : node.opacity;

        return (
          <div
            key={node.id}
            className="absolute transition-all duration-300 ease-out"
            style={{
              left: node.px,
              top: node.py,
              transform: `translate(-50%, -50%) scale(${isActive ? 1.15 : isHovered ? 1.08 : node.scale})`,
              zIndex: isActive ? 9999 : node.zIndex,
              opacity: isActive ? 1.0 : baseOpacity,
            }}
          >
            {/* Clickable node wrapper */}
            <div
              className="relative cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation(); // prevent background click from closing
                setActiveNodeId(isActive ? null : node.id);
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Outer pulsing ring (on hover or active) */}
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.div
                    className="absolute -inset-3.5 rounded-full z-0 pointer-events-none"
                    style={{
                      border: `1.5px solid ${node.color}`,
                      boxShadow: `0 0 16px ${node.glowColor}`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: [0.8, 0.4, 0.8],
                      scale: [1, 1.06, 1],
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Holographic link lines back to AI Engine (drawn in CSS/SVG overlay) */}
              {isActive && (
                <svg
                  className="absolute pointer-events-none overflow-visible z-0"
                  style={{
                    left: 0,
                    top: 0,
                    width: 0,
                    height: 0,
                  }}
                >
                  <motion.line
                    x1={0}
                    y1={0}
                    x2={CX - node.px}
                    y2={CY - node.py}
                    stroke={`url(#lineGrad-${node.id})`}
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -20 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <defs>
                    <linearGradient id={`lineGrad-${node.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={node.color} stopOpacity="1" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* Node Badge Element */}
              <div
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white transition-all shadow-sm border`}
                style={{
                  borderColor: isHovered || isActive ? node.color : "rgba(139,92,246,0.12)",
                  boxShadow: isHovered || isActive 
                    ? `0 0 12px ${node.glowColor}, 0 2px 8px rgba(0,0,0,0.05)`
                    : "0 1px 3px rgba(0,0,0,0.04)",
                  background: isHovered || isActive 
                    ? "rgba(255,255,255,1.0)" 
                    : "rgba(255,255,255,0.92)",
                }}
              >
                {/* Small indicator dot in back of badge */}
                <div
                  className="absolute bottom-[-3px] right-[-3px] h-3 w-3 rounded-full border border-white"
                  style={{ background: node.color }}
                />
                
                {/* Badge Icon */}
                <NodeIcon 
                  size={18} 
                  style={{ 
                    color: isHovered || isActive ? node.color : "var(--color-brand-purple)",
                    transform: isHovered || isActive ? "scale(1.08)" : "none",
                    transition: "all 0.2s ease"
                  }} 
                />
              </div>

              {/* Floating label badge (displays when NOT active to keep visual noise low, only hovered/front nodes) */}
              {!isActive && (
                <div
                  className={`absolute top-1/2 left-12 -translate-y-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all duration-200 pointer-events-none border`}
                  style={{
                    opacity: isHovered || node.zDepth > 80 ? 1 : 0.45,
                    background: isHovered ? "white" : "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(6px)",
                    borderColor: isHovered ? node.color : "rgba(229,231,235,0.8)",
                    color: isHovered ? "#1A1A2E" : "#6B7280",
                    boxShadow: isHovered ? `0 4px 12px rgba(99,102,241,0.08)` : "none",
                    transform: isHovered ? "translateY(-50%) translateX(2px)" : "translateY(-50%)",
                  }}
                >
                  {node.title}
                </div>
              )}

              {/* 5. Glassmorphism Tooltip Info Panel on Hover & Click */}
              <AnimatePresence>
                {(isHovered || isActive) && (
                  <motion.div
                    className="absolute z-50 p-4 rounded-xl border pointer-events-auto"
                    style={{
                      // Layout positioning logic: prevent panels from escaping the boundaries
                      left: node.px < CX ? "50px" : "auto",
                      right: node.px >= CX ? "50px" : "auto",
                      top: node.py < CY ? "0px" : "auto",
                      bottom: node.py >= CY ? "0px" : "auto",
                      width: isActive ? "270px" : "190px",
                      background: "rgba(255, 255, 255, 0.94)",
                      backdropFilter: "blur(18px)",
                      borderColor: isActive ? node.color : "rgba(139, 92, 246, 0.15)",
                      boxShadow: isActive
                        ? `0 12px 36px rgba(99, 102, 241, 0.15), 0 4px 12px ${node.glowColor}`
                        : "0 8px 24px rgba(0,0,0,0.06)",
                    }}
                    initial={{ opacity: 0, scale: 0.92, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 5 }}
                    transition={{ duration: 0.22, ease: [0.215, 0.61, 0.355, 1] }}
                    onClick={(e) => e.stopPropagation()} // stop clicks from closing
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className="p-1 rounded-md"
                        style={{ background: `${node.glowColor}` }}
                      >
                        <NodeIcon size={12} style={{ color: node.color }} />
                      </div>
                      <h4 className="text-[12px] font-bold text-[#0A0A0A] uppercase tracking-wide">
                        {node.title}
                      </h4>
                    </div>

                    {/* Description Text */}
                    <p className="text-[11px] leading-relaxed text-[#6B7280]">
                      {isActive ? node.fullDesc : node.shortDesc}
                    </p>

                    {/* Interactive Help Hint for click */}
                    {isActive && (
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[9px] text-[#8B5CF6] font-semibold">
                        <span>Active System Module</span>
                        <button
                          className="hover:underline cursor-pointer"
                          onClick={() => setActiveNodeId(null)}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      })}
    </div>
  );
}
