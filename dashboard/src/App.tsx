import { useMemo, useRef, useState } from 'react';
import { PassRateChart } from './components/PassRateChart';
import { ResultsChart } from './components/ResultsChart';
import { StatTiles } from './components/StatTiles';
import { UserTable } from './components/UserTable';
import { byCourse, summarize, weakestCourse } from './data/stats';
import { users } from './data/users';
import type { Filters } from './types';

export function App() {
  const summary = useMemo(() => summarize(users), []);
  const courses = useMemo(() => byCourse(users), []);
  const weakest = useMemo(() => weakestCourse(courses), [courses]);
  const courseNames = useMemo(() => courses.map((c) => c.course).sort(), [courses]);
  const [filters, setFilters] = useState<Filters>({ query: '', course: null, status: null });
  const usersRef = useRef<HTMLElement>(null);

  // Clicking a course bar filters the user list; clicking it again clears the filter.
  const selectCourse = (course: string) => {
    const next = filters.course === course ? null : course;
    setFilters({ ...filters, course: next });
    if (next) usersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <main className="page">
      <header className="head">
        <h1>Course completion results</h1>
        <p>
          {summary.passRate}% of assigned users passed their course.
          {weakest && (
            <>
              {' '}The lowest pass rate is in {weakest.course}, at {weakest.passRate}%.
            </>
          )}
        </p>
      </header>

      <StatTiles summary={summary} />

      <section className="grid" aria-label="Courses">
        <div className="card">
          <h2>Pass rate by course</h2>
          <p className="sub">Sorted from highest to lowest. The dashed line is the overall rate. Click a course to filter the user list.</p>
          <PassRateChart courses={courses} overallRate={summary.passRate} selected={filters.course} onSelect={selectCourse} />
        </div>
        <div className="card">
          <h2>Results by course</h2>
          <p className="sub">Users passed and failed, sorted by how many are assigned.</p>
          <ResultsChart courses={courses} selected={filters.course} onSelect={selectCourse} />
        </div>
      </section>

      <section className="card" ref={usersRef} aria-labelledby="users-heading">
        <h2 id="users-heading">Users</h2>
        <p className="sub">Everyone in test_data/users.csv with their assigned course and result.</p>
        <UserTable users={users} courses={courseNames} filters={filters} onFiltersChange={setFilters} />
      </section>
    </main>
  );
}
