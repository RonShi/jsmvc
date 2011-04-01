/*global module: true, ok: true, equals: true, S: true, test: true */
module("application", {
	setup: function () {
		// open the page
		S.open("//tibco/tibco.html");

		//make sure there's at least one application on the page before running a test
		S('.application').exists();
	},
	//a helper function that creates a application
	create: function () {
		S("[name=name]").type("Ice");
		S("[name=description]").type("Cold Water");
		S("[type=submit]").click();
		S('.application:nth-child(2)').exists();
	}
});

test("applications present", function () {
	ok(S('.application').size() >= 1, "There is at least one application");
});

test("create applications", function () {

	this.create();

	S(function () {
		ok(S('.application:nth-child(2) td:first').text().match(/Ice/), "Typed Ice");
	});
});

test("edit applications", function () {

	this.create();

	S('.application:nth-child(2) a.edit').click();
	S(".application input[name=name]").type(" Water");
	S(".application input[name=description]").type("\b\b\b\b\bTap Water");
	S(".update").click();
	S('.application:nth-child(2) .edit').exists(function () {

		ok(S('.application:nth-child(2) td:first').text().match(/Ice Water/), "Typed Ice Water");

		ok(S('.application:nth-child(2) td:nth-child(2)').text().match(/Cold Tap Water/), "Typed Cold Tap Water");
	});
});

test("destroy", function () {

	this.create();

	S(".application:nth-child(2) .destroy").click();

	//makes the next confirmation return true
	S.confirm(true);

	S('.application:nth-child(2)').missing(function () {
		ok("destroyed");
	});

});