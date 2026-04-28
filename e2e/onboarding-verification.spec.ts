import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {
  withDb,
  wipeOnboardingState,
  getUserIdByEmail,
  countOnboardingForUser,
} from './db';

function maskEmail(email: string) {
  const [a, d] = email.split('@');
  if (!d) return '***';
  return `${a.slice(0, 2)}***@${d}`;
}

function maskId(id: string) {
  return `${id.slice(0, 6)}…`;
}

function makePostTracker(page: import('@playwright/test').Page) {
  const statuses: number[] = [];
  const handler = (res: import('@playwright/test').Response) => {
    const req = res.request();
    if (req.method() !== 'POST') return;
    try {
      const p = new URL(req.url()).pathname;
      if (p === '/onboarding' || /^\/onboarding\/\d+$/.test(p)) {
        statuses.push(res.status());
      }
    } catch {
      /* ignore */
    }
  };
  page.on('response', handler);
  return {
    drain: () => {
      const out = [...statuses];
      statuses.length = 0;
      return out;
    },
    stop: () => page.off('response', handler),
  };
}

async function login(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await page.waitForURL(/\/(onboarding|dashboard)/, { timeout: 60_000 });
}

async function loginFresh(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
) {
  await page.context().clearCookies();
  await login(page, email, password);
}

test.describe.configure({ mode: 'serial' });

test.describe('Phase 3 — V6 draft promotion then V1 full onboarding', () => {
  const outDir = path.join(process.cwd(), 'e2e-output');
  const v1Email =
    process.env.E2E_PHASE3_V1_EMAIL || 'harmony.phase3.v1.e2e@harmony-living.test';
  const v6Email =
    process.env.E2E_PHASE3_V6_EMAIL || 'harmony.phase3.v6.e2e@harmony-living.test';
  const password = process.env.E2E_PHASE3_PASSWORD || 'HarmonyE2e1!';

  test('V6 — draft through step 3, promotion on step 4', async ({ page }) => {
    const record: Record<string, unknown> = { maskedEmail: maskEmail(v6Email), phases: [] };

    await loginFresh(page, v6Email, password);

    const userId = await withDb(async (c) => {
      const u = await getUserIdByEmail(c, v6Email);
      await wipeOnboardingState(c, u.id);
      return u.id;
    });

    await page.context().clearCookies();
    await login(page, v6Email, password);
    await page.waitForURL(/\/onboarding/);

    const tracker = makePostTracker(page);

    await page.locator('input[type="radio"][value="both"]').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/2');
    tracker.drain();

    await page.locator('#firstName').fill('V6');
    await page.locator('input[type="date"]').fill('1991-06-10');
    await page.locator('input[type="radio"][value="FEMALE"]').click({ force: true });
    await page.locator('#city').fill('Edmonton');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/3');
    tracker.drain();

    await page.getByPlaceholder('e.g. Calgary').fill('Edmonton');
    await page.keyboard.press('Enter');
    await page.locator('#onboarding-move-in-date').fill('2026-09-01');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/4');
    tracker.drain();

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      record.phases!.push({
        afterStep3: {
          preferencesCount: pc.rows[0]?.c,
          draftDataSnippet: (dr.rows[0]?.draftData as string)?.slice(0, 400),
        },
      });
    });

    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/5');
    tracker.stop();

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.phases![0] as Record<string, unknown>).afterStep4 = {
        preferencesCount: pc.rows[0]?.c,
        draftData: dr.rows[0]?.draftData,
      };
    });

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'phase3-v6.json'), JSON.stringify(record, null, 2));

    const p0 = record.phases![0] as {
      afterStep3?: { preferencesCount?: number };
      afterStep4?: { preferencesCount?: number; draftData?: string };
    };
    expect(p0.afterStep3?.preferencesCount).toBe(0);
    expect(p0.afterStep4?.preferencesCount).toBe(1);
    expect(p0.afterStep4?.draftData).toMatch(/\{\}/);
  });

  test('V1 — steps 1–6 with DB + POST checks', async ({ page }) => {
    const record: Record<string, unknown> = {
      maskedEmail: maskEmail(v1Email),
      steps: [] as unknown[],
    };

    await loginFresh(page, v1Email, password);

    const userId = await withDb(async (c) => {
      const u = await getUserIdByEmail(c, v1Email);
      await wipeOnboardingState(c, u.id);
      const cnt = await countOnboardingForUser(c, u.id);
      record.before = { userIdMasked: maskId(u.id), onboardingStateRows: cnt };
      return u.id;
    });

    await page.context().clearCookies();
    await login(page, v1Email, password);
    await page.waitForURL(/\/onboarding/, { timeout: 30_000 });

    const tracker = makePostTracker(page);

    // Step 1 — Intent
    await page.locator('input[type="radio"][value="seeker"]').click({ force: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/2');
    const post1 = tracker.drain();
    record.steps!.push({ step: 1, urlAfter: page.url(), postStatuses: post1 });

    await withDb(async (c) => {
      const os = await c.query(
        `SELECT intent, "completedSteps" FROM "OnboardingState" WHERE "userId" = $1`,
        [userId],
      );
      const ur = await c.query(`SELECT roles FROM "User" WHERE id = $1`, [userId]);
      record.steps![record.steps!.length - 1] = {
        ...(record.steps![record.steps!.length - 1] as object),
        db: { onboardingState: os.rows[0], userRoles: ur.rows[0]?.roles },
      };
    });

    // Step 2 — Basics
    await page.locator('#firstName').fill('E2E');
    await page.locator('input[type="date"]').fill('1990-05-15');
    await page.locator('input[type="radio"][value="PREFER_NOT_TO_SAY"]').click({ force: true });
    await page.locator('#city').fill('Calgary');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/3');
    const post2 = tracker.drain();
    record.steps!.push({ step: 2, urlAfter: page.url(), postStatuses: post2 });

    await withDb(async (c) => {
      const pr = await c.query(
        `SELECT "firstName", "dateOfBirth"::text, gender, city FROM "Profile" WHERE "userId" = $1`,
        [userId],
      );
      const os = await c.query(
        `SELECT "completedSteps" FROM "OnboardingState" WHERE "userId" = $1`,
        [userId],
      );
      (record.steps![1] as Record<string, unknown>).db = {
        profile: pr.rows[0],
        completedSteps: os.rows[0]?.completedSteps,
      };
    });

    // Step 3 — Housing
    await page.getByPlaceholder('e.g. Calgary').fill('Calgary');
    await page.keyboard.press('Enter');
    await page.locator('#onboarding-move-in-date').fill('2026-08-01');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/4');
    const post3 = tracker.drain();
    record.steps!.push({ step: 3, urlAfter: page.url(), postStatuses: post3 });

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.steps![2] as Record<string, unknown>).db = {
        preferencesCount: pc.rows[0]?.c,
        draftData: dr.rows[0]?.draftData,
      };
    });

    // Step 4 — Lifestyle (defaults)
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/5');
    const post4 = tracker.drain();
    record.steps!.push({ step: 4, urlAfter: page.url(), postStatuses: post4 });

    await withDb(async (c) => {
      const pc = await c.query(
        `SELECT COUNT(*)::int AS c FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      const lf = await c.query(
        `SELECT cleanliness, schedule, "drinkingSelf", "drinkingRoommate" FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      (record.steps![3] as Record<string, unknown>).db = {
        preferencesCount: pc.rows[0]?.c,
        draftData: dr.rows[0]?.draftData,
        preferencesLifestyle: lf.rows[0],
      };
    });

    // Step 5 — Values
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.waitForURL('**/onboarding/6');
    const post5 = tracker.drain();
    record.steps!.push({ step: 5, urlAfter: page.url(), postStatuses: post5 });

    await withDb(async (c) => {
      const vf = await c.query(
        `SELECT "faithPractice", "genderPreference", "ageMin", "ageMax", dealbreakers FROM "Preferences" WHERE "userId" = $1`,
        [userId],
      );
      const dr = await c.query(`SELECT "draftData"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.steps![4] as Record<string, unknown>).db = {
        preferencesValues: vf.rows[0],
        draftData: dr.rows[0]?.draftData,
      };
    });

    // Step 6 — Profile finish
    await page.locator('input[type="radio"][value="PUBLIC"]').click({ force: true });
    await page.getByRole('button', { name: 'Complete onboarding' }).click();
    await page.waitForURL('**/dashboard?welcome=1', { timeout: 60_000 });
    const post6 = tracker.drain();
    tracker.stop();

    const cookies = await page.context().cookies();
    const onboarded = cookies.find((c) => c.name === 'hl_onboarded');
    record.steps!.push({
      step: 6,
      urlAfter: page.url(),
      postStatuses: post6,
      hl_onboarded: onboarded
        ? {
            value: onboarded.value,
            httpOnly: onboarded.httpOnly,
            sameSite: onboarded.sameSite,
            expires: onboarded.expires ? onboarded.expires / 1000 : null,
          }
        : null,
    });

    await withDb(async (c) => {
      const pr = await c.query(`SELECT bio, languages FROM "Profile" WHERE "userId" = $1`, [userId]);
      const pm = await c.query(`SELECT "privacyMode"::text FROM "User" WHERE id = $1`, [userId]);
      const ca = await c.query(`SELECT "completedAt"::text FROM "OnboardingState" WHERE "userId" = $1`, [
        userId,
      ]);
      (record.steps![5] as Record<string, unknown>).db = {
        profile: pr.rows[0],
        privacyMode: pm.rows[0]?.privacyMode,
        completedAt: ca.rows[0]?.completedAt,
      };
    });

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'phase3-v1.json'), JSON.stringify(record, null, 2));

    expect((record.steps![2] as { db?: { preferencesCount?: number } }).db?.preferencesCount).toBe(0);
    expect((record.steps![3] as { db?: { preferencesCount?: number } }).db?.preferencesCount).toBe(1);
    const d3 = JSON.parse(
      (record.steps![2] as { db?: { draftData?: string } }).db?.draftData ?? '{}',
    );
    expect(d3.budgetMin).toBeTruthy();
    expect(onboarded?.httpOnly).toBe(true);
    expect(onboarded?.sameSite).toBe('Lax');
  });
});
