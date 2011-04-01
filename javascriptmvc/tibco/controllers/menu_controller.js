/**
 * @tag controllers, home
 * Displays a table of menus.	 Lets the user 
 * ["Tibco.Controllers.Menu.prototype.form submit" create], 
 * ["Tibco.Controllers.Menu.prototype.&#46;edit click" edit],
 * or ["Tibco.Controllers.Menu.prototype.&#46;destroy click" destroy] menus.
 */
$.Controller.extend('Tibco.Controllers.Menu',
/* @Static */
{
	onDocument: true,
	pluginName: "menu"
},
/* @Prototype */
{
 /**
 * When the page loads, gets all menus to be displayed.
 */
 load: function(){
    logTime.menu.start = t('init menu start');
	if(!$("#menu").length){
	  var me = this;
	  $(document.body).append($('<div/>').attr('id','menu'));
	  $("#menu").html(this.view('init')).ready(function(){
	    me.initMenu();
	  });
//    Tibco.Models.Menu.findAll({}, this.callback('list'));
 	}
 },
 initMenu: function(){
   ddsmoothmenu.init({
     mainmenuid: "navBar", //menu DIV id
     orientation: 'h', //Horizontal or vertical menu: Set to "h" or "v"
     classname: 'ddsmoothmenu', //class added to menu's outer DIV
     contentsource: "markup" //"markup" or ["container_id", "path_to_menu_file"]
   });
   logTime.menu.end = t('init menu end');
 },
 /**
 * Displays a list of menus and the submit form.
 * @param {Array} menus An array of Tibco.Models.Menu objects.
 */
 list: function( menus ){
	$('#menu').html(this.view('init', {menus:menus} ));
 },
 "ul li a.item click" : function(el, ev){
   $("#menu").find('.preselected').removeClass('preselected');
   if (el.parents()[2].tagName.toLowerCase() == 'li'){
     el.parents().eq(1).prev().addClass('preselected');
   }else{
     el.addClass('preselected');
   }
   
   ev.preventDefault();
   var pluginId = el.attr('href').split('#')[1];
   var event = {
       obj: this,
       id: pluginId
   };
   if (logTime.master.start == undefined){
     logTime.master.start = t('init master start');
   }
   if (pluginId == 'application'){   
     if (logTime.application.start == undefined){
       logTime.application.start = t('init application start');
     }else{
       logTime.applicationRefresh.start = t('init application refresh start');
     }
   }
   require(
       [
        "order!models/master.js", "order!controllers/master_controller.js",
        "order!models/"+ pluginId +".js", "order!controllers/"+ pluginId +"_controller.js"
       ],
     function() {
         if (logTime.master.end == undefined){
           logTime.master.end = t('init master end');
         }
         
       OpenAjax.hub.publish("welcome_page.destroyed", event);
       OpenAjax.hub.publish("master.init", event);
     }
   );
 }
});