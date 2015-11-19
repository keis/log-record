// # Record

var assign = require('object-assign')
  , format = require('util').format
  , dateFormat = require('dateformat-light')
  , lvl = require('standard-levels')
  , levelNames = lvl.names

module.exports = Record

// Constructor for log records. Instances are created by the individual loggers
// and passed through the hierarchy to the sinks for writing. A record consist
// of the `name` of the origin, the log `level`, a `timstamp` and a message.
// `msg` may be a `util.format` style format string and will be combined with
// `args` to format the message. Processors may attach additional attributes to
// the record.
function Record(name, level, timestamp, msg, args) {
  if (level === void 0 && name.constructor === Object) {
    assign(this, name)
  } else {
    this.name = name
    this.level = level
    this.timestamp = timestamp
    this.msg = msg
    this.args = args
  }
}

// `getLevelName` returns the symbolic name of the level by looking it up in
// the level name map that is bound to the prototype.
Record.prototype.levelNames = levelNames
Record.prototype.getLevelName = Record.prototype.levelName = function () {
  return this.levelNames[this.level]
}

// Get the time part of the timestamp formatted as a ISO-8601 string
Record.prototype.getTime = Record.prototype.time = function () {
  return dateFormat(this.timestamp, 'HH:MM:ss.l')
}

// Get the date part of the timestamp formatted as a ISO-8601 string
Record.prototype.getDate = Record.prototype.date = function () {
  return dateFormat(this.timestamp, 'yyyy-mm-dd')
}

// Get the message by combining the message format and `args`. Any error
// objects in `args` are wrapped with a custom `inspect` method to provide
// better stack traces and inline formatting.  `msg` is replace with the
// formatted message and `args` is set to `null` to indicate that the record
// holds a cached value of the final message.
Record.prototype.getMessage = Record.prototype.message = function () {
  if (this.args === null) {
    return this.msg
  }

  var args = this.args.map(function (v) {
    if (v instanceof Error && v.stack) {
      return { inspect: function () { return v.stack }
             , toString: function () { return v.toString() }
             }
    }
    return v
  })

  args.unshift(this.msg)
  this.msg = format.apply(null, args)
  this.args = null

  return this.msg
}
