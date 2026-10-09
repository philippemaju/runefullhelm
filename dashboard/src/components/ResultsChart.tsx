import type { CourseSummary } from '../types';
import { CourseBarChart } from './CourseBarChart';

interface Props {
  courses: readonly CourseSummary[];
  selected: string | null;
  onSelect: (course: string) => void;
}

export function ResultsChart({ courses, selected, onSelect }: Props) {
  const rows = [...courses].sort((a, b) => b.enrolled - a.enrolled || a.course.localeCompare(b.course));
  const max = Math.max(0, ...rows.map((c) => c.enrolled));
  return (
    <>
      <div className="legend">
        <span><i className="swatch" style={{ background: 'var(--accent)' }} />Passed</span>
        <span><i className="swatch" style={{ background: 'var(--fail)' }} />Failed</span>
      </div>
      <CourseBarChart
        title="Users passed and failed by course"
        rows={rows}
        max={max}
        segments={(c) => [
          { value: c.passed, color: 'var(--accent)' },
          { value: c.failed, color: 'var(--fail)' },
        ]}
        valueLabel={(c) => `${c.passed} passed · ${c.failed} failed`}
        tooltip={(c) => [
          { label: `Passed ${c.passed}`, color: 'var(--accent)' },
          { label: `Failed ${c.failed}`, color: 'var(--fail)' },
          { label: `${c.enrolled} assigned` },
        ]}
        ariaLabel={(c) => `${c.course}: ${c.enrolled} assigned, ${c.passed} passed, ${c.failed} failed. Filter users.`}
        selected={selected}
        onSelect={onSelect}
      />
    </>
  );
}
