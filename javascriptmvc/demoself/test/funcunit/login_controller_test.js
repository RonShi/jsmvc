/*global module: true, ok: true, equals: true, S: true, test: true */
module("login", {
	setup: function () {
		// open the page
		S.open("//demoself/demoself.html");
		//make sure there's at least one login on the page before running a test
		S('.login').exists();
	},
	//a helper function that creates a login
	create: function () {
		S("[name=name]").type("Ice");
		S("[name=description]").type("Cold Water");
		S("[type=submit]").click();
		S('.login:nth-child(2)').exists();
	}
});
debugger;
test("logins present", function () {
	ok(S('.login').size() >= 1, "There is at least one login");
});

test("create logins", function () {

	this.create();

	S(function () {
		ok(S('.login:nth-child(2) td:first').text().match(/Ice/), "Typed Ice");
	});
});

test("edit logins", function () {

	this.create();

	S('.login:nth-child(2) a.edit').click();
	S(".login input[name=name]").type(" Water");
	S(".login input[name=description]").type("\b\b\b\b\bTap Water");
	S(".update").click();
	S('.login:nth-child(2) .edit').exists(function () {

		ok(S('.login:nth-child(2) td:first').text().match(/Ice Water/), "Typed Ice Water");

		ok(S('.login:nth-child(2) td:nth-child(2)').text().match(/Cold Tap Water/), "Typed Cold Tap Water");
	});
});

test("destroy", function () {

	this.create();

	S(".login:nth-child(2) .destroy").click();

	//makes the next confirmation return true
	S.confirm(true);

	S('.login:nth-child(2)').missing(function () {
		ok("destroyed");
	});

});