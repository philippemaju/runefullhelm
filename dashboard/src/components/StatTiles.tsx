import type { Summary } from '../types';

const count = new Intl.NumberFormat('en');

export function StatTiles({ summary }: { summary: Summary }) {
  const tiles = [
    { label: 'Pass rate', value: `${summary.passRate}%`, note: 'Passed ÷ assigned' },
    { label: 'Users assigned', value: count.format(summary.total), note: 'One course each' },
    { label: 'Passed', value: count.format(summary.passed), note: 'Status Pass' },
    { label: 'Failed', value: count.format(summary.failed), note: 'Status Fail' },
  ];
  return (
    <section className="tiles" aria-label="Totals">
      {tiles.map((t) => (
        <div className="card tile" key={t.label}>
          <div className="tile-label">{t.label}</div>
          <div className="tile-value">{t.value}</div>
          <div className="tile-note">{t.note}</div>
        </div>
      ))}
    </section>
  );
}
