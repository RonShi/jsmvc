/**
 * @tag models, home
 * Wraps backend node services.  Enables 
 * [Tibco.Models.Node.static.findAll retrieving],
 * [Tibco.Models.Node.static.update updating],
 * [Tibco.Models.Node.static.destroy destroying], and
 * [Tibco.Models.Node.static.create creating] nodes.
 */
$.Model.extend('Tibco.Models.Node',
/* @Static */
{
	/**
 	 * Retrieves nodes data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped node objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/node',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//tibco/fixtures/nodes.json.get" //calculates the fixture path from the url and type.
		});
	},
	/**
	 * Updates a node's data.
	 * @param {String} id A unique id representing your node.
	 * @param {Object} attrs Data to update your node with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/nodes/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a node's data.
 	 * @param {String} id A unique id representing your node.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/nodes/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a node.
	 * @param {Object} attrs A node's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/nodes',
			type: 'post',
			dataType: 'json',
			success: success,
			error: error,
			data: attrs,
			fixture: "-restCreate" //uses $.fixture.restCreate for response.
		});
	}
},
/* @Prototype */
{});