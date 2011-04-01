module("Model: Tibco.Models.Application")

test("findAll", function(){
	stop(2000);
	Tibco.Models.Application.findAll({}, function(applications){
		start()
		ok(applications)
        ok(applications.length)
        ok(applications[0].name)
        ok(applications[0].description)
	});
	
})

test("create", function(){
	stop(2000);
	new Tibco.Models.Application({name: "dry cleaning", description: "take to street corner"}).save(function(application){
		start();
		ok(application);
        ok(application.id);
        equals(application.name,"dry cleaning")
        application.destroy()
	})
})
test("update" , function(){
	stop();
	new Tibco.Models.Application({name: "cook dinner", description: "chicken"}).
            save(function(application){
            	equals(application.description,"chicken");
        		application.update({description: "steak"},function(application){
        			start()
        			equals(application.description,"steak");
        			application.destroy();
        		})
            })

});
test("destroy", function(){
	stop(2000);
	new Tibco.Models.Application({name: "mow grass", description: "use riding mower"}).
            destroy(function(application){
            	start();
            	ok( true ,"Destroy called" )
            })
})