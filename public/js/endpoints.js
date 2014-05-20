const __api = "/api";

var endpoints = {
  read: function(host, user) {
    return host + __api + '/' + user;
  },

  register: function(host, user) {
    return host + __api + '/register/' + user;
  },

  follow: function(host, user, followee) {
    return host + __api + '/' + user + '/follow/' + followee;
  },

  followers: function(host, user) {
    return host + __api + '/' + user + '/followers';
  },

  post: function(host, user, msg) {
    return host + __api + '/' + user + '/post/' + msg;
  }
};

// Isomorphic Javascript
if (typeof module !== 'undefined') {
  module.exports = {
    read: endpoints.read.bind(undefined, '', ':user'),
    register: endpoints.register.bind(undefined, '', ':user'),
    follow: endpoints.follow.bind(undefined, '', ':user', ':followee'),
    followers: endpoints.followers.bind(undefined, '', ':user'),
    post: endpoints.post.bind(undefined, '', ':user', ':message')
  };
}
