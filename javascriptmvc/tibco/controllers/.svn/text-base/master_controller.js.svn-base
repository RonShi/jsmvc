/**
 * @tag controllers, home
 * Displays a table of masters.	 Lets the user 
 * ["Tibco.Controllers.Master.prototype.form submit" create], 
 * ["Tibco.Controllers.Master.prototype.&#46;edit click" edit],
 * or ["Tibco.Controllers.Master.prototype.&#46;destroy click" destroy] masters.
 */
$.Controller.extend('Tibco.Controllers.Master',
/* @Static */
{
	onDocument: true
},
/* @Prototype */
{
 /**
 * When the page loads, gets all masters to be displayed.
 */
 load: function(){
	if(!$("#master").length){
	 $(document.body).append($('<div/>').attr('id', 'mainWrapper').append($('<div/>').attr('id','master')));
 	}
  if (typeof Tibco.Controllers.Detail == 'function'){
    OpenAjax.hub.publish('detail.destroyed');
    OpenAjax.hub.publish("detail.init");
  }
 },
 "master.init subscribe": function(called, event){
   this.load();
   var id = event.id.toLowerCase();
   this.targetPluginId = id;
   var subject = id + ".init";
   var event = {
       obj: this,
       targetPluginId: id,
       parentDomId: 'master'
   };
   OpenAjax.hub.publish(subject, event);
 },
  "table.dataTable tbody tr click": function(el, ev){
    el.parent().find('.selected').removeClass('selected');
    el.addClass('selected');
    var event = {
      obj: this,
      targetPluginId: this.targetPluginId,
      eventData: {
        id: 1,
        name: el.find('td').eq(0).text()
      }
    };
    var subject = "master.row.selected";
    require(
        [
         "order!models/detail.js", "order!controllers/detail_controller.js"
        ],
      function() {
        OpenAjax.hub.publish(subject, event);
      }
    );
  },
  "div.actionBar button mouseover": function(el, ev){
    el.addClass('strong');
  },
  "div.actionBar button mouseout": function(el, ev){
    el.removeClass('strong');
  },
  "div.actionBar button click": function(el, ev){
    alert(el.text());
  },
 /**
 *	 Listens for masters being destroyed and removes them from being displayed.
 */
"master.destroyed subscribe": function(called, master){
  $("#master").remove();
 }
});