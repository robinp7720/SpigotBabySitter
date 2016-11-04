var Client = require('./client.js');

module.exports = function(config) {
  // namespace
  var session = {};
  var utils   = require('object_utils');
  var Random  = require('secure-rnd');
  var rnd     = new Random();
  /**
   * @ignore
   * @private
   */
  session.name = 'memroy-session';

  /**
   * @ignore
   * @private
   */
  session.merge = utils.merge;

  config = config || {};
  /**
   * Configuration
   */
  session.config = {
    /**
     * @cfg {Integer} ttl=600 The time to live for the session in seconds
     */
    ttl: 600, // 10min
    /**
     * @cfg {Boolean} debug=true true to enable debug session
     */
    debug: false,
    /**
     * @cfg {Object} logger=console The logger. If you use winston set your desired log level and set debug = true.
     */
    logger: console,
    /**
     * @cfg {Integer} sidLength=40 The number of characters to create the session ID.
     */
    sidLength: 40,
    /**
     * @cfg {Boolean} persist=false Persistence of session
     * If persist is false, the session will expire after the ttl config.
     * If persist is true, the session will never expire and ttl config will be ignored.
     */
    persist: false,
    /**
     * @cfg {String} sidHeader='Session-Id' The Header section name to store the session identifier
     */
    sidHeader: 'Session-Id'
  };

  // merge new config with default config
  session.merge(session.config, config);

  if ('function' !== typeof session.config.logger.debug) {
    session.config.logger.debug = session.config.logger.log;
  }
  if ('function' !== typeof session.config.logger.error) {
    session.config.logger.error = session.config.logger.log;
  }
  if ('function' !== typeof session.config.logger.info) {
    session.config.logger.info = session.config.logger.log;
  }

  var cfg = session.config;

  // create memory client, keep the api the same.
  session.client = new Client();
  if (!cfg.persist) {
    session.client.timeRun();
  }

  var isNull = utils.isNull;

  /**
   * Create session identifier
   *
   * @param {Function} callback Function called when the identifier is created
   * @return {callback(err, sid)} The callback to execute as result
   * @param {String} callback.err Error if occurred
   * @param {String} callback.sid session identifier
   * @private
   */
  session.createSid = function(callback) {
    var chars  = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz',
        codes  = [],
        cLen   = chars.length,
        len    = cfg.sidLength,
        sid    = '',
        i      = 0,
        rNum;

    codes.length = cLen;

    // generate secure randoms
    rnd(codes);

    for ( i = 0; i < len; i++) {
      rNum = Math.floor(codes[i] * cLen / 255);
      sid += chars.substring(rNum, rNum + 1);
    }

    session.client.exists(sid, function(err, exists) {
      if (err && cfg.debug) {
        cfg.logger.error(session.name + ': sid creation ERROR');
        cfg.logger.error(err);
      }

      if (exists) {
        session.createSid(callback);
      } else {

        session.client.create(sid, function(err, data) {
          if (err && cfg.debug) {
            cfg.logger.error(session.name + ': sid creation ERROR');
            cfg.logger.error(err);
          }

          if (cfg.debug) {
            cfg.logger.debug(session.name + ': sid created ' + sid);
          }
          callback.call(session, err, sid);
        });
      }
    });
  };

  /**
   * Save session data
   *
   * @param {String} sid session identifier
   * @param {Object} data session data
   * @param {Function} callback Function called when the session is saved
   * @return {callback(err, status)} The callback to execute as result
   * @param {String} callback.err Error if occurred
   * @param {String} callback.status Result from Redis query
   */
  session.save = function(sid, data, callback) {
    if (isNull(sid)) {
      if (callback) {
        callback.call(session, 'no sid given', undefined);
      }
      return;
    }

    var ttl  = session.config.ttl,
      info = JSON.stringify(data),

      setCallback = function(err, status) {
        if (err && cfg.debug) {
          cfg.logger.log(session.name + ': saving sid ' + sid + ' ERROR');
          cfg.logger.log(err);
        }
        if (callback) {
          callback.call(session, err, status);
        }
      };

    if (cfg.persist) {
      session.client.set(sid, info, setCallback);
    } else {
      session.client.setex(sid, ttl, info, setCallback);
    }
  };

  /**
   * Load session data
   *
   * @param {String} sid session identifier
   * @param {Function} callback Function called when the session is loaded
   * @return {callback(err, data)} The callback to execute as result
   * @param {String} callback.err Error if occurred
   * @param {Object} callback.data session data
   */
  session.load = function(sid, callback) {
    if (isNull(sid)) {
      if (callback) {
        callback.call(session, 'no sid given', undefined);
      }
      return;
    }
    session.client.get(sid, function(err, info) {
      var data;
      if (err) {
        if (cfg.debug) {
          cfg.logger.debug(session.name + ': sid ' + sid + ' loading ERROR');
          cfg.logger.debug(err);
        }
      } else if (!isNull(info)) {
        data = JSON.parse(info.toString());
      }
      if (callback) {
        callback.call(session, err, data);
      }
    });
  };

  /**
   * Update the ttl for the session
   *
   * @param {String} sid session identifier
   * @param {Function} callback Function called when the session is refreshed
   * @return {callback(err, active)} The callback to execute as result
   * @param {String} callback.err Error if occurred
   * @param {Boolean} callback.active True if the sid is active (not expired)
   */
  session.refresh = function(sid, callback) {
    if (isNull(sid)) {
      if (callback) {
        callback.call(session, 'no sid given', false);
      }
      return;
    }
    if (cfg.persist) {
      callback.call(session, undefined, true);
      return;
    }
    session.client.expire(sid, session.config.ttl, function(err, status){
      if (err && cfg.debug) {
        cfg.logger.debug(session.name + ': sid ' + sid + ' refreshing ERROR');
        cfg.logger.debug(err);
      }
      if (callback) {
        callback.call(session, err, status);
      }
    });
  };

  /**
   * Check if a session identifier exists
   *
   * @param {String} sid session identifier
   * @param {Function} callback Function called when the session identifier is verified
   * @return {callback(err, exists)} The callback to execute as result
   * @param {String} callback.err Error if occurred
   * @param {Boolean} callback.exists Return true if the session exists
   */
  session.exists = function(sid, callback) {
    if (isNull(sid)) {
      callback.call(session, undefined, false);
      return;
    }
    session.client.exists(sid, function(err, status) {
      if (err && cfg.debug) {
        cfg.logger.debug(session.name + ': sid ' + sid + ' does not exist ERROR');
        cfg.logger.debug(err);
      }
      callback.call(session, err, status);
    });
  };

  /**
   * Get all session identifier
   *
   * @param {Function} callback Function called when the session identifiers are loaded
   * @return {callback(err, keys)} The callback to execute as result
   * @param {String} callback.err Error if occurred
   * @param {Array} callback.keys All valid session identifiers
   * @private
   */
  session.getAllKeys = function(callback) {
    if (!cfg.debug) {
      cfg.logger.debug(session.name + ': unable to get all session identifiers when not in debug mode');
      if (callback) {
        callback.call(session, 'unable to get all session identifiers when not in debug mode');
      }
      return;
    }
    session.client.keys('*', function(err, keys) {
      callback.call(session, err, keys);
    });
  };

  /**
   * Destroy a session
   *
   * @param {String} sid session identifier
   * @param {Function} callback Function called when finishing
   * @return {callback(err, status)} The callback to execute as result
   * @param {String} callback.err Returned error if occurred
   * @param {String} callback.status Returned status code from Redis
   * @private
   */
  session.destroy = function(sid, callback) {
    if (isNull(sid)) {
      if (callback) {
        callback.call(session, 'no sid given', 0);
      }
      return;
    }
    session.client.del(sid, function(status) {
      if (callback) {
        callback.call(session, undefined, status);
      }
    });
  };

  /**
   * Destroy all sessions
   *
   * @param {Function} callback Function called when finishing
   * @return {callback(status)} The callback to execute as result
   * @param {String} callback.err Returned error if occurred
   * @param {String} callback.status Returned status code from Redis
   * @private
   */
  session.destroyAll = function(callback) {
    if (!cfg.debug) {
      cfg.logger.debug(session.name + ': unable to destroy all sessions when not in debug mode');
      if (callback) {
        callback.call(session, 'unable to destroy all sessions when not in debug mode');
      }
      return;
    }
    session.client.flushall(function(status) {
      if (callback) {
        callback.call(session, undefined, status);
      }
    });
  };

  /**
   * Set data in session object to use in other middlewares below this
   *
   * @param {String} sid The session identifier
   * @param {{sid: String, ...}} data The data to store in session
   * @param {{session: data, ...}} req Client request with new __session__ property
   * containing session data
   * @param {Object} res Server response
   * @param {Function} next Calback to execute at the end of saving
   */
  session.setSessionData = function(sid, data, req, res, next) {
    if (isNull(sid)) {
      next();
      return;
    }
    if (isNull(data)) {
      data = {};
    }
    data.sid  = sid;
    session.save(sid, data, function(err, status){
      if (!err) {
        // set session in request to use it in other middlewares
        // attached below this
        req.session = data;
        res.setHeader(cfg.sidHeader, sid);
      }
      next();
    });
  };

  /**
   * Manage session in http requests
   *
   * @param {Object} req Request from client
   * @param {Object} res Response from server
   * @param {Function} next Next function to execute in server
   */
  session.sessionManager = function (req, res, next) {
    if (cfg.debug) {
      cfg.logger.log(session.name + ': request url: ' + req.url);
    }
    var reqSid = req.headers[session.config.sidHeader.toLowerCase()];

    session.exists(reqSid, function(existErr, active){
      if (existErr) {
        next();
      } else if (active) {
        session.load(reqSid, function(loadErr, data){
          if (!loadErr) {
            session.setSessionData(reqSid, data, req, res, next);
          } else {
            next();
          }
        });
      } else {
        // if the request is options, do not create session.
        if (req.method !== 'OPTIONS') {
          session.createSid(function(createErr, sid) {
            if (!createErr) {
              session.setSessionData(sid, {}, req, res, next);
            } else {
              next();
            }
          });
        } else {
          next();
        }
      }
    });
  };

  return session;
};
