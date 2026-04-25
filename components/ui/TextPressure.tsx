"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

interface TextPressureProps {
  text?: string;
  fontFamily?: string;
  fontUrl?: string;
  width?: boolean;
  weight?: boolean;
  italic?: boolean;
  alpha?: boolean;
  flex?: boolean;
  stroke?: boolean;
  strokeColor?: string;
  textColor?: string;
  minFontSize?: number;
  className?: string;
}

const TextPressure: React.FC<TextPressureProps> = ({
  text = "Hello!",
  fontFamily = "var(--font-sans)",
  fontUrl = "",
  width = true,
  weight = true,
  italic = true,
  alpha = false,
  flex = true,
  stroke = false,
  strokeColor = "var(--color-cyan)",
  textColor = "var(--color-ink)",
  minFontSize = 24,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const spansRef = useRef<(HTMLSpanElement | null)[]>([]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const chars = useMemo(() => text.split(""), [text]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("mousemove", handleMouseMove);
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    if (!fontUrl) return;
    const font = new FontFace(fontFamily, `url(${fontUrl})`);
    font.load().then((loadedFont) => {
      document.fonts.add(loadedFont);
    });
  }, [fontFamily, fontUrl]);

  useEffect(() => {
    spansRef.current.forEach((span, i) => {
      if (!span) return;
      const rect = span.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      const charX = rect.left + rect.width / 2 - containerRect.left;
      const charY = rect.top + rect.height / 2 - containerRect.top;

      const dist = Math.sqrt(
        Math.pow(mousePos.x - charX, 2) + Math.pow(mousePos.y - charY, 2)
      );
      const maxDist = 300;
      const proximity = Math.max(0, 1 - dist / maxDist);

      const wdth = width ? 100 + proximity * 150 : 100;
      const wght = weight ? 100 + proximity * 500 : 100;
      const ital = italic ? proximity * 1 : 0;
      const opacity = alpha ? 0.3 + proximity * 0.7 : 1;

      span.style.fontVariationSettings = `'wdth' ${wdth}, 'wght' ${wght}, 'ital' ${ital}`;
      span.style.opacity = opacity.toString();
    });
  }, [mousePos, width, weight, italic, alpha]);

  return (
    <div
      ref={containerRef}
      className={`text-pressure-container flex h-full w-full items-center justify-start overflow-hidden bg-transparent ${className}`}
      style={{ containerType: "inline-size" } as any}
    >
      <h1
        ref={titleRef}
        className="text-pressure-title m-0 text-left uppercase leading-none whitespace-nowrap"
        style={{
          fontFamily: fontFamily,
          fontSize: `clamp(12px, 14cqw, 90px)`, // Increased from 7cqw/72px
          color: stroke ? "transparent" : textColor,
          WebkitTextStroke: stroke ? `2px ${strokeColor}` : "none",
          display: "flex",
          gap: "-0.02em", // Tightened gap to allow larger font size
        }}
      >
        {chars.map((char, i) => (
          <span
            key={i}
            ref={(el) => {
              spansRef.current[i] = el;
            }}
            className="text-pressure-char inline-block transition-all duration-150 ease-out"
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TextPressure;
