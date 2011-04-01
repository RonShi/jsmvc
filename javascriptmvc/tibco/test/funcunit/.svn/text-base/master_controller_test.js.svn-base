/*global module: true, ok: true, equals: true, S: true, test: true */
module("master", {
	setup: function () {
		// open the page
		S.open("//tibco/tibco.html");

		//make sure there's at least one master on the page before running a test
		S('.master').exists();
	},
	//a helper function that creates a master
	create: function () {
		S("[name=name]").type("Ice");
		S("[name=description]").type("Cold Water");
		S("[type=submit]").click();
		S('.master:nth-child(2)').exists();
	}
});

test("masters present", function () {
	ok(S('.master').size() >= 1, "There is at least one master");
});

test("create masters", function () {

	this.create();

	S(function () {
		ok(S('.master:nth-child(2) td:first').text().match(/Ice/), "Typed Ice");
	});
});

test("edit masters", function () {

	this.create();

	S('.master:nth-child(2) a.edit').click();
	S(".master input[name=name]").type(" Water");
	S(".master input[name=description]").type("\b\b\b\b\bTap Water");
	S(".update").click();
	S('.master:nth-child(2) .edit').exists(function () {

		ok(S('.master:nth-child(2) td:first').text().match(/Ice Water/), "Typed Ice Water");

		ok(S('.master:nth-child(2) td:nth-child(2)').text().match(/Cold Tap Water/), "Typed Cold Tap Water");
	});
});

test("destroy", function () {

	this.create();

	S(".master:nth-child(2) .destroy").click();

	//makes the next confirmation return true
	S.confirm(true);

	S('.master:nth-child(2)').missing(function () {
		ok("destroyed");
	});

});