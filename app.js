var flx = require('./lib/flx'),
    web = require('./lib/web'),
    api = require('./public/js/endpoints.js');

web.static('/console', __dirname + '/console');
web.static('/public', __dirname + '/public');
web.static('/', __dirname + '/client');

web.route(api.read(), 'read', 'input');
web.route(api.register(), 'register', 'input');
web.route(api.follow(), 'follow', 'input');
web.route(api.followers(), 'followers', 'input');
web.route(api.post(), 'post', 'input');

function user(msg) {

  this.read = function(msg) {
    return this.m('output',
      {
        cid: msg.cid,
        source: this.name,
        data: this.messages
      });
  };

  this.post = function(msg) {
    this.messages.push(msg.data);
    if (msg.data.user === this.name) {
      var dest = this.followers.slice(0);
      dest.push('output');
      return this.m(dest,
        { 
          cid: msg.cid, 
          source: this.name,
          command: 'post',
          data: msg.data 
        });
    }
    return undefined;
  };

  this.follow = function(msg) {
    if (this.followers.indexOf(msg.data.user) == -1)
      this.followers.push(msg.data.user);
    return this.m('output', 
      { 
        cid: msg.cid, 
        source: this.name, 
        data: 'Success: user added to followers' 
      });
  };

  this.getFollowers = function(msg) {
    return this.m('output', 
      { 
        cid: msg.cid, 
        source: this.name, 
        data: this.followers 
      });
  };

  return this[msg.command](msg);
}

user.scope = function(name) {
  return {
    name: name, 
    messages: [], 
    followers: []
  };
};

flx.register('register', function (msg) {
  if (!msg.data.user)
    return this.m('output', 
      { 
        cid: msg.cid, 
        source: 'register', 
        data: 'Error: username missing.'
      });

  // Register the user (a user is a fluxion)
  if (flx.register(msg.data.user,
                   user,
                   user.scope(msg.data.user)) === false) {
    return this.m('output', 
      { 
        cid: msg.cid, 
        source: 'register', 
        data: 'Error: username already exist'
      });
  }
  return this.m('output', 
    { 
      cid: msg.cid, 
      source: 'register', 
      data: 'Success: account created'
    });

}, {});

flx.register('read', function (msg) {
  msg.command = 'read';
  msg.source = 'read';
  return this.m(msg.data.user, msg);
}, {});

flx.register('post', function (msg) {
  msg.command = 'post';
  msg.source = 'post';
  return this.m('filter', msg);
}, {});

flx.register('filter', function (msg) {
  msg.source = 'filter';
  var key, keyReplacement;

  for (key in this.censured) {
    if (msg.data.message.indexOf(key) !== -1) {
      keyReplacement = this.censured[key];
      msg.data.message = msg.data.message.replace(key, keyReplacement);
    }
  }

  return this.m(msg.data.user, msg);
}, {
  censured: {'lol' : 'apple', 'yop' : 'kiwi', 'kikoo': 'abricot' }
});

flx.register('follow', function (msg) {
  msg.command = 'follow';
  msg.source = 'follow';
  return this.m(msg.data.followee, msg);
}, {});

flx.register('followers', function (msg) {
  msg.command = 'getFollowers';
  msg.source = 'followers';
  return this.m(msg.data.user, msg);
}, {});

web.listen();
