'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BarChart3, Table2 } from 'lucide-react';

export interface Datum {
  label: string;
  value: number;
  detail?: string;
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceMax(max: number): { top: number; step: number } {
  if (max <= 0) return { top: 4, step: 1 };
  const rough = Math.max(1, max / 4);
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
  return { top: Math.ceil(max / step) * step, step };
}

interface Tip {
  x: number;
  y: number;
  title: string;
  body: string;
}

function Tooltip({ tip }: { tip: Tip | null }) {
  if (!tip) return null;
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded border border-line bg-white px-3 py-2 text-xs shadow-md"
      style={{ left: tip.x, top: tip.y - 8 }}
    >
      <p className="font-medium text-ink">{tip.title}</p>
      <p className="text-muted">{tip.body}</p>
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  table,
  children,
}: {
  title: string;
  subtitle?: string;
  table: { columns: string[]; rows: Array<Array<string | number>> };
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);
  return (
    <section className="card min-w-0 p-5" aria-label={title}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base">{title}</h2>
          {subtitle ? <p className="text-xs text-muted">{subtitle}</p> : null}
        </div>
        <button type="button" className="btn-ghost btn-sm no-print" aria-pressed={showTable} onClick={() => setShowTable((s) => !s)}>
          {showTable ? <BarChart3 size={14} aria-hidden="true" /> : <Table2 size={14} aria-hidden="true" />}
          Table view
        </button>
      </div>
      {showTable ? (
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                {table.columns.map((c, i) => (
                  <th key={c} scope="col" className={i > 0 ? 'text-right' : ''}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((cell, j) => (
                    <td key={j} className={j > 0 ? 'text-right tabular-nums' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

function columnPath(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h, w / 2);
  const base = y + h;
  return `M${x},${base}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + w - rr}Q${x + w},${y} ${x + w},${y + rr}V${base}Z`;
}

export function ColumnChart({ data, unit, height = 240 }: { data: Datum[]; unit: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const margin = { top: 20, right: 4, bottom: 26, left: 32 };
  const innerW = Math.max(0, width - margin.left - margin.right);
  const innerH = height - margin.top - margin.bottom;
  const max = Math.max(0, ...data.map((d) => d.value));
  const { top, step } = niceMax(max);
  const band = data.length ? innerW / data.length : 0;
  const barW = Math.min(24, band * 0.6);
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step);
  const labelEvery = band < 34 ? 2 : 1;
  const maxIndex = data.reduce((best, d, i, arr) => (d.value > (arr[best]?.value ?? -1) ? i : best), 0);
  const y = (v: number) => margin.top + innerH - (top ? (v / top) * innerH : 0);

  const summary = data.map((d) => `${d.label}: ${d.value}`).join(', ');

  return (
    <div ref={ref} className="relative w-full" onMouseLeave={() => { setTip(null); setActive(null); }}>
      {width > 0 ? (
        <svg width={width} height={height} role="img" aria-label={`Column chart. ${summary}`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={margin.left} x2={width - margin.right} y1={y(t)} y2={y(t)} stroke="rgba(7,30,25,.10)" strokeWidth={1} />
              <text x={margin.left - 6} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">
                {t}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = margin.left + band * i + band / 2;
            const h = y(0) - y(d.value);
            const showValue = i === data.length - 1 || i === maxIndex || active === i;
            return (
              <g key={d.label}>
                <path
                  d={columnPath(cx - barW / 2, y(d.value), barW, h, 4)}
                  className={active === null || active === i ? 'fill-viz-1' : 'fill-viz-1 opacity-50'}
                />
                {showValue && d.value > 0 ? (
                  <text x={cx} y={y(d.value) - 6} textAnchor="middle" className="fill-ink text-[11px] font-medium tabular-nums">
                    {d.value}
                  </text>
                ) : null}
                {i % labelEvery === 0 ? (
                  <text x={cx} y={height - 8} textAnchor="middle" className="fill-muted text-[11px]">
                    {d.label}
                  </text>
                ) : null}
                <rect
                  x={margin.left + band * i}
                  y={margin.top}
                  width={band}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => {
                    setActive(i);
                    setTip({ x: Math.min(Math.max(cx, 80), width - 80), y: y(d.value), title: d.detail ?? d.label, body: `${d.value} ${unit}` });
                  }}
                />
              </g>
            );
          })}
        </svg>
      ) : (
        <div style={{ height }} />
      )}
      <Tooltip tip={tip} />
    </div>
  );
}

export function BarList({ data, unit }: { data: Datum[]; unit: string }) {
  const [tip, setTip] = useState<Tip | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div ref={container} className="relative" onMouseLeave={() => setTip(null)}>
      <ul className="space-y-3">
        {data.map((d) => (
          <li
            key={d.label}
            onMouseEnter={(e) => {
              const box = container.current?.getBoundingClientRect();
              const row = e.currentTarget.getBoundingClientRect();
              if (!box) return;
              setTip({
                x: row.left - box.left + Math.min(row.width / 2, 160),
                y: row.top - box.top,
                title: d.label,
                body: `${d.value} ${unit} · ${total ? Math.round((d.value / total) * 100) : 0}%`,
              });
            }}
          >
            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="truncate text-ink-soft">{d.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 min-w-0 flex-1">
                <div className="h-4 rounded-r-[4px] bg-viz-1" style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value ? 2 : 0 }} />
              </div>
              <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-ink">{d.value}</span>
            </div>
          </li>
        ))}
      </ul>
      <Tooltip tip={tip} />
    </div>
  );
}

const SLOT_CLASS = ['bg-viz-1', 'bg-viz-2', 'bg-viz-3'] as const;

export function ShareBar({ data, unit }: { data: Datum[]; unit: string }) {
  const [tip, setTip] = useState<Tip | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const total = data.reduce((s, d) => s + d.value, 0);
  const pct = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  return (
    <div ref={container} className="relative" onMouseLeave={() => setTip(null)}>
      <div className="flex h-6 w-full gap-[2px] overflow-hidden" role="img" aria-label={data.map((d) => `${d.label} ${pct(d.value)}%`).join(', ')}>
        {data.map((d, i) =>
          d.value > 0 ? (
            <div
              key={d.label}
              className={`${SLOT_CLASS[i] ?? 'bg-muted'} h-full first:rounded-l-[4px] last:rounded-r-[4px]`}
              style={{ flexGrow: d.value, flexBasis: 0 }}
              onMouseEnter={(e) => {
                const box = container.current?.getBoundingClientRect();
                const seg = e.currentTarget.getBoundingClientRect();
                if (!box) return;
                setTip({ x: seg.left - box.left + seg.width / 2, y: 0, title: d.label, body: `${d.value} ${unit} · ${pct(d.value)}%` });
              }}
            />
          ) : null
        )}
      </div>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${SLOT_CLASS[i] ?? 'bg-muted'}`} />
            <span className="text-ink-soft">{d.label}</span>
            <span className="font-medium tabular-nums text-ink">{pct(d.value)}%</span>
          </li>
        ))}
      </ul>
      <Tooltip tip={tip} />
    </div>
  );
}
