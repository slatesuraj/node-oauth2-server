// Require winston logger
const winston = require('winston')

// Winston logger configuration
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: process.env.LOG_LEVEL,
      filename: process.env.LOG_FILE_PATH,
      handleExceptions: (/true/i).test(process.env.LOG_HANDLE_EXCEPTIONS),
      json: (/true/i).test(process.env.LOG_JSON),
      timestamp: (/true/i).test(process.env.LOG_TIMESTAMP),
      maxsize: parseInt(process.env.LOG_MAXSIZE), // 5MB
      maxFiles: parseInt(process.env.LOG_MAXFILE),
      colorize: (/true/i).test(process.env.LOG_COLORIZE)
    }),
    new winston.transports.Console({
      level: process.env.LOG_LEVEL,
      prettyPrint: (/true/i).test(process.env.LOG_PRETTYPRINT),
      timestamp: (/true/i).test(process.env.LOG_TIMESTAMP),
      handleExceptions: (/true/i).test(process.env.LOG_HANDLE_EXCEPTIONS),
      json: (/true/i).test(process.env.LOG_JSON),
      colorize: (/true/i).test(process.env.LOG_COLORIZE)
    })
  ],
  exitOnError: process.env.LOG_EXITONERROR
})

module.exports = logger
module.exports.stream = {
  write: function (message, encoding) {
    logger.info(message)
  }
}
