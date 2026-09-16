class Logger {
  constructor() {
    this.origin = this._getLogOrigin().split(/[\\/]/).pop();
  }
  _getLogOrigin() {
    let filename;

    let _pst = Error.prepareStackTrace;
    Error.prepareStackTrace = function (err, stack) {
      return stack;
    };
    try {
      let err = new Error();
      let callerfile;
      let currentfile;

      currentfile = err.stack.shift().getFileName();

      while (err.stack.length) {
        callerfile = err.stack.shift().getFileName();

        if (currentfile !== callerfile) {
          filename = callerfile;
          break;
        }
      }
    } catch (err) {}
    Error.prepareStackTrace = _pst;

    return filename;
  }

  _format(emoji, content, width = 20) {
    return (
      new Date().toLocaleTimeString() +
      `  ${emoji}  [` +
      `${
        this.origin.length > 25
          ? this.origin.substring(0, 17) + "..."
          : this.origin
      }` +
      `] ` +
      " ".repeat(width - (this.origin.length > width ? width : this.origin.length)) +
      "| " +
      content
    );
  }

  error(content) {
    console.log(this._format("🛑", content));
  }

  info(content) {
    console.log(this._format("✉️", content));
  }
  warn(content) {
    console.log(this._format("⚠️", content));
  }

  success(content) {
    console.log(this._format("✅", content));
  }
  custom(content) {
    console.log(this._format("🛑", content));
  }
}

module.exports = { Logger };
