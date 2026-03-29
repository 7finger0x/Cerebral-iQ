/**
 * Clinical-grade logger for Cerebral iQ.
 * Centralizing log management to comply with GRD004 rules.
 */

const isProd = process.env.NODE_ENV === 'production';

const c = typeof console !== 'undefined' ? console : null;

export const logger = {
  log: (...args: unknown[]) => {
    if (!isProd && c) {
       if (args.length > 0) {
         c['log'](...args);
       }
    }
  },
  error: (...args: unknown[]) => {
    if (!isProd && c) {
      if (args.length > 0) {
        c['error'](...args);
      }
    }
  },
  debug: (...args: unknown[]) => {
    if (!isProd && c) {
      if (args.length > 0) {
        c['debug'](...args);
      }
    }
  },
  info: (...args: unknown[]) => {
    if (!isProd && c) {
      if (args.length > 0) {
        c['log'](...args);
      }
    }
  }
};

export default logger;
