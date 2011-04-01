module("Model: Tibco.Models.Master")

test("findAll", function(){
	stop(2000);
	Tibco.Models.Master.findAll({}, function(masters){
		start()
		ok(masters)
        ok(masters.length)
        ok(masters[0].name)
        ok(masters[0].description)
	});
	
})

test("create", function(){
	stop(2000);
	new Tibco.Models.Master({name: "dry cleaning", description: "take to street corner"}).save(function(master){
		start();
		ok(master);
        ok(master.id);
        equals(master.name,"dry cleaning")
        master.destroy()
	})
})
test("update" , function(){
	stop();
	new Tibco.Models.Master({name: "cook dinner", description: "chicken"}).
            save(function(master){
            	equals(master.description,"chicken");
        		master.update({description: "steak"},function(master){
        			start()
        			equals(master.description,"steak");
        			master.destroy();
        		})
            })

});
test("destroy", function(){
	stop(2000);
	new Tibco.Models.Master({name: "mow grass", description: "use riding mower"}).
            destroy(function(master){
            	start();
            	ok( true ,"Destroy called" )
            })
})