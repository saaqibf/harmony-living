/**
 * Ensures two Cognito users exist for Phase 3 Playwright verification.
 * Uses AdminCreateUser + AdminSetUserPassword (no inbox required).
 *
 * Required env: COGNITO_USER_POOL_ID, COGNITO_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 * Optional: E2E_PHASE3_V1_EMAIL, E2E_PHASE3_V6_EMAIL, E2E_PHASE3_PASSWORD
 */
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import fs from 'node:fs';
import path from 'node:path';

function loadEnvFile() {
  const p = path.join(process.cwd(), '.env');
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!m) continue;
    const k = m[1];
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

loadEnvFile();

const poolId = process.env.COGNITO_USER_POOL_ID;
const region = process.env.COGNITO_REGION || 'us-west-2';
const v1Email =
  process.env.E2E_PHASE3_V1_EMAIL || 'harmony.phase3.v1.e2e@harmony-living.test';
const v6Email =
  process.env.E2E_PHASE3_V6_EMAIL || 'harmony.phase3.v6.e2e@harmony-living.test';
const password = process.env.E2E_PHASE3_PASSWORD || 'HarmonyE2e1!';

if (!poolId) {
  console.error('[ensure-phase3-e2e-users] COGNITO_USER_POOL_ID missing');
  process.exit(1);
}

const client = new CognitoIdentityProviderClient({ region });

async function ensureUser(email) {
  try {
    await client.send(
      new AdminGetUserCommand({
        UserPoolId: poolId,
        Username: email,
      }),
    );
    console.log(`[ensure-phase3-e2e-users] exists: ${email}`);
  } catch (e) {
    if (e.name !== 'UserNotFoundException') throw e;
    try {
      await client.send(
        new AdminCreateUserCommand({
          UserPoolId: poolId,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
          ],
          MessageAction: 'SUPPRESS',
        }),
      );
      console.log(`[ensure-phase3-e2e-users] created: ${email}`);
    } catch (ce) {
      if (ce && typeof ce === 'object' && 'name' in ce && ce.name === 'UsernameExistsException') {
        console.log(`[ensure-phase3-e2e-users] race exists: ${email}`);
      } else {
        throw ce;
      }
    }
  }

  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: poolId,
      Username: email,
      Password: password,
      Permanent: true,
    }),
  );
  console.log(`[ensure-phase3-e2e-users] password set: ${email}`);
}

await ensureUser(v1Email);
await ensureUser(v6Email);
console.log('[ensure-phase3-e2e-users] done');
