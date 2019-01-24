const winston = require('winston');
const path = require('path');

const { transports } = winston;

const options = {
  combined: {
    level: 'info',
    filename: 'logs/combined.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    colorize: false
  },
  error: {
    level: 'error',
    filename: 'logs/error.log',
    handleExceptions: true,
    json: true,
    maxsize: 5242880,
    colorize: false
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true
  }
};

const winstonLogger = winston.createLogger({
  transports: [
    new transports.File(options.combined),
    new transports.File(options.error),
    new transports.Console(options.console)
  ],
  exitOnError: false
});

const logger = {
  log: msg => winstonLogger.log('info', msg),
  error: msg => winstonLogger.error(msg)
};

exports.logger = logger;
