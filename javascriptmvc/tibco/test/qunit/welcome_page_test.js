module("Model: Tibco.Models.WelcomePage")

test("findAll", function(){
	stop(2000);
	Tibco.Models.WelcomePage.findAll({}, function(welcome_pages){
		start()
		ok(welcome_pages)
    ok(welcome_pages.length)
    ok(welcome_pages[0].title == "Welcome to JavaScriptMVC world.")
	});
	
})
