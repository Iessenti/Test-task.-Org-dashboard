const ORG_TREE_MODES = new Set(['normal', 'delay', 'empty', 'error', 'invalid']);
const REALTIME_MODES = new Set(['generated', 'scripted']);

const readNonNegativeNumber = (value, fallback, minimum = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(parsed, minimum) : fallback;
};

const readMode = (value, allowedModes, fallback, name, logger) => {
  const mode = allowedModes.has(value) ? value : fallback;
  if (value !== mode) {
    logger.warn(`Unknown ${name} "${value}". Falling back to "${fallback}".`);
  }
  return mode;
};

export function readServerConfig(env = process.env, logger = console) {
  return {
    orgTreeMode: readMode(env['ORG_TREE_MODE'] ?? 'normal', ORG_TREE_MODES, 'normal', 'ORG_TREE_MODE', logger),
    orgTreeDelayMs: readNonNegativeNumber(env['ORG_TREE_DELAY_MS'] ?? 0, 0),
    realtimeIntervalMs: readNonNegativeNumber(env['REALTIME_INTERVAL_MS'] ?? 1000, 1000, 1),
    realtimeMode: readMode(env['REALTIME_MODE'] ?? 'generated', REALTIME_MODES, 'generated', 'REALTIME_MODE', logger),
  };
}
