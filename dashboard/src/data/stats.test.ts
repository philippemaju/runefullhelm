import { describe, expect, it } from 'vitest';
import { byCourse, summarize, weakestCourse } from './stats';
import { users } from './users';

describe('stats over test_data/users.csv', () => {
  it('summarizes all users', () => {
    expect(summarize(users)).toEqual({ total: 100, passed: 73, failed: 27, passRate: 73 });
  });

  it('breaks results down by course', () => {
    const courses = byCourse(users);
    expect(courses).toHaveLength(12);
    expect(courses.reduce((n, c) => n + c.enrolled, 0)).toBe(100);
    expect(courses.find((c) => c.course === 'Diversity & Inclusion')).toMatchObject({ enrolled: 9, passed: 9, passRate: 100 });
  });

  it('finds the weakest course', () => {
    expect(weakestCourse(byCourse(users))).toMatchObject({
      course: 'Workplace Safety Fundamentals',
      enrolled: 9,
      passed: 3,
      passRate: 33.3,
    });
  });

  it('returns null for no courses', () => {
    expect(weakestCourse([])).toBeNull();
  });
});
