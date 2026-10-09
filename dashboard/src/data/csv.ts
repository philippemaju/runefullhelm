import type { Status, UserRecord } from '../types';

/** Parses RFC 4180-style CSV: quoted fields, escaped quotes, LF or CRLF line endings. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text.charAt(i);
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

const COLUMNS = ['user_id', 'first_name', 'last_name', 'email', 'course', 'status'] as const;

function isStatus(value: string): value is Status {
  return value === 'Pass' || value === 'Fail';
}

/** Parses the users CSV, throwing on a missing column or an unknown status. */
export function parseUsers(text: string): UserRecord[] {
  const [header, ...body] = parseCsv(text);
  if (!header) throw new Error('Users CSV is empty');

  const index = Object.fromEntries(
    COLUMNS.map((col) => {
      const i = header.indexOf(col);
      if (i === -1) throw new Error(`Users CSV is missing the "${col}" column`);
      return [col, i];
    }),
  ) as Record<(typeof COLUMNS)[number], number>;

  return body.map((cells, n) => {
    const get = (col: (typeof COLUMNS)[number]): string => cells[index[col]]?.trim() ?? '';
    const status = get('status');
    if (!isStatus(status)) {
      throw new Error(`Row ${n + 2}: status must be Pass or Fail, got "${status}"`);
    }
    return {
      userId: get('user_id'),
      firstName: get('first_name'),
      lastName: get('last_name'),
      email: get('email'),
      course: get('course'),
      status,
    };
  });
}
