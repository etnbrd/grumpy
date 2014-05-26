const host = "";

// API

function register(user, cb) {
	$.get(endpoints.register(host, user), '', cb);
}

function follow(user, followee, cb) {
	$.get(endpoints.follow(host, user, followee), '', cb);
}

function post(user, msg, cb) {
	$.get(endpoints.post(host, user, msg), '', cb);
}

function read(user, cb) {
	$.get(endpoints.read(host, user), '', cb);
}

function followers(user, cb) {
	$.get(endpoints.followers(host, user), '', cb);
}

$(function() {

	var body = $('#body');
	var tplt = $('#tplt');
	var user;

	// HELPERS

	function clone(name) {
		return tplt.find(name).clone();
	}

	function disable(elt) {
		elt.attr('disabled','disabled');
	}

	function enable(elt) {
		elt.removeAttr('disabled');
	}

	// UI

	function login() {


		user = body.find('.user .name').val();

		if(user !== '')

			console.log("login " + user);

			disable(body.find('.user'));

			register(user, function(res) {
				var userElt = clone('.user.in');
				userElt.find('.name').html(user);
				body.find('.user').replaceWith(userElt);

				body.find('.user button').click(logout);

				var follow = clone('.follow');
				follow.submit(followSomeone);
				body.append(follow);

				var post = clone('.post');
				post.submit(postMsg);
				body.append(post);

				var timeline = clone('.timeline');
				timeline.find('.refresh').click(refreshMsg);
				body.append(timeline);
				refreshMsg();
			});
		return false;
	}

	function logout() {
		console.log('logging out');

		body.find('.follow, .post, .timeline').remove();

		var userElt = clone('.user.out');
		body.find('.user').replaceWith(userElt);

		body.find('.user').submit(login);

		return false;
	}

	function followSomeone() {
		var followee = body.find('.follow .text');

		follow(user, followee.val(), function() {
			console.log('followee added');
			refreshMsg();
		});

		followee.val('');

		return false;
	}

	function postMsg() {
		var msg = body.find('.post .text');

		post(user, msg.val(), function() {
			console.log("sent message");
			refreshMsg();
		});

		msg.val('');

		return false;
	}

	function refreshMsg() {
		var list = body.find(".timeline .list");
		disable(list);
		read(user, function(data) {
			var msg = JSON.parse(data);
			list.empty();
			enable(list);
			for (var i = 0; i < msg.data.length; i++) {
				console.log(msg.data[i]);
				var message = clone('.message');
				message.find('.user').html(msg.data[i].user);
				message.find('.text').html(msg.data[i].message);
				list.prepend(message);
			}
		});
	}

	body.find('.user').submit(login);
});
