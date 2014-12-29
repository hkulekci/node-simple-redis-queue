var RedisQueue, RedisQueueError, events,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

events = require("events");

RedisQueueError = (function(_super) {
  __extends(RedisQueueError, _super);

  function RedisQueueError() {
    return RedisQueueError.__super__.constructor.apply(this, arguments);
  }

  return RedisQueueError;

})(Error);

RedisQueue = (function(_super) {
  __extends(RedisQueue, _super);

  function RedisQueue(conn) {
    this.conn = conn;
  }

  RedisQueue.prototype.next = function() {
    var keysToMonitor;
    keysToMonitor = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.pop.apply(this, [false].concat(__slice.call(keysToMonitor)));
  };

  RedisQueue.prototype.push = function(type, payload, callback) {
    return this.conn.lpush(type, JSON.stringify(payload), callback);
  };

  RedisQueue.prototype.monitor = function() {
    var keysToMonitor;
    keysToMonitor = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return this.pop.apply(this, [true].concat(__slice.call(keysToMonitor)));
  };

  RedisQueue.prototype.pop = function() {
    var is_async, keysToMonitor, _ref;
    is_async = arguments[0], keysToMonitor = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    return (_ref = this.conn).brpop.apply(_ref, __slice.call(keysToMonitor).concat([0], [(function(_this) {
      return function(err, replies) {
        try {
          if (err != null) {
            return _this.emit("error", err);
          }
          if (replies.length !== 2) {
            return _this.emit("error", new RedisQueueError("Bad number of replies from redis " + replies.length));
          }
          return _this.emit("message", replies[0], replies[1]);
        } finally {
          if (is_async) {
            _this.pop.apply(_this, [true].concat(__slice.call(keysToMonitor)));
          }
        }
      };
    })(this)]));
  };

  RedisQueue.prototype.clear = function() {
    var keysToClear, _ref;
    keysToClear = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.conn).del.apply(_ref, keysToClear);
  };

  return RedisQueue;

})(events.EventEmitter);

module.exports = RedisQueue;