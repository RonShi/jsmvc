/**
 * @tag models, home
 * Wraps backend master services.  Enables 
 * [Tibco.Models.Master.static.findAll retrieving],
 * [Tibco.Models.Master.static.update updating],
 * [Tibco.Models.Master.static.destroy destroying], and
 * [Tibco.Models.Master.static.create creating] masters.
 */
$.Model.extend('Tibco.Models.Master',
/* @Static */
{
	/**
 	 * Retrieves masters data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped master objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/master',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//tibco/fixtures/masters.json.get" //calculates the fixture path from the url and type.
		});
	},
	/**
	 * Updates a master's data.
	 * @param {String} id A unique id representing your master.
	 * @param {Object} attrs Data to update your master with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/masters/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a master's data.
 	 * @param {String} id A unique id representing your master.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/masters/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a master.
	 * @param {Object} attrs A master's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/masters',
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