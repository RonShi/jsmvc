/*global module: true, ok: true, equals: true, S: true, test: true */
module("welcome_page", {
	setup: function () {
		// open the page
		S.open("//tibco/index.html");

		//make sure there's at least one welcome_page on the page before running a test
		S('#welcome_page').exists();
	}
});

test("welcome_pages present", function () {
	ok(S('#welcome_page').size() >= 1, "There is at least one welcome_page");
	ok(S('#welcome_page').text().trim() == 'Welcome to JavaScriptMVC world.', "The string is correct.");
});

