const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';

let cachedToken: string | null = null;

async function resolveToken(): Promise<string> {
  if (process.env.DIDAXIS_API_TOKEN) {
    return process.env.DIDAXIS_API_TOKEN;
  }

  if (cachedToken) {
    return cachedToken;
  }

  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('Set DIDAXIS_API_TOKEN or DIDAXIS_EMAIL and DIDAXIS_PASSWORD in .env');
  }

  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  const token: string | undefined = body?.data?.access_token;
  if (!token) {
    throw new Error('Login response did not include access_token');
  }

  cachedToken = token;
  return token;
}

async function authHeaders(): Promise<Record<string, string>> {
  return { Authorization: `Bearer ${await resolveToken()}` };
}

export type Program = {
  id: string;
  name: string;
};

export type DeleteResult = {
  id: string;
  ok: boolean;
  status?: number;
  message?: string;
};

export async function getAllPrograms(): Promise<Program[]> {
  const res = await fetch(`${BASE_URL}/api/programs`, {
    headers: await authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`GET /api/programs failed: ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  return body.data ?? [];
}

export async function deleteProgramsByIds(ids: string[]): Promise<DeleteResult[]> {
  const results: DeleteResult[] = [];

  for (const id of ids) {
    const res = await fetch(`${BASE_URL}/api/programs/${id}`, {
      method: 'DELETE',
      headers: await authHeaders(),
    });

    if (res.ok || res.status === 404) {
      results.push({ id, ok: true });
      continue;
    }

    const message = await res.text();
    results.push({
      id,
      ok: false,
      status: res.status,
      message: message || res.statusText,
    });
  }

  return results;
}
