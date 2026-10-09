export type Status = 'Pass' | 'Fail';

export interface UserRecord {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  course: string;
  status: Status;
}

export interface Summary {
  total: number;
  passed: number;
  failed: number;
  /** Percent, rounded to one decimal. */
  passRate: number;
}

export interface CourseSummary {
  course: string;
  enrolled: number;
  passed: number;
  failed: number;
  /** Percent, rounded to one decimal. */
  passRate: number;
}

export type SortKey = keyof UserRecord;

export interface Filters {
  query: string;
  course: string | null;
  status: Status | null;
}
