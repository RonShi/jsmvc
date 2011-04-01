/**
 * @tag models, home
 * Wraps backend application services.  Enables 
 * [Tibco.Models.Application.static.findAll retrieving],
 * [Tibco.Models.Application.static.update updating],
 * [Tibco.Models.Application.static.destroy destroying], and
 * [Tibco.Models.Application.static.create creating] applications.
 */
$.Model.extend('Tibco.Models.Application',
/* @Static */
{
	/**
 	 * Retrieves applications data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped application objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/amxadministrator/services/ApplicationService',
			type: 'post',
			dataType: 'xml',
			contentType:"text/xml",
			data: params,
			success: this.callback(success),
			error: error
//			fixture: "//tibco/fixtures/applications.json.get" //calculates the fixture path from the url and type.
		});
	},
	/**
	 * Updates a application's data.
	 * @param {String} id A unique id representing your application.
	 * @param {Object} attrs Data to update your application with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/applications/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a application's data.
 	 * @param {String} id A unique id representing your application.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/applications/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a application.
	 * @param {Object} attrs A application's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/applications',
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