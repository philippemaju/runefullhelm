import type { CourseSummary, Summary, UserRecord } from '../types';

const percent = (part: number, whole: number): number =>
  whole === 0 ? 0 : Math.round((part / whole) * 1000) / 10;

export function summarize(users: readonly UserRecord[]): Summary {
  const passed = users.filter((u) => u.status === 'Pass').length;
  return { total: users.length, passed, failed: users.length - passed, passRate: percent(passed, users.length) };
}

/** One summary per course, in first-seen order. */
export function byCourse(users: readonly UserRecord[]): CourseSummary[] {
  const counts = new Map<string, { enrolled: number; passed: number }>();
  for (const u of users) {
    const c = counts.get(u.course) ?? { enrolled: 0, passed: 0 };
    c.enrolled++;
    if (u.status === 'Pass') c.passed++;
    counts.set(u.course, c);
  }
  return [...counts].map(([course, { enrolled, passed }]) => ({
    course,
    enrolled,
    passed,
    failed: enrolled - passed,
    passRate: percent(passed, enrolled),
  }));
}

/** The course with the lowest pass rate, or null when there are none. */
export function weakestCourse(courses: readonly CourseSummary[]): CourseSummary | null {
  return courses.reduce<CourseSummary | null>((low, c) => (low === null || c.passRate < low.passRate ? c : low), null);
}
