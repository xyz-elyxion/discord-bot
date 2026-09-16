const { Logger } = require("../Functions/index");
const logger = new Logger();

// Errors are logged locally only — no external webhook.
function ClientErrorHandler(client) {
  client.on("error", (err) => {
    logger.custom(`${err}`);
  });
}

function ErrorHandler() {
  logger.success("Error Handler has been loaded");

  process.on("unhandledRejection", (reason, promise) => {
    logger.custom(`${reason}`);
  });

  process.on("uncaughtException", (err, origin) => {
    logger.custom(`${err}`);
  });

  process.on("uncaughtExceptionMonitor", (err, origin) => {
    logger.custom(`${err}`);
  });

  process.on("warning", (warn) => {
    logger.custom(`${warn}`);
  });
}

module.exports = { ErrorHandler, ClientErrorHandler };
