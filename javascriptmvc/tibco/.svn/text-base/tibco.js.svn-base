steal.options.cacheInclude = false;
steal.plugins(	
	'jquery/controller',			// a widget factory
	'jquery/controller/subscribe',	// subscribe to OpenAjax.hub
	'jquery/view/ejs',				// client side templates
	'jquery/controller/view',		// lookup views with the controller's name
	'jquery/model',					// Ajax wrappers
	'jquery/dom/fixture',			// simulated Ajax requests
	'jquery/dom/form_params')		// form data helper
	
	.css(
	    'tibco',
	    'ddsmoothmenu',
	    'resources/amx-theme/jquery-ui-1.8.9.custom'
	)	// loads styles

	.resources(
      'jquery-ui-1.8.9.custom.min',
      'ddsmoothmenu',
      'require', 'x2j'
	)					// 3rd party script's (like jQueryUI), in resources folder
	.models('menu', 
	    'welcome_page'
//	    , 'application', 'master', 'node', 'detail'
	)						// loads files in models folder 

	.controllers('menu', 
	    'welcome_page'
//	    , 'application', 'master', 'node', 'detail'
	)					// loads files in controllers folder

	.views('menu', 
	    'welcome_page'
//	    , 'application', 'master', 'node', 'detail'
	)						// adds views to be added to build
	.then(function(){
	  $('body').dblclick(function(){
	    ct();
	  });
	})
	;
