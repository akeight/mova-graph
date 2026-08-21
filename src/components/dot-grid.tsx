"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
} from "react";
import { gsap } from "gsap";

import { cn } from "@/lib/utils";

type Dot = {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  inertiaApplied: boolean;
};

export type DotGridProps = {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  returnDuration?: number;
  className?: string;
  style?: CSSProperties;
};

function hexToRgb(hex: string) {
  const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

  if (!match) {
    return { r: 0, g: 0, b: 0 };
  }

  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  };
}

function throttle<T extends unknown[]>(
  func: (...args: T) => void,
  limit: number,
) {
  let lastCall = 0;

  return (...args: T) => {
    const now = performance.now();

    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

export function DotGrid({
  dotSize = 16,
  gap = 32,
  baseColor = "#5227FF",
  activeColor = "#5227FF",
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  returnDuration = 1.5,
  className = "",
  style,
}: DotGridProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) {
      return null;
    }

    const path = new Path2D();
    path.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return path;
  }, [dotSize]);

  const returnDot = useCallback(
    (dot: Dot) => {
      gsap.to(dot, {
        xOffset: 0,
        yOffset: 0,
        duration: returnDuration,
        ease: "elastic.out(1,0.75)",
        onComplete: () => {
          dot.inertiaApplied = false;
        },
      });
    },
    [returnDuration],
  );

  const pushDot = useCallback(
    (dot: Dot, pushX: number, pushY: number) => {
      gsap.killTweensOf(dot);
      gsap.to(dot, {
        xOffset: pushX,
        yOffset: pushY,
        duration: 0.35,
        ease: "power3.out",
        onComplete: () => returnDot(dot),
      });
    },
    [returnDot],
  );

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;

    if (!wrap || !canvas) {
      return;
    }

    const { width, height } = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const cell = dotSize + gap;
    const cols = Math.floor((width + gap) / cell);
    const rows = Math.floor((height + gap) / cell);
    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;
    const startX = (width - gridW) / 2 + dotSize / 2;
    const startY = (height - gridH) / 2 + dotSize / 2;

    const dots: Dot[] = [];

    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < cols; x += 1) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          inertiaApplied: false,
        });
      }
    }

    dotsRef.current = dots;
  }, [dotSize, gap]);

  useEffect(() => {
    if (!circlePath) {
      return;
    }

    let rafId = 0;
    const proxSq = proximity * proximity;

    const draw = () => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        return;
      }

      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      const { x: pointerX, y: pointerY } = pointerRef.current;

      for (const dot of dotsRef.current) {
        const originX = dot.cx + dot.xOffset;
        const originY = dot.cy + dot.yOffset;
        const deltaX = dot.cx - pointerX;
        const deltaY = dot.cy - pointerY;
        const distanceSq = deltaX * deltaX + deltaY * deltaY;

        let fill = baseColor;

        if (distanceSq <= proxSq) {
          const distance = Math.sqrt(distanceSq);
          const t = 1 - distance / proximity;
          const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
          const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
          const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
          fill = `rgb(${r},${g},${b})`;
        }

        ctx.save();
        ctx.translate(originX, originY);
        ctx.fillStyle = fill;
        ctx.fill(circlePath);
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(rafId);
  }, [activeRgb, baseColor, baseRgb, circlePath, proximity]);

  useEffect(() => {
    buildGrid();

    const wrap = wrapperRef.current;

    if (!wrap) {
      return;
    }

    const observer = new ResizeObserver(buildGrid);
    observer.observe(wrap);

    return () => observer.disconnect();
  }, [buildGrid]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onMove = (event: MouseEvent) => {
      if (media.matches) {
        return;
      }

      const now = performance.now();
      const pointer = pointerRef.current;
      const dt = pointer.lastTime ? now - pointer.lastTime : 16;
      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);

      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }

      pointer.lastTime = now;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      pointer.vx = vx;
      pointer.vy = vy;
      pointer.speed = speed;

      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pointer.x, dot.cy - pointer.y);

        if (speed > speedTrigger && dist < proximity && !dot.inertiaApplied) {
          dot.inertiaApplied = true;
          pushDot(
            dot,
            dot.cx - pointer.x + vx * 0.005,
            dot.cy - pointer.y + vy * 0.005,
          );
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      if (media.matches) {
        return;
      }

      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - clickX, dot.cy - clickY);

        if (dist < shockRadius && !dot.inertiaApplied) {
          dot.inertiaApplied = true;
          const falloff = Math.max(0, 1 - dist / shockRadius);
          pushDot(
            dot,
            (dot.cx - clickX) * shockStrength * falloff,
            (dot.cy - clickY) * shockStrength * falloff,
          );
        }
      }
    };

    const throttledMove = throttle(onMove, 50);

    window.addEventListener("mousemove", throttledMove, { passive: true });
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", throttledMove);
      window.removeEventListener("click", onClick);
      gsap.killTweensOf(dotsRef.current);
    };
  }, [maxSpeed, proximity, pushDot, shockRadius, shockStrength, speedTrigger]);

  return (
    <div className={cn("relative h-full w-full", className)} style={style}>
      <div ref={wrapperRef} className="relative h-full w-full">
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
