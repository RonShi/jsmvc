/**
 * @tag models, home
 * Wraps backend detail services.  Enables 
 * [Tibco.Models.Detail.static.findAll retrieving],
 * [Tibco.Models.Detail.static.update updating],
 * [Tibco.Models.Detail.static.destroy destroying], and
 * [Tibco.Models.Detail.static.create creating] details.
 */
$.Model.extend('Tibco.Models.Detail',
/* @Static */
{
	/**
 	 * Retrieves details data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped detail objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/detail',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//tibco/fixtures/details.json.get" //calculates the fixture path from the url and type.
		});
	},
	/**
	 * Updates a detail's data.
	 * @param {String} id A unique id representing your detail.
	 * @param {Object} attrs Data to update your detail with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/details/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a detail's data.
 	 * @param {String} id A unique id representing your detail.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/details/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a detail.
	 * @param {Object} attrs A detail's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/details',
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