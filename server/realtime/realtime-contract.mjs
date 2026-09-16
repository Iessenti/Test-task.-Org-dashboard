const ALLOWED_METRICS = new Set(['headcount', 'budget', 'performance']);

export function assertMetricPatchContract(event, knownNodeIds) {
  if (event === null || typeof event !== 'object') {
    throw new TypeError('Realtime event must be an object.');
  }
  if (event.type !== 'metric.patch') {
    throw new TypeError('Realtime event type is invalid.');
  }
  if (typeof event.eventId !== 'string' || event.eventId.length === 0) {
    throw new TypeError('Realtime event id is invalid.');
  }
  if (!Number.isInteger(event.sequence) || event.sequence < 1) {
    throw new TypeError('Realtime event sequence is invalid.');
  }
  if (typeof event.nodeId !== 'string' || !knownNodeIds.has(event.nodeId)) {
    throw new TypeError('Realtime event targets an unknown node.');
  }
  if (typeof event.updatedAt !== 'string' || Number.isNaN(Date.parse(event.updatedAt))) {
    throw new TypeError('Realtime event timestamp is invalid.');
  }

  const metrics = event.metrics;
  if (metrics === null || typeof metrics !== 'object' || Array.isArray(metrics)) {
    throw new TypeError('Realtime event metrics must be an object.');
  }

  const metricNames = Object.keys(metrics);
  if (metricNames.length === 0 || metricNames.some((metric) => !ALLOWED_METRICS.has(metric))) {
    throw new TypeError('Realtime event contains forbidden metrics.');
  }

  for (const metric of metricNames) {
    const value = metrics[metric];
    if (metric === 'headcount' && (!Number.isInteger(value) || value < 0)) {
      throw new RangeError('Realtime headcount is out of bounds.');
    }
    if (metric === 'budget' && (!Number.isFinite(value) || value < 0)) {
      throw new RangeError('Realtime budget is out of bounds.');
    }
    if (metric === 'performance' && (!Number.isFinite(value) || value < 0 || value > 100)) {
      throw new RangeError('Realtime performance is out of bounds.');
    }
  }
}
