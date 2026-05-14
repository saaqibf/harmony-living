/**
 * Canonical conversion: users enter a date string (YYYY-MM-DD) from an HTML
 * date input. We store it as that calendar date at UTC midnight. Age
 * calculations are then deterministic regardless of where the user is when
 * we compute their age. Never use the time component of the stored Date.
 */
export function dobToStoredDate(yyyyMmDd: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) {
    throw new Error(`Invalid date format: expected YYYY-MM-DD, got "${yyyyMmDd}"`);
  }
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}

export function ageFromDob(dob: Date, now: Date = new Date()): number {
  const ageMs = now.getTime() - dob.getTime();
  return Math.floor(ageMs / (365.2425 * 24 * 60 * 60 * 1000));
}

/** Precise age in whole years, birthday-aware, use for display. */
export function calcAge(dob: Date): number {
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  return m < 0 || (m === 0 && today.getDate() < dob.getDate()) ? age - 1 : age;
}

export function isAtLeast18(dob: Date, now: Date = new Date()): boolean {
  return ageFromDob(dob, now) >= 18;
}
