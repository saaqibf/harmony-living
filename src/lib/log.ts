/**
 * Logging utility skeleton.
 *
 * Phase 3 ships a console-backed implementation. Phase 5 wires this up to
 * structured observability (a remote sink, structured fields, error tracking).
 *
 * Use this rather than bare console.log/console.error in any code path that
 * may surface in production.
 *
 * See ADR 0004 invariant 6 for the dealbreaker malformed-shape logging case
 * and ADR 0005 for swipe-deck malformed-data cases.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogFields = Record<string, unknown>;

function emit(level: LogLevel, msg: string, fields?: LogFields) {
  const payload = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...fields,
  };
  if (level === 'error') {
    console.error(JSON.stringify(payload));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(payload));
  } else {
    console.log(JSON.stringify(payload));
  }
}

export const log = {
  debug: (msg: string, fields?: LogFields) => emit('debug', msg, fields),
  info: (msg: string, fields?: LogFields) => emit('info', msg, fields),
  warn: (msg: string, fields?: LogFields) => emit('warn', msg, fields),
  error: (msg: string, fields?: LogFields) => emit('error', msg, fields),
};
