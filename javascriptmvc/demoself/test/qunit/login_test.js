module("Model: Demoself.models.Login")
debugger;
test("findAll", function(){
	stop(2000);
	Demoself.models.Login.findAll({}, function(logins){
		start()
		ok(logins)
        ok(logins.length)
        ok(logins[0].name)
        ok(logins[0].description)
	});
	
	
})

test("create", function(){
	stop(2000);
	new Demoself.models.Login({name: "dry cleaning", description: "take to street corner"}).save(function(login){
		start();
		ok(login);
        ok(login.id);
        equals(login.name,"dry cleaning")
        login.destroy()
	})
})
test("update" , function(){
	stop();
	new Demoself.models.Login({name: "cook dinner", description: "chicken"}).
            save(function(login){
            	equals(login.description,"chicken");
        		login.update({description: "steak"},function(login){
        			start()
        			equals(login.description,"steak");
        			login.destroy();
        		})
            })

});
test("destroy", function(){
	stop(2000);
	new Demoself.models.Login({name: "mow grass", description: "use riding mower"}).
            destroy(function(login){
            	start();
            	ok( true ,"Destroy called" )
            })
})