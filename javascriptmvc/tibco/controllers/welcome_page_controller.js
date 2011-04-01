/**
 * @tag controllers, home
 * Displays a table of welcome_pages.	 Lets the user 
 * ["Tibco.Controllers.WelcomePage.prototype.form submit" create], 
 * ["Tibco.Controllers.WelcomePage.prototype.&#46;edit click" edit],
 * or ["Tibco.Controllers.WelcomePage.prototype.&#46;destroy click" destroy] welcome_pages.
 */
$.Controller.extend('Tibco.Controllers.WelcomePage',
/* @Static */
{
	onDocument: true
},
/* @Prototype */
{
 /**
 * When the page loads, gets all welcome_pages to be displayed.
 */
 load: function(){
	if(!$("#welcome_page").length){
	 $(document.body).append($('<div/>').attr('id','welcome_page'));
	 Tibco.Models.WelcomePage.findAll({}, this.callback('list'));
 	}
 },
 /**
 * Displays a list of welcome_pages and the submit form.
 * @param {Array} welcome_pages An array of Tibco.Models.WelcomePage objects.
 */
 list: function( welcome_pages ){
	$('#welcome_page').html(this.view('init', {welcome_pages:welcome_pages} ));
	logTime.initPage.end = t('init page end');
 },
 "welcome_page.init subscribe": function(called, welcome_page){
   OpenAjax.hub.publish("master.destroyed");
   this.load();
 },
 /**
 *	 Listens for welcome_pages being destroyed and removes them from being displayed.
 */
"welcome_page.destroyed subscribe": function(called, welcome_page){
	$('#welcome_page').remove();	 //removes ALL elements
 }
});