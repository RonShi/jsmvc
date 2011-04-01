/**
 * @tag models, home
 * Wraps backend welcome_page services.  Enables 
 * [Tibco.Models.WelcomePage.static.findAll retrieving],
 * [Tibco.Models.WelcomePage.static.update updating],
 * [Tibco.Models.WelcomePage.static.destroy destroying], and
 * [Tibco.Models.WelcomePage.static.create creating] welcome_pages.
 */
$.Model.extend('Tibco.Models.WelcomePage',
/* @Static */
{
	/**
 	 * Retrieves welcome_pages data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped welcome_page objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/welcome_page',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//tibco/fixtures/welcome_pages.json.get" //calculates the fixture path from the url and type.
		});
	},
	/**
	 * Updates a welcome_page's data.
	 * @param {String} id A unique id representing your welcome_page.
	 * @param {Object} attrs Data to update your welcome_page with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/welcome_pages/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a welcome_page's data.
 	 * @param {String} id A unique id representing your welcome_page.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/welcome_pages/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a welcome_page.
	 * @param {Object} attrs A welcome_page's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/welcome_pages',
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