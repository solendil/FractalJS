var Logger = (function() {
    var levels = {
        ALL:100,
        DEBUG:100,
        INFO:200,
        WARN:300,
        ERROR:400,
        OFF:500
    };
    var loggerCache = {};
    var cons = console;
    var noop = function() {};
    var level = function(level) {
        this.error = level<=levels.ERROR ? cons.error.bind(cons, "["+this.id+"] - ERROR - %s") : noop;
        this.warn = level<=levels.WARN ? cons.warn.bind(cons, "["+this.id+"] - WARN - %s") : noop;
        this.info = level<=levels.INFO ? cons.info.bind(cons, "["+this.id+"] - INFO - %s") : noop;
        this.debug = level<=levels.DEBUG ? cons.log.bind(cons, "["+this.id+"] - DEBUG - %s") : noop;
        this.log = cons.log.bind(cons, "["+this.id+"] %s");
        this.currentLevel = level;
        return this;
    };
    levels.get = function(id) {
        var res = loggerCache[id];
        if (!res) {
            var ctx = {id:id,level:level}; // create a context
            ctx.level(Logger.ALL); // apply level
            res = ctx.log; // extract the log function, copy context to it and returns it
            for (var prop in ctx)
                res[prop] = ctx[prop];
            loggerCache[id] = res;
        }
        return res;
    };
    return levels; // return levels augmented with "get"
})();

export default Logger;
