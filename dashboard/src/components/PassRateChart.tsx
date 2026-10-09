import type { CourseSummary } from '../types';
import { CourseBarChart } from './CourseBarChart';

interface Props {
  courses: readonly CourseSummary[];
  overallRate: number;
  selected: string | null;
  onSelect: (course: string) => void;
}

export function PassRateChart({ courses, overallRate, selected, onSelect }: Props) {
  const rows = [...courses].sort((a, b) => b.passRate - a.passRate || a.course.localeCompare(b.course));
  const below = (c: CourseSummary) => c.passRate < overallRate;
  return (
    <CourseBarChart
      title="Pass rate by course"
      rows={rows}
      max={100}
      segments={(c) => [{ value: c.passRate, color: below(c) ? 'var(--fail)' : 'var(--accent)' }]}
      valueLabel={(c) => `${c.passRate}% · ${c.passed}/${c.enrolled}`}
      tooltip={(c) => [
        { label: `${c.passRate}% passed` },
        { label: `${c.passed} of ${c.enrolled} users` },
        { label: below(c) ? 'Below overall rate' : 'At or above overall rate' },
      ]}
      ariaLabel={(c) => `${c.course}: ${c.passRate}% passed, ${c.passed} of ${c.enrolled}. Filter users.`}
      selected={selected}
      onSelect={onSelect}
      reference={{ value: overallRate, label: `Overall ${overallRate}%` }}
    />
  );
}
