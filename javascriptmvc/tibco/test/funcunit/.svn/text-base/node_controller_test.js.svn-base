/*global module: true, ok: true, equals: true, S: true, test: true */
module("node", {
	setup: function () {
		// open the page
		S.open("//tibco/tibco.html");

		//make sure there's at least one node on the page before running a test
		S('.node').exists();
	},
	//a helper function that creates a node
	create: function () {
		S("[name=name]").type("Ice");
		S("[name=description]").type("Cold Water");
		S("[type=submit]").click();
		S('.node:nth-child(2)').exists();
	}
});

test("nodes present", function () {
	ok(S('.node').size() >= 1, "There is at least one node");
});

test("create nodes", function () {

	this.create();

	S(function () {
		ok(S('.node:nth-child(2) td:first').text().match(/Ice/), "Typed Ice");
	});
});

test("edit nodes", function () {

	this.create();

	S('.node:nth-child(2) a.edit').click();
	S(".node input[name=name]").type(" Water");
	S(".node input[name=description]").type("\b\b\b\b\bTap Water");
	S(".update").click();
	S('.node:nth-child(2) .edit').exists(function () {

		ok(S('.node:nth-child(2) td:first').text().match(/Ice Water/), "Typed Ice Water");

		ok(S('.node:nth-child(2) td:nth-child(2)').text().match(/Cold Tap Water/), "Typed Cold Tap Water");
	});
});

test("destroy", function () {

	this.create();

	S(".node:nth-child(2) .destroy").click();

	//makes the next confirmation return true
	S.confirm(true);

	S('.node:nth-child(2)').missing(function () {
		ok("destroyed");
	});

});