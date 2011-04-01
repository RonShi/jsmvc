/**
 * @tag controllers, home
 * Displays a table of details.	 Lets the user 
 * ["Tibco.Controllers.Detail.prototype.form submit" create], 
 * ["Tibco.Controllers.Detail.prototype.&#46;edit click" edit],
 * or ["Tibco.Controllers.Detail.prototype.&#46;destroy click" destroy] details.
 */
$.Controller.extend('Tibco.Controllers.Detail',
/* @Static */
{
	onDocument: true
},
/* @Prototype */
{
  init: function(){
    this.tabIndex = 0;
    this.tabLinkIndex = 0;
  },
  "detail.init subscribe": function(){
    this.init();
  },
 /**
 * When the page loads, gets all details to be displayed.
 */
 load: function(){
	if(!$("#detail").length){
	 $("#master").after($('<div/>').attr('id','detail'));
 	}
 },
 /**
 * Displays a list of details and the submit form.
 * @param {Array} details An array of Tibco.Models.Detail objects.
 */
 list: function( details ){
	$('#detail').html(this.view('init', {details:details} ));
	
	var tabActiveIndex = this.tabIndex ? this.tabIndex : 0;
	
	$('#detail div.tabButtons button').each(function(i){
    if (i == tabActiveIndex){
      var tab = $(this).addClass('tabActived').attr('target');
      $('#'+ tab).show();
    }else{
      var tab = $(this).removeClass('tabActived').attr('target');
      $('#' + tab).hide();
    }
  });


	var tabLinkActiveIndex = this.tabLinkIndex ? this.tabLinkIndex : 0;
	$('#detail div.tabLinks span').each(function(i){
	  if (i == tabLinkActiveIndex){
      var tab = $(this).addClass('actived').attr('target');
      $('#'+ tab).show();
    }else{
      var tab = $(this).removeClass('actived').attr('target');
      $('#' + tab).hide();
    }
  });
 },
 "master.row.selected subscribe": function(called, event){
   var targetPluginId = event.targetPluginId;
   var pluginId = '';
   var data = {
       name: event.eventData.name
   };
   this.load();
   this.list(data);
 },
 tab : function(tabButtons){
   return $('#'+tabButtons.attr("target"));
 },
 "#detailTabs div.tabButtons button click" : function(el, ev){
   this.tabIndex = el.index();
   ev.preventDefault();
   this.tab(this.find('.tabActived').removeClass('tabActived')).hide();
   this.tab(el.addClass('tabActived')).show();
 },
 "#configurationTabContent div.tabLinks span click" : function(el, ev){
   this.tabLinkIndex = el.index();
   ev.preventDefault();
   this.tab(this.find('.actived').removeClass('actived')).hide();
   this.tab(el.addClass('actived')).show();
 },
 /**
 * Responds to the create form being submitted by creating a new Tibco.Models.Detail.
 * @param {jQuery} el A jQuery wrapped element.
 * @param {Event} ev A jQuery event whose default action is prevented.
 */
'form submit': function( el, ev ){
	ev.preventDefault();
	new Tibco.Models.Detail(el.formParams()).save();
},
/**
 * Listens for details being created.	 When a detail is created, displays the new detail.
 * @param {String} called The open ajax event that was called.
 * @param {Event} detail The new detail.
 */
'detail.created subscribe': function( called, detail ){
	$("#detail tbody").append( this.view("list", {details:[detail]}) );
	$("#detail form input[type!=submit]").val(""); //clear old vals
},
 /**
 * Creates and places the edit interface.
 * @param {jQuery} el The detail's edit link element.
 */
'.edit click': function( el ){
	var detail = el.closest('.detail').model();
	detail.elements().html(this.view('edit', detail));
},
 /**
 * Removes the edit interface.
 * @param {jQuery} el The detail's cancel link element.
 */
'.cancel click': function( el ){
	this.show(el.closest('.detail').model());
},
 /**
 * Updates the detail from the edit values.
 */
'.update click': function( el ){
	var $detail = el.closest('.detail'); 
	$detail.model().update($detail.formParams());
},
 /**
 * Listens for updated details.	 When a detail is updated, 
 * update's its display.
 */
'detail.updated subscribe': function( called, detail ){
	this.show(detail);
},
 /**
 * Shows a detail's information.
 */
show: function( detail ){
	detail.elements().html(this.view('show',detail));
},
 /**
 *	 Handle's clicking on a detail's destroy link.
 */
'.destroy click': function( el ){
	if(confirm("Are you sure you want to destroy?")){
		el.closest('.detail').model().destroy();
	}
 },
 /**
 *	 Listens for details being destroyed and removes them from being displayed.
 */
"detail.destroyed subscribe": function(called, detail){
	$('#detail').remove();	 //removes ALL elements
 }
});