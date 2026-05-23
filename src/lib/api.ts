import { hc } from 'hono/client';
import type { AppType } from '../../api/src/index';

// If served from the same host/port, we can use a relative path.
// Otherwise, fall back to the env variable.
const API_URL = import.meta.env.PUBLIC_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : 'http://localhost:3001/api');

export const client = hc<AppType>(API_URL);
