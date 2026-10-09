import raw from '../../../test_data/users.csv?raw';
import { parseUsers } from './csv';

export const users = parseUsers(raw);
