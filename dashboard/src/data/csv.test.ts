import { describe, expect, it } from 'vitest';
import { parseCsv, parseUsers } from './csv';

describe('parseCsv', () => {
  it('handles CRLF line endings and a trailing newline', () => {
    expect(parseCsv('a,b\r\n1,2\r\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });

  it('handles quoted fields with commas, quotes and newlines', () => {
    expect(parseCsv('x\n"a, ""b""\nc"\n')).toEqual([['x'], ['a, "b"\nc']]);
  });
});

describe('parseUsers', () => {
  const header = 'user_id,first_name,last_name,email,course,status';

  it('maps columns to typed records', () => {
    const [user] = parseUsers(`${header}\r\nU001,Ada,Lovelace,ada@example.com,Data Privacy & GDPR,Pass\r\n`);
    expect(user).toEqual({
      userId: 'U001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      course: 'Data Privacy & GDPR',
      status: 'Pass',
    });
  });

  it('rejects an unknown status', () => {
    expect(() => parseUsers(`${header}\nU001,A,B,c@example.com,X,Maybe\n`)).toThrow(/Pass or Fail/);
  });

  it('rejects a missing column', () => {
    expect(() => parseUsers('user_id,first_name\nU001,A\n')).toThrow(/last_name/);
  });
});
