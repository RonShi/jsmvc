/**
 * @tag controllers, home
 * Displays a table of nodes.	 Lets the user 
 * ["Tibco.Controllers.Node.prototype.form submit" create], 
 * ["Tibco.Controllers.Node.prototype.&#46;edit click" edit],
 * or ["Tibco.Controllers.Node.prototype.&#46;destroy click" destroy] nodes.
 */
$.Controller.extend('Tibco.Controllers.Node',
/* @Static */
{
	onDocument: true
},
/* @Prototype */
{
 /**
 * When the page loads, gets all nodes to be displayed.
 */
 'node.init subscribe' : function(called, event) {
   this.parentDomId = event.parentDomId;
//   Cookbook.Models.Recipe.findAll({}, this.callback('list'));
   this.list();
 },
 /**
 * Displays a list of nodes and the submit form.
 * @param {Array} nodes An array of Tibco.Models.Node objects.
 */
 list: function( nodes ){
	$('#' + this.parentDomId).html(this.view('init', {nodes:nodes} ));
	//this.initEvent();
 },
// initEvent: function(){
//   var dom = $('#' + this.parentDomId);
//   dom.find("table.dataTable tbody tr").click(function(){
//     $(this).parent().find('.selected').removeClass('selected');
//     $(this).addClass('selected');
//     var event = {
//       obj: this,
//       targetPluginId: "node",
//       eventData: {
//         id: 1,
//         name: $(this).find('td').eq(0).text()
//       }
//     };
//     var subject = "master.row.selected";
//     require(
//         [
//          "order!models/detail.js", "order!controllers/detail_controller.js"
//         ],
//       function() {
//         OpenAjax.hub.publish(subject, event);
//       }
//     );
//   });
//   dom.find('div.actionBar button').hover(function(){
//     $(this).addClass('strong');
//   }, function(){
//     $(this).removeClass('strong');
//   })
//   .click(function(){
//     alert($(this).text());
//   });
// },
// "table.dataTable tbody tr click": function(el, ev){
//   ev.preventDefault();
//   this.find('.selected').removeClass('selected');
//   el.addClass('selected');
// },
// "div.actionBar button mouseover": function(el, ev){
//   el.addClass('strong');
// },
// "div.actionBar button mouseout": function(el, ev){
//   el.removeClass('strong');
// },
// "div.actionBar button click": function(el, ev){
//   alert(el.text());
// },
 /**
 *	 Listens for nodes being destroyed and removes them from being displayed.
 */
 "node.destroyed subscribe": function(called, node){
   node.elements().remove();	 //removes ALL elements
 }
});