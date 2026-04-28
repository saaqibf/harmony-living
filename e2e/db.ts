import pg from 'pg';

export async function withDb<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for e2e DB checks');
  const c = new pg.Client({ connectionString: url });
  await c.connect();
  try {
    return await fn(c);
  } finally {
    await c.end();
  }
}

export async function wipeOnboardingState(client: pg.Client, userId: string): Promise<void> {
  await client.query('BEGIN');
  await client.query('DELETE FROM "OnboardingState" WHERE "userId" = $1', [userId]);
  await client.query('DELETE FROM "Preferences" WHERE "userId" = $1', [userId]);
  await client.query('DELETE FROM "Profile" WHERE "userId" = $1', [userId]);
  await client.query(`UPDATE "User" SET roles = ARRAY['SEEKER']::"Role"[] WHERE id = $1`, [userId]);
  await client.query('COMMIT');
}

export async function getUserIdByEmail(
  client: pg.Client,
  email: string,
): Promise<{ id: string; email: string }> {
  const r = await client.query<{ id: string; email: string }>(
    'SELECT id, email FROM "User" WHERE email = $1 LIMIT 1',
    [email],
  );
  if (r.rows.length === 0) {
    throw new Error(`No User row for email: ${email}`);
  }
  return r.rows[0];
}

export async function countOnboardingForUser(
  client: pg.Client,
  userId: string,
): Promise<number> {
  const r = await client.query<{ c: string }>(
    'SELECT COUNT(*)::text AS c FROM "OnboardingState" WHERE "userId" = $1',
    [userId],
  );
  return Number.parseInt(r.rows[0]?.c ?? '0', 10);
}
