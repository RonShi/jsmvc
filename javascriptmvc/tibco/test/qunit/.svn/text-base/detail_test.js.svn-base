module("Model: Tibco.Models.Detail")

test("findAll", function(){
	stop(2000);
	Tibco.Models.Detail.findAll({}, function(details){
		start()
		ok(details)
        ok(details.length)
        ok(details[0].name)
        ok(details[0].description)
	});
	
})

test("create", function(){
	stop(2000);
	new Tibco.Models.Detail({name: "dry cleaning", description: "take to street corner"}).save(function(detail){
		start();
		ok(detail);
        ok(detail.id);
        equals(detail.name,"dry cleaning")
        detail.destroy()
	})
})
test("update" , function(){
	stop();
	new Tibco.Models.Detail({name: "cook dinner", description: "chicken"}).
            save(function(detail){
            	equals(detail.description,"chicken");
        		detail.update({description: "steak"},function(detail){
        			start()
        			equals(detail.description,"steak");
        			detail.destroy();
        		})
            })

});
test("destroy", function(){
	stop(2000);
	new Tibco.Models.Detail({name: "mow grass", description: "use riding mower"}).
            destroy(function(detail){
            	start();
            	ok( true ,"Destroy called" )
            })
})