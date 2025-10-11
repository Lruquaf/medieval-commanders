const { env } = require('../config/env');

const LEVEL_PRIORITY = { error: 0, warn: 1, info: 2, debug: 3 };
const ACTIVE_LEVEL = env.IS_PRODUCTION ? 'info' : 'debug';

function shouldLog(level) {
  return LEVEL_PRIORITY[level] <= LEVEL_PRIORITY[ACTIVE_LEVEL];
}

function format(level, message, meta) {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  if (meta && Object.keys(meta).length > 0) {
    try {
      return `${base} ${JSON.stringify(meta)}`;
    } catch (_) {
      return base;
    }
  }
  return base;
}

const logger = {
  info(message, meta = undefined) {
    if (!shouldLog('info')) return;
    console.log(format('info', message, meta));
  },
  warn(message, meta = undefined) {
    if (!shouldLog('warn')) return;
    console.warn(format('warn', message, meta));
  },
  error(message, meta = undefined) {
    if (!shouldLog('error')) return;
    console.error(format('error', message, meta));
  },
  debug(message, meta = undefined) {
    if (!shouldLog('debug')) return;
    console.debug(format('debug', message, meta));
  }
};

module.exports = logger;


