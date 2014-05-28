const host = "";
const grumplines = [
	"Have a bad day ? grump it here !",
	"Cold coffee ? grump it here !",
	"Raining ? grump it here !",
	"Suffocatingly hot ? grump it here !",
	"Freezing cold ? grump it here !",
	"Hangover ? grump it here !",
	"No more beer ? grump it here !",
	"It's " + dayOfWeek() + ", grump it here !",
	"It's " + dayOfWeek() + ", grump it here !",
	"It's " + dayOfWeek() + ", grump it here !",
	"It's " + dayOfWeek() + ", grump it here !",
	"It's " + dayOfWeek() + ", grump it here !",
	"It's " + dayOfWeek() + ", grump it here !",
	"It's " + dayOfWeek() + ", grump it here !",
]

function dayOfWeek(n) {
	return ([
		"Sunday",
		"Monday",
		"Tuesday",
		"Wednesday",
		"Thursday",
		"Friday",
		"Saturday",
	])[n || (new Date).getDay()];
}

// API

function register(room, cb) {
	$.get(endpoints.register(host, room), '', cb);
}

function follow(room, followee, cb) {
	$.get(endpoints.follow(host, room, followee), '', cb);
}

function post(room, msg, cb) {
	$.get(endpoints.post(host, room, msg), '', cb);
}

function read(room, cb) {
	$.get(endpoints.read(host, room), '', cb);
}

function followers(room, cb) {
	$.get(endpoints.followers(host, room), '', cb);
}

$(function() {

	var body = $('#body');
	var tplt = $('#tplt');
	var room;

	var header = $('.banner');
	header.click(function() {
		if (header.hasClass("open"))
			header.removeClass("open");
		else
			header.addClass("open");
	})

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
		room = body.find('.room .name').val();

		if(room !== '')
			disable(body.find('.room'));

			register(room, function(res) {
				var roomElt = clone('.room.in');
				roomElt.find('.name').html(room);
				body.find('.room').replaceWith(roomElt);

				body.find('.room button').click(logout);

				var follow = clone('.follow');
				follow.submit(followSomeone);
				body.append(follow);

				var post = clone('.post');
				post.submit(postMsg);
				post.find(".text").attr("placeholder", grumplines[Math.floor(Math.random() * (grumplines.length - 1))]);
				body.append(post);

				var timeline = clone('.timeline');
				timeline.find('.refresh').click(refreshMsg);
				body.append(timeline);
				refreshMsg();
			});
		return false;
	}

	function logout() {
		body.find('.room, .follow, .post, .timeline').remove();

		var roomElt = clone('.room.out');
		// body.find('.room').replaceWith(roomElt);
		body.append(roomElt);

		body.find('.room').submit(login);

		return false;
	}

	function followSomeone() {
		var followee = body.find('.follow .text');

		follow(room, followee.val(), function() {
			console.log('followee added');
			refreshMsg();
		});

		followee.val('');

		return false;
	}

	function postMsg() {
		var msg = body.find('.post .text');

		post(room, msg.val(), function() {
			console.log("sent message");
			refreshMsg();
		});

		msg.val('');

		return false;
	}

	function refreshMsg() {
		var list = body.find(".timeline .list");
		disable(list);

		read(room, function(data) {
			var msg = JSON.parse(data);
			list.empty();
			enable(list);
			for (var i = 0; i < msg.data.length; i++) {
				var message = clone('.message');

				message.find('.room').html(msg.data[i].user);
				message.find('.text').html(msg.data[i].message);
				list.prepend(message);
			}
		});
	}

	// body.find('.room').submit(login);
	logout();
});
