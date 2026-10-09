import { useMemo, useState } from 'react';
import type { Filters, SortKey, Status, UserRecord } from '../types';

interface Props {
  users: readonly UserRecord[];
  courses: readonly string[];
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const COLUMNS: { key: SortKey; label: string; narrowHidden?: boolean }[] = [
  { key: 'userId', label: 'ID' },
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'email', label: 'Email', narrowHidden: true },
  { key: 'course', label: 'Course' },
  { key: 'status', label: 'Result' },
];

const count = new Intl.NumberFormat('en');

function matches(user: UserRecord, { query, course, status }: Filters): boolean {
  if (course && user.course !== course) return false;
  if (status && user.status !== status) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [user.userId, user.firstName, user.lastName, user.email, `${user.firstName} ${user.lastName}`].some((v) =>
    v.toLowerCase().includes(q),
  );
}

export function UserTable({ users, courses, filters, onFiltersChange }: Props) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'userId', dir: 1 });

  const rows = useMemo(
    () => users.filter((u) => matches(u, filters)).sort((a, b) => sort.dir * a[sort.key].localeCompare(b[sort.key])),
    [users, filters, sort],
  );

  const toggleSort = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }));
  const set = (patch: Partial<Filters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <>
      <div className="controls">
        <input
          id="user-search"
          type="search"
          placeholder="Search name, email or ID"
          aria-label="Search users"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
        />
        <select id="user-course" aria-label="Course" value={filters.course ?? ''} onChange={(e) => set({ course: e.target.value || null })}>
          <option value="">All courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          id="user-status"
          aria-label="Result"
          value={filters.status ?? ''}
          onChange={(e) => set({ status: (e.target.value || null) as Status | null })}
        >
          <option value="">All results</option>
          <option value="Pass">Pass</option>
          <option value="Fail">Fail</option>
        </select>
        <button type="button" onClick={() => onFiltersChange({ query: '', course: null, status: null })}>
          Clear filters
        </button>
        <span className="count">
          Showing {count.format(rows.length)} of {count.format(users.length)}
        </span>
      </div>
      <div className="table-box">
        <table className="users">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={col.narrowHidden ? 'hide-narrow' : undefined}
                  aria-sort={sort.key === col.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}
                >
                  <button type="button" onClick={() => toggleSort(col.key)}>
                    {col.label}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="empty">
                  No users match these filters.
                </td>
              </tr>
            ) : (
              rows.map((u) => (
                <tr key={u.userId}>
                  <td>{u.userId}</td>
                  <td>{u.firstName}</td>
                  <td>{u.lastName}</td>
                  <td className="hide-narrow">{u.email}</td>
                  <td>{u.course}</td>
                  <td>
                    <span className={`pill ${u.status === 'Pass' ? 'pass' : 'fail'}`}>{u.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
