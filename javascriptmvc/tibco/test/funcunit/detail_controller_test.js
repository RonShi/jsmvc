/*global module: true, ok: true, equals: true, S: true, test: true */
module("detail", {
	setup: function () {
		// open the page
		S.open("//tibco/tibco.html");

		//make sure there's at least one detail on the page before running a test
		S('.detail').exists();
	},
	//a helper function that creates a detail
	create: function () {
		S("[name=name]").type("Ice");
		S("[name=description]").type("Cold Water");
		S("[type=submit]").click();
		S('.detail:nth-child(2)').exists();
	}
});

test("details present", function () {
	ok(S('.detail').size() >= 1, "There is at least one detail");
});

test("create details", function () {

	this.create();

	S(function () {
		ok(S('.detail:nth-child(2) td:first').text().match(/Ice/), "Typed Ice");
	});
});

test("edit details", function () {

	this.create();

	S('.detail:nth-child(2) a.edit').click();
	S(".detail input[name=name]").type(" Water");
	S(".detail input[name=description]").type("\b\b\b\b\bTap Water");
	S(".update").click();
	S('.detail:nth-child(2) .edit').exists(function () {

		ok(S('.detail:nth-child(2) td:first').text().match(/Ice Water/), "Typed Ice Water");

		ok(S('.detail:nth-child(2) td:nth-child(2)').text().match(/Cold Tap Water/), "Typed Cold Tap Water");
	});
});

test("destroy", function () {

	this.create();

	S(".detail:nth-child(2) .destroy").click();

	//makes the next confirmation return true
	S.confirm(true);

	S('.detail:nth-child(2)').missing(function () {
		ok("destroyed");
	});

});