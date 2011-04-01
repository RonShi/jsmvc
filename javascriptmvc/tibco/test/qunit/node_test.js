module("Model: Tibco.Models.Node")

test("findAll", function(){
	stop(2000);
	Tibco.Models.Node.findAll({}, function(nodes){
		start()
		ok(nodes)
        ok(nodes.length)
        ok(nodes[0].name)
        ok(nodes[0].description)
	});
	
})

test("create", function(){
	stop(2000);
	new Tibco.Models.Node({name: "dry cleaning", description: "take to street corner"}).save(function(node){
		start();
		ok(node);
        ok(node.id);
        equals(node.name,"dry cleaning")
        node.destroy()
	})
})
test("update" , function(){
	stop();
	new Tibco.Models.Node({name: "cook dinner", description: "chicken"}).
            save(function(node){
            	equals(node.description,"chicken");
        		node.update({description: "steak"},function(node){
        			start()
        			equals(node.description,"steak");
        			node.destroy();
        		})
            })

});
test("destroy", function(){
	stop(2000);
	new Tibco.Models.Node({name: "mow grass", description: "use riding mower"}).
            destroy(function(node){
            	start();
            	ok( true ,"Destroy called" )
            })
})