import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { Tooltip, type TooltipLine, type TooltipState } from './Tooltip';
import { useElementWidth } from './useElementWidth';

export interface Segment {
  value: number;
  color: string;
}

export interface CourseBarChartProps<T extends { course: string }> {
  rows: readonly T[];
  /** Upper end of the bar scale. */
  max: number;
  segments: (row: T) => Segment[];
  valueLabel: (row: T) => string;
  tooltip: (row: T) => TooltipLine[];
  ariaLabel: (row: T) => string;
  selected: string | null;
  onSelect: (course: string) => void;
  reference?: { value: number; label: string };
  title: string;
}

// Each row: course name and value on one line, the bar beneath it.
const ROW = 38;
const BAR = 12;
const BAR_Y = 20;
const GAP = 2;
const MIN_WIDTH = 240;

/** Horizontal bars, one row per course, with hover tooltips and click-to-select. */
export function CourseBarChart<T extends { course: string }>(props: CourseBarChartProps<T>) {
  const { rows, max, segments, valueLabel, tooltip, ariaLabel, selected, onSelect, reference, title } = props;
  const [boxRef, measured] = useElementWidth<HTMLDivElement>();
  const [tip, setTip] = useState<TooltipState | null>(null);
  const width = Math.max(MIN_WIDTH, measured);
  const footer = reference ? 18 : 0;
  const height = rows.length * ROW + footer;
  const x = (v: number) => (max === 0 ? 0 : (v / max) * width);

  const showTip = (event: MouseEvent, row: T) => {
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    setTip({ x: event.clientX - box.left, y: event.clientY - box.top, heading: row.course, lines: tooltip(row) });
  };

  const onKey = (event: KeyboardEvent, course: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(course);
    }
  };

  return (
    <div className="chart" ref={boxRef} style={{ minHeight: height }}>
      {measured > 0 && (
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="group" aria-label={title}>
          {rows.map((row, i) => {
            let offset = 0;
            const parts = segments(row).filter((s) => s.value > 0);
            const dimmed = selected !== null && selected !== row.course;
            return (
              <g
                key={row.course}
                transform={`translate(0,${i * ROW})`}
                className={`chart-row${dimmed ? ' dimmed' : ''}`}
                tabIndex={0}
                role="button"
                aria-pressed={selected === row.course}
                aria-label={ariaLabel(row)}
                onClick={() => onSelect(row.course)}
                onKeyDown={(e) => onKey(e, row.course)}
                onMouseMove={(e) => showTip(e, row)}
                onMouseLeave={() => setTip(null)}
              >
                <rect width={width} height={ROW} fill="transparent" />
                <text y={13}>{row.course}</text>
                <text className="chart-value" x={width} y={13} textAnchor="end">
                  {valueLabel(row)}
                </text>
                <rect y={BAR_Y} width={width} height={BAR} rx={4} fill="var(--chart-track)" />
                {parts.map((s, j) => {
                  const start = x(offset) + (j > 0 ? GAP / 2 : 0);
                  offset += s.value;
                  const end = x(offset) - (j < parts.length - 1 ? GAP / 2 : 0);
                  return <rect key={j} x={start} y={BAR_Y} width={Math.max(4, end - start)} height={BAR} rx={4} fill={s.color} />;
                })}
              </g>
            );
          })}
          {reference && (
            <g aria-hidden="true">
              <line
                x1={x(reference.value)}
                x2={x(reference.value)}
                y1={BAR_Y - 4}
                y2={height - footer + 2}
                stroke="var(--chart-reference)"
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
              <text
                className="chart-value"
                x={Math.min(Math.max(x(reference.value), 48), width - 48)}
                y={height - 2}
                textAnchor="middle"
              >
                {reference.label}
              </text>
            </g>
          )}
        </svg>
      )}
      <Tooltip tip={tip} boxWidth={width} />
    </div>
  );
}
