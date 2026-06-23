import type { ScoreBreakdown } from "@/types";
import { SCORE_DIMENSIONS } from "@/lib/format";
import { cn } from "@/lib/utils";

interface RadarChartProps {
  scores: ScoreBreakdown;
  size?: number;
  className?: string;
  showLabels?: boolean;
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

/** Dependency-free radar/spider chart over the six scoring dimensions. */
export function RadarChart({ scores, size = 220, className, showLabels = true }: RadarChartProps) {
  const dims = SCORE_DIMENSIONS;
  const n = dims.length;
  const pad = showLabels ? 34 : 8;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - pad;
  const step = 360 / n;
  const rings = [0.25, 0.5, 0.75, 1];

  const dataPoints = dims.map((d, i) => {
    const value = clampUnit(scores[d.key] as number);
    return polar(cx, cy, radius * value, i * step);
  });
  const dataPath = dataPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("overflow-visible", className)}
      role="img"
      aria-label="Score radar"
    >
      {/* grid rings */}
      {rings.map((ring) => {
        const pts = dims
          .map((_, i) => polar(cx, cy, radius * ring, i * step))
          .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
          .join(" ");
        return (
          <polygon
            key={ring}
            points={pts}
            fill="none"
            className="stroke-border"
            strokeWidth={1}
            opacity={0.7}
          />
        );
      })}

      {/* axes */}
      {dims.map((d, i) => {
        const [x, y] = polar(cx, cy, radius, i * step);
        return (
          <line key={d.key} x1={cx} y1={cy} x2={x} y2={y} className="stroke-border" strokeWidth={1} opacity={0.6} />
        );
      })}

      {/* data polygon */}
      <polygon
        points={dataPath}
        className="fill-primary/20 stroke-primary"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.6} className="fill-primary" />
      ))}

      {/* labels */}
      {showLabels &&
        dims.map((d, i) => {
          const [x, y] = polar(cx, cy, radius + 16, i * step);
          const anchor = x < cx - 6 ? "end" : x > cx + 6 ? "start" : "middle";
          return (
            <text
              key={d.key}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {d.label}
            </text>
          );
        })}
    </svg>
  );
}

function clampUnit(v: number): number {
  return Math.min(1, Math.max(0, v / 100));
}
