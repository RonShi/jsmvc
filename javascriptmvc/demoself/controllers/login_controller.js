/**
 * @tag controllers, home
 * Displays a table of logins.	 Lets the user 
 * ["Demoself.models.Login.prototype.form submit" create], 
 * ["Demoself.models.Login.prototype.&#46;edit click" edit],
 * or ["Demoself.models.Login.prototype.&#46;destroy click" destroy] logins.
 */
$.Controller.extend('Demoself.Controllers.Login',
/* @Static */
{
	onDocument: true
},
/* @Prototype */
{
 /**
 * When the page loads, gets all logins to be displayed.
 */
 load: function(){
	if(!$("#login").length){
	 $(document.body).append($('<div/>').attr('id','login'));
		 Demoself.models.Login.findAll({}, this.callback('list'));
 	}
 },
 /**
 * Displays a list of logins and the submit form.
 * @param {Array} logins An array of Demoself.models.Login objects.
 */
 list: function( logins ){
	$("#login").html(this.view('init', {logins:logins} ));
 },
 /**
 * Responds to the create form being submitted by creating a new Demoself.models.Login.
 * @param {jQuery} el A jQuery wrapped element.
 * @param {Event} ev A jQuery event whose default action is prevented.
 */
"button click" : function(){
    alert(Demoself.models.Login.attributes);

}
});