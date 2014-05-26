var flx = require('./flx')
  , express = require('express')
  , app = express();

var _cid = 0;

flx.register("output", function(msg){
  if (msg.res) {
    this.cid[msg.cid] = msg.res;
  } else {
    var cid = msg.cid;
    this.cid[cid].send(JSON.stringify(msg));
  }
  return undefined;
}, {
  cid: {}
});

function listen() {
  var server = app.listen(8080);
  var io = require('socket.io').listen(server, {log: false});
  var hooks = require('./hooks').setSocket(io.sockets);

	console.log(">> listening 8080 ");
}

function route(path, output, name) {
  app.get(path, function(req, res) {
    var msg = {
      data: req.params,
      cid: ++_cid,
      source: name || path
    };

    flx.start(flx.m("output", {cid: msg.cid, url: req.url, res: res, source: msg.source}));
    flx.start(flx.m(output, msg));
  });
}

function static(route, path) {
  return app.use(route, express.static(path));
}

module.exports = {
	listen: listen,
  route: route,
  static: static
};
