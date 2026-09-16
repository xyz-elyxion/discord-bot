const { Logger } = require("../Functions/index");
const logger = new Logger();

// The "ready" deprecation warning comes from discord-hybrid-sharding's internal
// listener (not our code — our event already uses "clientReady"). Silence it.
const originalEmitWarning = process.emitWarning.bind(process);
process.emitWarning = (warning, ...args) => {
  const text = typeof warning === "string" ? warning : warning?.message || "";
  if (text.includes("ready event has been renamed")) return;
  return originalEmitWarning(warning, ...args);
};

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
