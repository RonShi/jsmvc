/**
 * @tag models, home
 * Wraps backend menu services.  Enables 
 * [Tibco.Models.Menu.static.findAll retrieving],
 * [Tibco.Models.Menu.static.update updating],
 * [Tibco.Models.Menu.static.destroy destroying], and
 * [Tibco.Models.Menu.static.create creating] menus.
 */
$.Model.extend('Tibco.Models.Menu',
/* @Static */
{
	/**
 	 * Retrieves menus data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped menu objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/menu',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//tibco/fixtures/menus.json.get" //calculates the fixture path from the url and type.
		});
	}
},
/* @Prototype */
{});