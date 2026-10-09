export interface TooltipLine {
  label: string;
  color?: string;
}

export interface TooltipState {
  x: number;
  y: number;
  heading: string;
  lines: TooltipLine[];
}

const TIP_WIDTH = 200;

/** Hover popover, positioned inside its `position: relative` chart box. */
export function Tooltip({ tip, boxWidth }: { tip: TooltipState | null; boxWidth: number }) {
  if (!tip) return null;
  const left = Math.max(0, Math.min(tip.x + 12, boxWidth - TIP_WIDTH));
  return (
    <div className="tip" style={{ left, top: tip.y + 16, maxWidth: TIP_WIDTH }} role="status">
      <div className="tip-heading">{tip.heading}</div>
      {tip.lines.map((line) => (
        <div key={line.label}>
          {line.color && <i className="swatch" style={{ background: line.color }} />}
          {line.label}
        </div>
      ))}
    </div>
  );
}
