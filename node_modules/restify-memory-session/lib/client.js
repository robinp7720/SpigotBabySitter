var store = require('./store.js');

var Client = module.exports = function() {
	this._store = store();
};

Client.prototype.timeRun = function() {
	var store = this._store;

	function _timeRunning() {
		store.map(function(each){
			if (each && !each.ttl) {
  			store.delete(each._id);
  		}

  		if (each && each.ttl && each.ttl > 0) {
  			each.ttl--;
  		} 
		});
  }

  setInterval(_timeRunning, 1000);
};

Client.prototype.exists = function(sid, callback) {
	this._store.read(sid, function(err, data) {
		var exists = !!data;
		callback(err, exists);
	});
};

Client.prototype.create = function(sid, callback) {
	this._store.create(sid, callback);
};

Client.prototype.set = function(sid, info, callback) {
	var _this = this;

	this._store.read(sid, function(err, data) {
		if (data) {
			data.info = info;
			_this._store.update(data, callback);
		} else {
			callback(err, false);
		}
	});
};

Client.prototype.setex = function(sid, ttl, info, callback) {
	var _this = this;

	this._store.read(sid, function(err, data) {
		if (data) {
			data.info = info;
			data.ttl = ttl;
			_this._store.update(data, callback);
		} else {
			callback(err, false);
		}
	});
};

Client.prototype.get = function(sid, callback) {
	this._store.read(sid, function(err, data) {
		var info = data ? data.info : null;
		callback(err, info);
	});
};

Client.prototype.expire = function(sid, ttl, callback) {
	var _this = this;
	this._store.read(sid, function(err, data) {
		if (data && data.ttl && data.ttl > 0) {
			data.ttl = ttl;
			_this._store.update(data, callback);
		} else {
			callback(err, false);
		}
	});
};

Client.prototype.del = function(sid, callback) {
	this._store.delete(sid, callback);
};

Client.prototype.keys = function(str, callback) {
	callback(null, this._store.all());
};

Client.prototype.flushall = function(callback) {
	this._store.empty(callback);
};