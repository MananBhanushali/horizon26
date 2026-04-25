"use client";

/* eslint-disable react/no-unknown-property */
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";

/**
 * FinanceScene — interactive Three.js backdrop:
 *   - Floating coins (click to flick-spin)
 *   - Animated candlestick bars
 *   - Currency cards
 *   - Wireframe globe of "transactions"
 *
 * The Canvas itself enables pointer events so coins are clickable; the wrapper
 * around it (in the page) keeps `pointer-events: none` so empty regions never
 * block the form.
 */
export default function FinanceScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 45 }}
      style={{ width: "100%", height: "100%", pointerEvents: "auto" }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 5]} intensity={0.85} />
      <directionalLight position={[-4, -2, -4]} intensity={0.3} color="#7fe7c8" />
      <pointLight position={[0, 0, 5]} intensity={0.35} color="#06b6d4" />

      <Coin position={[-3.4, 1.6, -1]} color="#f0a93f" symbol="$" />
      <Coin position={[3.2, -1.2, -1.5]} color="#a3aef5" symbol="€" />
      <Coin position={[-2.6, -2.0, -2]} color="#34c08a" symbol="¥" />
      <Coin position={[3.0, 2.0, -0.8]} color="#fcd34d" symbol="£" />

      <CandlestickGroup position={[-3.9, -0.4, -2.5]} />
      <CandlestickGroup position={[3.6, 1.1, -2.2]} rotation={[0, 0.5, 0]} scale={0.85} />

      <CurrencyCard position={[-1.6, 2.4, -3]} symbol="$" color="#0e7c66" />
      <CurrencyCard position={[1.8, -2.2, -2.6]} symbol="€" color="#06b6d4" />

      <TransactionGlobe position={[0, 0, -4]} />
    </Canvas>
  );
}

function Coin({
  position,
  color,
  symbol,
}: {
  position: [number, number, number];
  color: string;
  symbol: string;
}) {
  const ref = useRef<THREE.Group>(null);
  const [spin, setSpin] = useState(0.6);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y += spin * dt;
    ref.current.position.y = position[1] + Math.sin(t * 0.7 + position[0]) * 0.18;
    setSpin((s) => THREE.MathUtils.damp(s, hovered ? 1.6 : 0.6, 2, dt));
  });

  return (
    <group
      ref={ref}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        setSpin((s) => s + 6);
      }}
    >
      <mesh>
        <cylinderGeometry args={[0.55, 0.55, 0.14, 48]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.55, 0.022, 8, 64]} />
        <meshStandardMaterial color={color} metalness={0.95} roughness={0.15} />
      </mesh>
      <CoinFace y={0.071} symbol={symbol} flipped={false} />
      <CoinFace y={-0.071} symbol={symbol} flipped />
    </group>
  );
}

function CoinFace({ y, symbol, flipped }: { y: number; symbol: string; flipped: boolean }) {
  const tex = useSymbolTexture(symbol);
  return (
    <mesh position={[0, y, 0]} rotation={[flipped ? Math.PI / 2 : -Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.5, 48]} />
      <meshStandardMaterial map={tex} transparent metalness={0.6} roughness={0.4} />
    </mesh>
  );
}

function useSymbolTexture(symbol: string) {
  const ref = useRef<THREE.CanvasTexture | null>(null);
  if (!ref.current) {
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);
    ctx.font = "bold 170px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#5b3f00";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 6;
    ctx.fillText(symbol, size / 2, size / 2 + 8);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    ref.current = tex;
  }
  return ref.current;
}

function CandlestickGroup({
  position,
  rotation = [0, 0, 0],
  scale = 1,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}) {
  const group = useRef<THREE.Group>(null);
  const candles = [
    { x: -1.0, h: 0.9, up: true },
    { x: -0.6, h: 0.6, up: false },
    { x: -0.2, h: 1.2, up: true },
    { x: 0.2, h: 0.7, up: true },
    { x: 0.6, h: 1.0, up: false },
    { x: 1.0, h: 1.4, up: true },
  ];
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((m, i) => {
      m.scale.y = 1 + Math.sin(t * 1.4 + i) * 0.18;
    });
  });
  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {candles.map((c, i) => (
        <mesh key={i} position={[c.x, 0, 0]}>
          <boxGeometry args={[0.22, c.h, 0.22]} />
          <meshStandardMaterial
            color={c.up ? "#22c55e" : "#ef4444"}
            metalness={0.3}
            roughness={0.45}
            emissive={c.up ? "#0c5d2c" : "#5d1212"}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

function CurrencyCard({
  position,
  symbol,
  color,
}: {
  position: [number, number, number];
  symbol: string;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const tex = useSymbolTexture(symbol);
  useFrame(({ clock }, dt) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y += dt * 0.4;
    ref.current.position.y = position[1] + Math.sin(t * 0.9) * 0.2;
  });
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[0.85, 1.25, 0.06]} />
      <meshStandardMaterial color={color} metalness={0.55} roughness={0.3} map={tex} />
    </mesh>
  );
}

function TransactionGlobe({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.06;
    ref.current.rotation.x += dt * 0.02;
  });
  const dots: [number, number, number][] = [];
  const r = 2.1;
  for (let i = 0; i < 60; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / 60);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    dots.push([
      r * Math.cos(theta) * Math.sin(phi),
      r * Math.sin(theta) * Math.sin(phi),
      r * Math.cos(phi),
    ]);
  }
  return (
    <group ref={ref} position={position}>
      <mesh>
        <sphereGeometry args={[2.05, 32, 24]} />
        <meshBasicMaterial color="#06b6d4" wireframe transparent opacity={0.18} />
      </mesh>
      {dots.map((d, i) => (
        <mesh key={i} position={d}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color="#0e7c66" />
        </mesh>
      ))}
    </group>
  );
}
