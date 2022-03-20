const winston = require('winston');
const { format } = require('logform');

const logger = winston.createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    // format.align(),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    //
    // - Write all logs with importance level of `error` or less to `error.log`
    // - Write all logs with importance level of `info` or less to `combined.log`
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.align(),
        format.json(),
        format.errors({stack: true}),
        format.printf(info => `[${info.level}] : ${info.message.trim()} [${info.timestamp}] `)
      ),
  }));
}


function createLogger(service) {
    return logger.child({ module: service });
}
  

module.exports = createLogger