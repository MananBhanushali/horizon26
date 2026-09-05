"use client";

import { useEffect, useRef } from "react";

export function MonteCarloChart({
  baseAmount = 1000000,
  years = 10,
  expectedReturn = 0.12,
  volatility = 0.15,
  paths = 100,
}: {
  baseAmount?: number;
  years?: number;
  expectedReturn?: number;
  volatility?: number;
  paths?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    
    ctx.clearRect(0, 0, width, height);

    // Box-Muller transform for normal distribution
    const randomNormal = () => {
      let u = 0, v = 0;
      while(u === 0) u = Math.random();
      while(v === 0) v = Math.random();
      return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    };

    // Generate paths
    const dt = 1; // 1 year step
    const allPaths: number[][] = [];
    let maxVal = baseAmount;
    let minVal = baseAmount;

    for (let p = 0; p < paths; p++) {
      const path = [baseAmount];
      let current = baseAmount;
      for (let y = 1; y <= years; y++) {
        // Geometric Brownian Motion step
        const drift = (expectedReturn - 0.5 * Math.pow(volatility, 2)) * dt;
        const shock = volatility * Math.sqrt(dt) * randomNormal();
        current = current * Math.exp(drift + shock);
        path.push(current);
        if (current > maxVal) maxVal = current;
        if (current < minVal) minVal = current;
      }
      allPaths.push(path);
    }

    // Add some padding to min/max
    maxVal *= 1.05;
    minVal *= 0.95;

    // Draw paths
    const stepX = width / years;
    
    // Color palette for paths
    const colors = [
      "rgba(59, 130, 246, 0.4)", // Blue
      "rgba(16, 185, 129, 0.4)", // Green
      "rgba(139, 92, 246, 0.4)", // Purple
      "rgba(245, 158, 11, 0.4)", // Yellow
      "rgba(239, 68, 68, 0.4)",  // Red
      "rgba(20, 184, 166, 0.4)", // Teal
      "rgba(244, 63, 94, 0.4)",  // Rose
    ];

    allPaths.forEach((path, i) => {
      ctx.beginPath();
      ctx.moveTo(0, height - ((path[0] - minVal) / (maxVal - minVal)) * height);
      
      for (let y = 1; y <= years; y++) {
        const x = y * stepX;
        const yPos = height - ((path[y] - minVal) / (maxVal - minVal)) * height;
        ctx.lineTo(x, yPos);
      }
      
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 1;
      ctx.stroke();
    });

  }, [baseAmount, years, expectedReturn, volatility, paths]);

  return (
    <div className="w-full h-full relative">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
