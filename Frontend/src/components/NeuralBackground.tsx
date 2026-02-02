"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Node {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

interface NeuralBackgroundProps {
  theme?: "dark" | "light";
  nodeCount?: number;
  connectionDistance?: number;
  enableMouseInteraction?: boolean;
}

export const NeuralBackground: React.FC<NeuralBackgroundProps> = ({
  theme = "dark",
  nodeCount = 25,
  connectionDistance = 150,
  enableMouseInteraction = true,
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize nodes with random positions and velocities
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== "undefined") {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const initialNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({
      id: i,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 3 + 2,
    }));

    setNodes(initialNodes);
  }, [dimensions, nodeCount]);

  // Mouse tracking
  useEffect(() => {
    if (!enableMouseInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [enableMouseInteraction]);

  // Animation loop
  useEffect(() => {
    if (nodes.length === 0) return;

    const animate = () => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          let { x, y, vx, vy } = node;

          // Mouse interaction - nodes move away from cursor
          if (enableMouseInteraction && mousePosition.x && mousePosition.y) {
            const dx = x - mousePosition.x;
            const dy = y - mousePosition.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const mouseInfluence = 100;

            if (distance < mouseInfluence) {
              const force = (mouseInfluence - distance) / mouseInfluence;
              vx += (dx / distance) * force * 0.02;
              vy += (dy / distance) * force * 0.02;
            }
          }

          // Update position
          x += vx;
          y += vy;

          // Boundary collision with bounce
          if (x < 0 || x > dimensions.width) {
            vx *= -1;
            x = x < 0 ? 0 : dimensions.width;
          }
          if (y < 0 || y > dimensions.height) {
            vy *= -1;
            y = y < 0 ? 0 : dimensions.height;
          }

          // Damping to prevent excessive speed
          vx *= 0.99;
          vy *= 0.99;

          return { ...node, x, y, vx, vy };
        })
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [nodes.length, dimensions, mousePosition, enableMouseInteraction]);

  // Calculate connections between nearby nodes
  const getConnections = () => {
    const connections: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          const opacity = 1 - distance / connectionDistance;
          connections.push({
            x1: nodes[i].x,
            y1: nodes[i].y,
            x2: nodes[j].x,
            y2: nodes[j].y,
            opacity: opacity * 0.3,
          });
        }
      }
    }

    return connections;
  };

  const connections = getConnections();

  // Theme colors
  const colors = {
    dark: {
      node: "rgba(99, 102, 241, 0.6)", // indigo-500
      nodePulse: "rgba(99, 102, 241, 0.3)",
      line: "rgba(139, 92, 246, 0.4)", // purple-500
      glow: "rgba(99, 102, 241, 0.1)",
    },
    light: {
      node: "rgba(79, 70, 229, 0.5)", // indigo-600
      nodePulse: "rgba(79, 70, 229, 0.2)",
      line: "rgba(124, 58, 237, 0.3)", // purple-600
      glow: "rgba(79, 70, 229, 0.05)",
    },
  };

  const themeColors = colors[theme];

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 -z-10 overflow-hidden"
      style={{
        background:
          theme === "dark"
            ? "radial-gradient(ellipse at center, #0f172a 0%, #020617 100%)"
            : "radial-gradient(ellipse at center, #f1f5f9 0%, #e2e8f0 100%)",
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)"
              : "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.08) 0%, transparent 50%)",
        }}
      />

      {/* SVG Canvas for connections and nodes */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "none" }}
      >
        {/* Define glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Connection Lines */}
        {connections.map((conn, index) => (
          <motion.line
            key={`line-${index}`}
            x1={conn.x1}
            y1={conn.y1}
            x2={conn.x2}
            y2={conn.y2}
            stroke={themeColors.line}
            strokeWidth="1"
            opacity={conn.opacity}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5 }}
          />
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={`node-${node.id}`}>
            {/* Glow effect */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.size * 3}
              fill={themeColors.nodePulse}
              opacity="0.4"
              filter="url(#glow)"
            >
              <animate
                attributeName="r"
                values={`${node.size * 2};${node.size * 4};${node.size * 2}`}
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.2;0.5;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Core node */}
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.size}
              fill={themeColors.node}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: node.id * 0.02 }}
            />
          </g>
        ))}
      </svg>

      {/* Floating particles (additional depth) */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute rounded-full ${
              theme === "dark" ? "bg-indigo-400/10" : "bg-indigo-600/10"
            }`}
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Vignette effect for text readability */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            theme === "dark"
              ? "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)"
              : "radial-gradient(ellipse at center, transparent 0%, rgba(255,255,255,0.3) 100%)",
        }}
      />
    </div>
  );
};

export default NeuralBackground;
