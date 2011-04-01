/**
 * @tag models, home
 * Wraps backend login services.  Enables 
 * [Demoself.models.Login.static.findAll retrieving],
 * [Demoself.models.Login.static.update updating],
 * [Demoself.models.Login.static.destroy destroying], and
 * [Demoself.models.Login.static.create creating] logins.
 */
$.Model.extend('Demoself.models.Login',
/* @Static */
{
	/**
 	 * Retrieves logins data from your backend services.
 	 * @param {Object} params params that might refine your results.
 	 * @param {Function} success a callback function that returns wrapped login objects.
 	 * @param {Function} error a callback function for an error in the ajax request.
 	 */
	findAll: function( params, success, error ){
		$.ajax({
			url: '/login',
			type: 'get',
			dataType: 'json',
			data: params,
			success: this.callback(['wrapMany',success]),
			error: error,
			fixture: "//demoself/fixtures/logins.json.get" //calculates the fixture path from the url and type.
		});
	},
	/**
	 * Updates a login's data.
	 * @param {String} id A unique id representing your login.
	 * @param {Object} attrs Data to update your login with.
	 * @param {Function} success a callback function that indicates a successful update.
 	 * @param {Function} error a callback that should be called with an object of errors.
     */
	update: function( id, attrs, success, error ){
		$.ajax({
			url: '/logins/'+id,
			type: 'put',
			dataType: 'json',
			data: attrs,
			success: success,
			error: error,
			fixture: "-restUpdate" //uses $.fixture.restUpdate for response.
		});
	},
	/**
 	 * Destroys a login's data.
 	 * @param {String} id A unique id representing your login.
	 * @param {Function} success a callback function that indicates a successful destroy.
 	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	destroy: function( id, success, error ){
		$.ajax({
			url: '/logins/'+id,
			type: 'delete',
			dataType: 'json',
			success: success,
			error: error,
			fixture: "-restDestroy" // uses $.fixture.restDestroy for response.
		});
	},
	/**
	 * Creates a login.
	 * @param {Object} attrs A login's attributes.
	 * @param {Function} success a callback function that indicates a successful create.  The data that comes back must have an ID property.
	 * @param {Function} error a callback that should be called with an object of errors.
	 */
	create: function( attrs, success, error ){
		$.ajax({
			url: '/logins',
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