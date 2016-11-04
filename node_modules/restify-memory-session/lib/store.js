module.exports = function () {
  var sessions = {},
    result = {};

  result.create = function(sid , done) {
    var one = { _id: sid };
    result.update(one, done);
  };

  result.read = function(sid , done) {
    if(done) done(null, sessions[sid]);
  };

  result.update = function(data , done) {
    sessions[data._id] = data;
    if(done) done(null, data);
  };

  result.delete = function(sid, done) {
    delete sessions[sid];
    if(done) done(null);
  };

  result.map = function(handle) {
    if (typeof handle !== 'function') return;

    for (var i in sessions) {
      if (sessions.hasOwnProperty(i)) {
        handle(sessions[i]);
      }
    }
  };

  result.empty = function(done) {
    sessions = {};
    if(done) done(null);
  };

  result.all = function(done) {
    if(done) done(sessions);
  };

  return result;
};

