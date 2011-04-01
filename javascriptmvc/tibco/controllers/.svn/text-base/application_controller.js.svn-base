/**
 * @tag controllers, home
 * Displays a table of applications.	 Lets the user 
 * ["Tibco.Controllers.Application.prototype.form submit" create], 
 * ["Tibco.Controllers.Application.prototype.&#46;edit click" edit],
 * or ["Tibco.Controllers.Application.prototype.&#46;destroy click" destroy] applications.
 */
$.Controller.extend('Tibco.Controllers.Application',
/* @Static */
{
	onDocument: true
},
/* @Prototype */
{
 /**
 * When the page loads, gets all applications to be displayed.
 */
  'application.init subscribe' : function(called, event) {
    this.parentDomId = event.parentDomId;
    var postdata = '<?xml version="1.0"?> <SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:jsx2="http://types.core.api.admin.amf.tibco.com/xsd"> <SOAP-ENV:Body><jsx1:getApplicationViewDetails xmlns:jsx1="http://application.amx.api.admin.amf.tibco.com"><jsx1:envId><jsx2:id xmlns:jsx2="http://types.core.api.admin.amf.tibco.com/xsd">2</jsx2:id><jsx2:name xmlns:jsx2="http://types.core.api.admin.amf.tibco.com/xsd"></jsx2:name></jsx1:envId></jsx1:getApplicationViewDetails></SOAP-ENV:Body> </SOAP-ENV:Envelope>';
    Tibco.Models.Application.findAll(postdata, this.callback('list'), this.callback('error_application'));
//    this.list();
  },
 /**
 * Displays a list of applications and the submit form.
 * @param {Array} applications An array of Tibco.Models.Application objects.
 */
 list: function( applications ){
   var json = $.xmlToJSON(applications);
   var data = json.Body[0].getApplicationViewDetailsResponse[0].return[0].appDesc;
   $('#' + this.parentDomId).html(this.view('init', {applications:data} ));
   if(logTime.application.end==undefined){
     logTime.application.end = t('init application end');
   }else{
     logTime.applicationRefresh.end = t('init application refresh end');
   }
//   this.initEvent();
 },
 error_application: function( applications ){
   alert('You should run in live mode and login AMX Server.\nTry to click Infrastructure->Node');
 },
// initEvent: function(){
//   var dom = $('#' + this.parentDomId);
//   dom.find("table.dataTable tbody tr").click(function(){
//     $(this).parent().find('.selected').removeClass('selected');
//     $(this).addClass('selected');
//     var event = {
//       obj: this,
//       targetPluginId: "application",
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
// "table.dataTable tbody tr dbclick": function(el, ev){
//   alert('x');
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
 *	 Listens for applications being destroyed and removes them from being displayed.
 */
"application.destroyed subscribe": function(called, application){
	application.elements().remove();	 //removes ALL elements
 }
});