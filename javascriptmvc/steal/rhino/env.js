/*
 * Envjs core-env.1.2.35
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

Envjs = function(){
    var i,
        name,
        override = function(){
            for(i=0;i<arguments.length;i++){
                for ( name in arguments[i] ) {
                    var g = arguments[i].__lookupGetter__(name),
                        s = arguments[i].__lookupSetter__(name);
                    if ( g || s ) {
                        if ( g ) { Envjs.__defineGetter__(name, g); }
                        if ( s ) { Envjs.__defineSetter__(name, s); }
                    } else {
                        Envjs[name] = arguments[i][name];
                    }
                }
            }
        };
    if(arguments.length === 1 && typeof(arguments[0]) == 'string'){
        window.location = arguments[0];
    }else if (arguments.length === 1 && typeof(arguments[0]) == "object"){
        override(arguments[0]);
    }else if(arguments.length === 2 && typeof(arguments[0]) == 'string'){
        override(arguments[1]);
        window.location = arguments[0];
    }
	if (Envjs.dontPrintUserAgent !== true && Envjs.printedUserAgent !== true) {
		Envjs.printedUserAgent = true;
		console.log('[ %s ]', window.navigator.userAgent);
	}
    return;
},
__this__ = this;

//eg "Mozilla"
Envjs.appCodeName  = "Envjs";

//eg "Gecko/20070309 Firefox/2.0.0.3"
Envjs.appName      = "Netscape";

Envjs.version = "1.6";//?
Envjs.revision = '';
/*
 * Envjs core-env.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}


/**
 * Writes message to system out
 * @param {String} message
 */
Envjs.log = function(message){};

/**
 * Constants providing enumerated levels for logging in modules
 */
Envjs.DEBUG = 1;
Envjs.INFO = 2;
Envjs.WARN = 3;
Envjs.ERROR = 3;
Envjs.NONE = 3;

/**
 * Writes error info out to console
 * @param {Error} e
 */
Envjs.lineSource = function(e){};

    
/**
 * TODO: used in ./event/eventtarget.js
 * @param {Object} event
 */
Envjs.defaultEventBehaviors = {
	'submit': function(event) {
        var target = event.target,
			serialized,
		    method,
		    action;
        while (target && target.nodeName !== 'FORM') {
            target = target.parentNode;
        }
        if (target && target.nodeName === 'FORM') {
            serialized = Envjs.serializeForm(target);
			//console.log('serialized %s', serialized);
		    method = target.method?target.method.toUpperCase():"GET";
			
		    action = Envjs.uri(
		        target.action !== ""?target.action:target.ownerDocument.baseURI,
		        target.ownerDocument.baseURI
		    );
			if(method=='GET' && !action.match(/^file:/)){
				action = action + "?" + serialized;
			}
			//console.log('replacing document with form submission %s', action);
			target.ownerDocument.location.replace(
				action, method, serialized
			);
        }
    },
    
    'click': function(event) {
		//console.log("handling default behavior for click %s", event.target);
        var target = event.target,
			url,
			form,
			inputs;
        while (target && target.nodeName !== 'A' && target.nodeName !== 'INPUT') {
            target = target.parentNode;
        }
        if (target && target.nodeName === 'A') {
			//console.log('target is a link');
            if(target.href && !target.href.match(/^#/)){
			    url = Envjs.uri(target.href, target.ownerDocument.baseURI);
				target.ownerDocument.location.replace(url);
            }
        }else if (target && target.nodeName === 'INPUT') {
            if(target.type.toLowerCase() === 'submit'){
				if(!target.value){
					target.value = 'submit';
				}
				//console.log('submit click %s %s', target.name, target.value);
				form = target.parentNode;
			    while (form && form.nodeName !== 'FORM' ) {
		            form = form.parentNode;
		        }
				if(form && form.nodeName === 'FORM'){
					//disable other submit buttons before serializing
					inputs = form.getElementsByTagName('input');
					for(var i=0;i<inputs.length;i++){
						if(inputs[i].type == 'submit' && inputs[i]!=target){
							//console.log('disabling the non-relevant submit button %s', inputs[i].value);
							inputs[i].disabled = true;
							inputs[i].value = null;
						}
					}
					form.submit();
				}
            }
        }
    }
};

Envjs.exchangeHTMLDocument = function(doc, text, url, frame) {
    var html, head, title, body, 
		event, 
		frame = doc.__ownerFrame__, 
		i;
    try {
        doc.baseURI = url;
        //console.log('parsing document for window exchange %s', url); 
        HTMLParser.parseDocument(text, doc);
        //console.log('finsihed parsing document for window exchange %s', url); 
        Envjs.wait();
        /*console.log('finished wait after parse/exchange %s...( frame ? %s )', 
            doc.baseURI, 
            top.document.baseURI
        );*/
		//if this document is inside a frame make sure to trigger
		//a new load event on the frame
        if(frame){
            event = doc.createEvent('HTMLEvents');
            event.initEvent('load', false, false);
            frame.dispatchEvent( event, false );
        }
    } catch (e) {
        console.log('parsererror %s', e);
        try {
            console.log('document \n %s', doc.documentElement.outerHTML);
        } catch (e) {
            // swallow
        }
        doc = new HTMLDocument(new DOMImplementation(), doc.ownerWindow);
        html =    doc.createElement('html');
        head =    doc.createElement('head');
        title =   doc.createElement('title');
        body =    doc.createElement('body');
        title.appendChild(doc.createTextNode('Error'));
        body.appendChild(doc.createTextNode('' + e));
        head.appendChild(title);
        html.appendChild(head);
        html.appendChild(body);
        doc.appendChild(html);
        //console.log('default error document \n %s', doc.documentElement.outerHTML);

        //DOMContentLoaded event
        if (doc.createEvent) {
            event = doc.createEvent('Event');
            event.initEvent('DOMContentLoaded', false, false);
            doc.dispatchEvent( event, false );

            event = doc.createEvent('HTMLEvents');
            event.initEvent('load', false, false);
            doc.dispatchEvent( event, false );
        }

        //finally fire the window.onload event
        //TODO: this belongs in window.js which is a event
        //      event handler for DOMContentLoaded on document

        try {
            if (doc === window.document) {
                console.log('triggering window.load');
                event = doc.createEvent('HTMLEvents');
                event.initEvent('load', false, false);
                window.dispatchEvent( event, false );
            }
        } catch (e) {
            //console.log('window load event failed %s', e);
            //swallow
        }
    };  /* closes return {... */
};

/**
 * describes which script src values will trigger Envjs to load
 * the script like a browser would
 */
Envjs.scriptTypes = {
	"": false, //anonymous/inline
    "text/javascript"   :false,
    "text/envjs"        :true
};

/**
 * will be called when loading a script throws an error
 * @param {Object} script
 * @param {Object} e
 */
Envjs.onScriptLoadError = function(script, e){
    console.log('error loading script %s %s', script, e);
};

/**
 * load and execute script tag text content
 * @param {Object} script
 */
Envjs.loadInlineScript = function(script){
    if(script.ownerDocument.ownerWindow){	
		//console.log('evaulating inline in script.ownerDocument.ownerWindow %s', 
		//	script.ownerDocument.ownerWindow);
        Envjs.eval(
            script.ownerDocument.ownerWindow,
            script.text,
            'eval('+script.text.substring(0,16)+'...):'+new Date().getTime()
        );
    }else{
		//console.log('evaulating inline in global %s',  __this__);
        Envjs.eval(
            __this__,
            script.text,
            'eval('+script.text.substring(0,16)+'...):'+new Date().getTime()
        );
    }
	if ( Envjs.afterInlineScriptLoad ) {
		Envjs.afterInlineScriptLoad(script)
	}
    //console.log('evaluated at scope %s \n%s',
    //    script.ownerDocument.ownerWindow.guid, script.text);
};

/**
 * Should evaluate script in some context
 * @param {Object} context
 * @param {Object} source
 * @param {Object} name
 */
Envjs.eval = function(context, source, name){};


/**
 * Executes a script tag
 * @param {Object} script
 * @param {Object} parser
 */
Envjs.loadLocalScript = function(script){
    //console.log("loading script type %s \n source %s", script.type, script.src||script.text.substring(0,32));
    var types,
        src,
        i,
        base,
        filename,
        xhr;

    if(script.type){
        types = script.type.split(";");
        for(i=0;i<types.length;i++){
            if(Envjs.scriptTypes[types[i].toLowerCase()]){
                //ok this script type is allowed
                break;
            }
            if(i+1 == types.length){
                //console.log('wont load script type %s', script.type);
                return false;
            }
        }
    }else if(!Envjs.scriptTypes['']){	
        //console.log('wont load anonymous script type ""');
        return false;
    }

    try{
        //console.log('handling inline scripts %s %s', script.src, Envjs.scriptTypes[""] );
        if(!script.src.length ){
			if(Envjs.scriptTypes[""]){
            	Envjs.loadInlineScript(script);
	            return true;
			}else{
				return false;
			}
        }
    }catch(e){
        console.log("Error loading script. %s", e);
        Envjs.onScriptLoadError(script, e);
        return false;
    }


    //console.log("loading allowed external script %s", script.src);

    //lets you register a function to execute
    //before the script is loaded
    if(Envjs.beforeScriptLoad){
        for(src in Envjs.beforeScriptLoad){
            if(script.src.match(src)){
                Envjs.beforeScriptLoad[src](script);
            }
        }
    }
    base = "" + script.ownerDocument.location;
    //filename = Envjs.uri(script.src.match(/([^\?#]*)/)[1], base );
    //console.log('loading script from base %s', base);
    filename = Envjs.uri(script.src, base);
    try {
        xhr = new XMLHttpRequest();
        xhr.open("GET", filename, false/*syncronous*/);
        //console.log("loading external script %s", filename);
        xhr.onreadystatechange = function(){
            //console.log("readyState %s", xhr.readyState);
            if(xhr.readyState === 4){
                Envjs.eval(
                    script.ownerDocument.ownerWindow,
                    xhr.responseText,
                    filename
                );
            }
        };
        xhr.send(null, false);
    } catch(e) {
        console.log("could not load script %s \n %s", filename, e );
        Envjs.onScriptLoadError(script, e);
        return false;
    }
    //lets you register a function to execute
    //after the script is loaded
    if(Envjs.afterScriptLoad){
        for(src in Envjs.afterScriptLoad){
            if(script.src.match(src)){
                Envjs.afterScriptLoad[src](script);
            }
        }
    }
    return true;
};


/**
 * An 'image' was requested by the document.
 *
 * - During inital parse of a <link>
 * - Via an innerHTML parse of a <link>
 * - A modificiation of the 'src' attribute of an Image/HTMLImageElement
 *
 * NOTE: this is optional API.  If this doesn't exist then the default
 * 'loaded' event occurs.
 *
 * @param node {Object} the <img> node
 * @param node the src value
 * @return 'true' to indicate the 'load' succeed, false otherwise
 */
Envjs.loadImage = function(node, src) {
    return true;
};


/**
 * A 'link'  was requested by the document.  Typically this occurs when:
 * - During inital parse of a <link>
 * - Via an innerHTML parse of a <link>
 * - A modificiation of the 'href' attribute on a <link> node in the tree
 *
 * @param node {Object} is the link node in question
 * @param href {String} is the href.
 *
 * Return 'true' to indicate that the 'load' was successful, or false
 * otherwise.  The appropriate event is then triggered.
 *
 * NOTE: this is optional API.  If this doesn't exist then the default
 *   'loaded' event occurs
 */
Envjs.loadLink = function(node, href) {
    return true;
};

(function(){


/*
 *  cookie handling
 *  Private internal helper class used to save/retreive cookies
 */

/**
 * Specifies the location of the cookie file
 */
Envjs.cookieFile = function(){
    return 'file://'+Envjs.homedir+'/.cookies';
};

/**
 * saves cookies to a local file
 * @param {Object} htmldoc
 */
Envjs.saveCookies = function(){
    var cookiejson = JSON.stringify(Envjs.cookies.persistent,null,'\t');
    //console.log('persisting cookies %s', cookiejson);
    Envjs.writeToFile(cookiejson, Envjs.cookieFile());
};

/**
 * loads cookies from a local file
 * @param {Object} htmldoc
 */
Envjs.loadCookies = function(){
    var cookiejson,
        js;
    try{
        cookiejson = Envjs.readFromFile(Envjs.cookieFile())
        js = JSON.parse(cookiejson, null, '\t');
    }catch(e){
        //console.log('failed to load cookies %s', e);
        js = {};
    }
    return js;
};

Envjs.cookies = {
    persistent:{
        //domain - key on domain name {
            //path - key on path {
                //name - key on name {
                     //value : cookie value
                     //other cookie properties
                //}
            //}
        //}
        //expire - provides a timestamp for expiring the cookie
        //cookie - the cookie!
    },
    temporary:{//transient is a reserved word :(
        //like above
    }
};

var __cookies__;

//HTMLDocument cookie
Envjs.setCookie = function(url, cookie){
    var i,
        index,
        name,
        value,
        properties = {},
        attr,
        attrs;
    url = Envjs.urlsplit(url);
    if(cookie)
        attrs = cookie.split(";");
    else
        return;
    
    //for now the strategy is to simply create a json object
    //and post it to a file in the .cookies.js file.  I hate parsing
    //dates so I decided not to implement support for 'expires' 
    //(which is deprecated) and instead focus on the easier 'max-age'
    //(which succeeds 'expires') 
    cookie = {};//keyword properties of the cookie
    cookie['domain'] = url.hostname;
    cookie['path'] = url.path||'/';
    for(i=0;i<attrs.length;i++){
        index = attrs[i].indexOf("=");
        if(index > -1){
            name = __trim__(attrs[i].slice(0,index));
            value = __trim__(attrs[i].slice(index+1));
            if(name.toLowerCase() == 'max-age'){
                //we'll have to when to check these
                //and garbage collect expired cookies
                cookie[name] = parseInt(value, 10);
            } else if( name.toLowerCase() == 'domain' ){
                if(__domainValid__(url, value)){
                    cookie['domain'] = value;
                }
            } else if( name.toLowerCase() == 'path' ){
                //not sure of any special logic for path
                cookie['path'] = value;
            } else {
                //its not a cookie keyword so store it in our array of properties
                //and we'll serialize individually in a moment
                properties[name] = value;
            }
        }else{
            if( attrs[i].toLowerCase() == 'secure' ){
                cookie[attrs[i]] = true;
            }
        }
    }
    if(!('max-age' in cookie)){
        //it's a transient cookie so it only lasts as long as 
        //the window.location remains the same (ie in-memory cookie)
        __mergeCookie__(Envjs.cookies.temporary, cookie, properties);
    }else{
        //the cookie is persistent
        __mergeCookie__(Envjs.cookies.persistent, cookie, properties);
        Envjs.saveCookies();
    }
};

function __domainValid__(url, value){
    var i,
        domainParts = url.hostname.split('.').reverse(),
        newDomainParts = value.split('.').reverse();
    if(newDomainParts.length > 1){
        for(i=0;i<newDomainParts.length;i++){
            if(!(newDomainParts[i] == domainParts[i])){
                return false;
            }
        }
        return true;
    }
    return false;
};

Envjs.getCookies = function(url){
    //The cookies that are returned must belong to the same domain
    //and be at or below the current window.location.path.  Also
    //we must check to see if the cookie was set to 'secure' in which
    //case we must check our current location.protocol to make sure it's
    //https:
    var persisted;
    url = Envjs.urlsplit(url);
    if(!__cookies__){
        try{
            __cookies__ = true;
            try{
                persisted = Envjs.loadCookies();
            }catch(e){
                //fail gracefully
                //console.log('%s', e);
            }   
            if(persisted){
                __extend__(Envjs.cookies.persistent, persisted);
            }
            //console.log('set cookies for doc %s', doc.baseURI);
        }catch(e){
            console.log('cookies not loaded %s', e)
        };
    }
    var temporary = __cookieString__(Envjs.cookies.temporary, url),
        persistent =  __cookieString__(Envjs.cookies.persistent, url);
    //console.log('temporary cookies: %s', temporary);  
    //console.log('persistent cookies: %s', persistent);  
    return  temporary + persistent;
};

function __cookieString__(cookies, url) {
    var cookieString = "",
        domain, 
        path,
        name,
        i=0;
    for (domain in cookies) {
        // check if the cookie is in the current domain (if domain is set)
        // console.log('cookie domain %s', domain);
        if (domain == "" || domain == url.hostname) {
            for (path in cookies[domain]) {
                // console.log('cookie domain path %s', path);
                // make sure path is at or below the window location path
                if (path == "/" || url.path.indexOf(path) > -1) {
                    for (name in cookies[domain][path]) {
                        // console.log('cookie domain path name %s', name);
                        cookieString += 
                            ((i++ > 0)?'; ':'') +
                            name + "=" + 
                            cookies[domain][path][name].value;
                    }
                }
            }
        }
    }
    return cookieString;
};

function __mergeCookie__(target, cookie, properties){
    var name, now;
    if(!target[cookie.domain]){
        target[cookie.domain] = {};
    }
    if(!target[cookie.domain][cookie.path]){
        target[cookie.domain][cookie.path] = {};
    }
    for(name in properties){
        now = new Date().getTime();
        target[cookie.domain][cookie.path][name] = {
            "value":properties[name],
            "secure":cookie.secure,
            "max-age":cookie['max-age'],
            "date-created":now,
            "expiration":(cookie['max-age']===0) ? 
                0 :
                now + cookie['max-age']
        };
        //console.log('cookie is %o',target[cookie.domain][cookie.path][name]);
    }
};

})();//end cookies


Envjs.serializeForm = __formSerialize__;
/**
 * Form Submissions
 *
 * This code is borrow largely from jquery.params and jquery.form.js
 *
 * formToArray() gathers form element data into an array of objects that can
 * be passed to any of the following ajax functions: $.get, $.post, or load.
 * Each object in the array has both a 'name' and 'value' property.  An example of
 * an array for a simple login form might be:
 *
 * [ { name: 'username', value: 'jresig' }, { name: 'password', value: 'secret' } ]
 *
 * It is this array that is passed to pre-submit callback functions provided to the
 * ajaxSubmit() and ajaxForm() methods.
 *
 * The semantic argument can be used to force form serialization in semantic order.
 * This is normally true anyway, unless the form contains input elements of type='image'.
 * If your form must be submitted with name/value pairs in semantic order and your form
 * contains an input of type='image" then pass true for this arg, otherwise pass false
 * (or nothing) to avoid the overhead for this logic.
 *
 *
 * @name formToArray
 * @param semantic true if serialization must maintain strict semantic ordering of elements (slower)
 * @type Array<Object>
 */
function __formToArray__(form, semantic) {
    var array = [],
        elements = semantic ? form.getElementsByTagName('*') : form.elements,
        element,
        i,j,imax, jmax,
        name,
        value;

    if (!elements) {
        return array;
    }

    imax = elements.length;
    for(i=0; i < imax; i++) {
        element = elements[i];
        name = element.name;
        if (!name) {
            continue;
        }
		//console.log('serializing input %s', name);
        if (semantic && form.clk && element.type === "image") {
            // handle image inputs on the fly when semantic == true
            if(!element.disabled && form.clk == element) {
                array.push({
                    name: name+'.x',
                    value: form.clk_x
                },{
                    name: name+'.y',
                    value: form.clk_y
                });
            }
            continue;
        }

        value = __fieldValue__(element, true);
		//console.log('input value is %s', value);
        if (value && value.constructor == Array) {
            jmax = value.length;
            for(j=0; j < jmax; j++){
                array.push({name: name, value: value[j]});
            }
        } else if (value !== null && typeof value != 'undefined'){
			//console.log('serializing form %s %s', name, value);
            array.push({name: name, value: value});
        }
    }

    if (!semantic && form.clk) {
        // input type=='image' are not found in elements array! handle them here
        elements = form.getElementsByTagName("input");
        imax = imax=elements.length;
        for(i=0; i < imax; i++) {
            element = elements[i];
            name = element.name;
            if(name && !element.disabled && element.type == "image" && form.clk == input) {
                array.push(
                    {name: name+'.x', value: form.clk_x},
                    {name: name+'.y', value: form.clk_y});
            }
        }
    }
    return array;
};


/**
 * Serializes form data into a 'submittable' string. This method will return a string
 * in the format: name1=value1&amp;name2=value2
 *
 * The semantic argument can be used to force form serialization in semantic order.
 * If your form must be submitted with name/value pairs in semantic order then pass
 * true for this arg, otherwise pass false (or nothing) to avoid the overhead for
 * this logic (which can be significant for very large forms).
 *
 *
 * @name formSerialize
 * @param semantic true if serialization must maintain strict semantic ordering of elements (slower)
 * @type String
 */
function __formSerialize__(form, semantic) {
    //hand off to param for proper encoding
    return __param__(__formToArray__(form, semantic));
};


/**
 * Serializes all field elements inputs Array into a query string.
 * This method will return a string in the format: name1=value1&amp;name2=value2
 *
 * The successful argument controls whether or not serialization is limited to
 * 'successful' controls (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.
 *
 *
 * @name fieldSerialize
 * @param successful true if only successful controls should be serialized (default is true)
 * @type String
 */
function __fieldSerialize__(inputs, successful) {
    var array = [],
        input,
        name,
        value,
        i,j, imax, jmax;

    imax = inputs.length;
    for(i=0; i<imax; i++){
        input = inputs[i];
        name = input.name;
        if (!name) {
            return '';
        }
        value = __fieldValue__(input, successful);
        if (value && value.constructor == Array) {
            jmax = value.length;
            for (j=0; j < jmax; j++){
                array.push({
                    name: name,
                    value: value[j]
                });
            }
        }else if (value !== null && typeof value != 'undefined'){
            array.push({
                name: input.name,
                value: value
            });
        }
    }

    //hand off  for proper encoding
    return __param__(array);
};


/**
 * Returns the value(s) of the element in the matched set.  For example, consider the following form:
 *
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If this value is false the value(s)
 * for each element is returned.
 *
 * Note: This method *always* returns an array.  If no valid value can be determined the
 *       array will be empty, otherwise it will contain one or more values.
 *
 *
 * @name fieldValue
 * @param Boolean successful true if only the values for successful controls
 *        should be returned (default is true)
 * @type Array<String>
 */
 function __fieldValues__(inputs, successful) {
    var i,
        imax = inputs.length,
        element,
        values = [],
        value;
    for (i=0; i < imax; i++) {
        element = inputs[i];
        value = __fieldValue__(element, successful);
        if (value === null || typeof value == 'undefined' ||
            (value.constructor == Array && !value.length)) {
            continue;
        }
        if (value.constructor == Array) {
            Array.prototype.push(values, value);
        } else {
            values.push(value);
        }
    }
    return values;
};

/**
 * Returns the value of the field element.
 *
 * The successful argument controls whether or not the field element must be 'successful'
 * (per http://www.w3.org/TR/html4/interact/forms.html#successful-controls).
 * The default value of the successful argument is true.  If the given element is not
 * successful and the successful arg is not false then the returned value will be null.
 *
 * Note: If the successful flag is true (default) but the element is not successful, the return will be null
 * Note: The value returned for a successful select-multiple element will always be an array.
 * Note: If the element has no value the return value will be undefined.
 *
 * @name fieldValue
 * @param Element el The DOM element for which the value will be returned
 * @param Boolean successful true if value returned must be for a successful controls (default is true)
 * @type String or Array<String> or null or undefined
 */
 function __fieldValue__(element, successful) {
    var name = element.name,
        type = element.type,
        tag = element.tagName.toLowerCase(),
        index,
        array,
        options,
        option,
        one,
        i, imax,
        value;

    if (typeof successful == 'undefined')  {
        successful = true;
    }

    if (successful && (!name || element.disabled || type == 'reset' || type == 'button' ||
             (type == 'checkbox' || type == 'radio') &&  !element.checked ||
			/*thatcher - submit buttons should count?*/
             (/*type == 'submit' || */type == 'image') &&
             element.form && element.form.clk != element || tag === 'select' &&
             element.selectedIndex === -1)) {
            return null;
    }

    if (tag === 'select') {
        index = element.selectedIndex;
        if (index < 0) {
            return null;
        }
        array = [];
        options = element.options;
        one = (type == 'select-one');
        imax = (one ? index+1 : options.length);
        i = (one ? index : 0);
        for( i; i < imax; i++) {
            option = options[i];
            if (option.selected) {
                value = option.value;
                if (one) {
                    return value;
                }
                array.push(value);
            }
        }
        return array;
    }
    return element.value;
};


/**
 * Clears the form data.  Takes the following actions on the form's input fields:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 *
 *
 * @name clearForm
 */
 function __clearForm__(form) {
    var i,
        j, jmax,
        elements,
        resetable = ['input','select','textarea'];
    for(i=0; i<resetable.length; i++){
        elements = form.getElementsByTagName(resetable[i]);
        jmax = elements.length;
        for(j=0;j<jmax;j++){
            __clearField__(elements[j]);
        }
    }
};

/**
 * Clears the selected form element.  Takes the following actions on the element:
 *  - input text fields will have their 'value' property set to the empty string
 *  - select elements will have their 'selectedIndex' property set to -1
 *  - checkbox and radio inputs will have their 'checked' property set to false
 *  - inputs of type submit, button, reset, and hidden will *not* be effected
 *  - button elements will *not* be effected
 *
 * @name clearFields
 */
 function __clearField__(element) {
    var type = element.type,
        tag = element.tagName.toLowerCase();
    if (type == 'text' || type == 'password' || tag === 'textarea') {
        element.value = '';
    } else if (type == 'checkbox' || type == 'radio') {
        element.checked = false;
    } else if (tag === 'select') {
        element.selectedIndex = -1;
    }
};


// Serialize an array of key/values into a query string
function __param__( array ) {
    var i, serialized = [];

    // Serialize the key/values
    for(i=0; i<array.length; i++){
        serialized[ serialized.length ] =
            encodeURIComponent(array[i].name) + '=' +
            encodeURIComponent(array[i].value);
    }

    // Return the resulting serialization
    return serialized.join("&").replace(/%20/g, "+");
};
/*
    http://www.JSON.org/json2.js
    2008-07-15

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

   
    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/
try{ JSON; }catch(e){ 
JSON = function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    Date.prototype.toJSON = function (key) {

        return this.getUTCFullYear()   + '-' +
             f(this.getUTCMonth() + 1) + '-' +
             f(this.getUTCDate())      + 'T' +
             f(this.getUTCHours())     + ':' +
             f(this.getUTCMinutes())   + ':' +
             f(this.getUTCSeconds())   + 'Z';
    };

    String.prototype.toJSON = function (key) {
        return String(this);
    };
    Number.prototype.toJSON =
    Boolean.prototype.toJSON = function (key) {
        return this.valueOf();
    };

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapeable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {
        
        escapeable.lastIndex = 0;
        return escapeable.test(string) ?
            '"' + string.replace(escapeable, function (a) {
                var c = meta[a];
                if (typeof c === 'string') {
                    return c;
                }
                return '\\u' + ('0000' +
                        (+(a.charCodeAt(0))).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':
            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

            return String(value);
            
        case 'object':

            if (!value) {
                return 'null';
            }
            gap += indent;
            partial = [];

            if (typeof value.length === 'number' &&
                    !(value.propertyIsEnumerable('length'))) {

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }
                
                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

    return {
        stringify: function (value, replacer, space) {

            var i;
            gap = '';
            indent = '';

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

            } else if (typeof space === 'string') {
                indent = space;
            }

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            return str('', {'': value});
        },


        parse: function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' + ('0000' +
                            (+(a.charCodeAt(0))).toString(16)).slice(-4);
                });
            }


            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
        
                j = eval('(' + text + ')');

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

            throw new SyntaxError('JSON.parse');
        }
    };
}();

}

/**
 * synchronizes thread modifications
 * @param {Function} fn
 */
Envjs.sync = function(fn){};

/**
 * sleep thread for specified duration
 * @param {Object} millseconds
 */
Envjs.sleep = function(millseconds){};

/**
 * Interval to wait on event loop when nothing is happening
 */
Envjs.WAIT_INTERVAL = 100;//milliseconds

/*
 * Copyright (c) 2010 Nick Galbreath
 * http://code.google.com/p/stringencoders/source/browse/#svn/trunk/javascript
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * url processing in the spirit of python's urlparse module
 * see `pydoc urlparse` or
 * http://docs.python.org/library/urlparse.html
 *
 *  urlsplit: break apart a URL into components
 *  urlunsplit:  reconsistute a URL from componets
 *  urljoin: join an absolute and another URL
 *  urldefrag: remove the fragment from a URL
 *
 * Take a look at the tests in urlparse-test.html
 *
 * On URL Normalization:
 *
 * urlsplit only does minor normalization the components Only scheme
 * and hostname are lowercased urljoin does a bit more, normalizing
 * paths with "."  and "..".

 * urlnormalize adds additional normalization
 *
 *   * removes default port numbers
 *     http://abc.com:80/ -> http://abc.com/, etc
 *   * normalizes path
 *     http://abc.com -> http://abc.com/
 *     and other "." and ".." cleanups
 *   * if file, remove query and fragment
 *
 * It does not do:
 *   * normalizes escaped hex values
 *     http://abc.com/%7efoo -> http://abc.com/%7Efoo
 *   * normalize '+' <--> '%20'
 *
 * Differences with Python
 *
 * The javascript urlsplit returns a normal object with the following
 * properties: scheme, netloc, hostname, port, path, query, fragment.
 * All properties are read-write.
 *
 * In python, the resulting object is not a dict, but a specialized,
 * read-only, and has alternative tuple interface (e.g. obj[0] ==
 * obj.scheme).  It's not clear why such a simple function requires
 * a unique datastructure.
 *
 * urlunsplit in javascript takes an duck-typed object,
 *  { scheme: 'http', netloc: 'abc.com', ...}
 *  while in  * python it takes a list-like object.
 *  ['http', 'abc.com'... ]
 *
 * For all functions, the javascript version use
 * hostname+port if netloc is missing.  In python
 * hostname+port were always ignored.
 *
 * Similar functionality in different languages:
 *
 *   http://php.net/manual/en/function.parse-url.php
 *   returns assocative array but cannot handle relative URL
 *
 * TODO: test allowfragments more
 * TODO: test netloc missing, but hostname present
 */

var urlparse = {};

// Unlike to be useful standalone
//
// NORMALIZE PATH with "../" and "./"
//   http://en.wikipedia.org/wiki/URL_normalization
//   http://tools.ietf.org/html/rfc3986#section-5.2.3
//
urlparse.normalizepath = function(path)
{
    if (!path || path === '/') {
        return '/';
    }

    var parts = path.split('/');

    var newparts = [];
    // make sure path always starts with '/'
    if (parts[0]) {
        newparts.push('');
    }

    for (var i = 0; i < parts.length; ++i) {
        if (parts[i] === '..') {
            if (newparts.length > 1) {
                newparts.pop();
            } else {
                newparts.push(parts[i]);
            }
        } else if (parts[i] != '.') {
            newparts.push(parts[i]);
        }
    }

    path = newparts.join('/');
    if (!path) {
        path = '/';
    }
    return path;
};

//
// Does many of the normalizations that the stock
//  python urlsplit/urlunsplit/urljoin neglects
//
// Doesn't do hex-escape normalization on path or query
//   %7e -> %7E
// Nor, '+' <--> %20 translation
//
urlparse.urlnormalize = function(url)
{
    var parts = urlparse.urlsplit(url);
    switch (parts.scheme) {
    case 'file':
        // files can't have query strings
        //  and we don't bother with fragments
        parts.query = '';
        parts.fragment = '';
        break;
    case 'http':
    case 'https':
        // remove default port
        if ((parts.scheme === 'http' && parts.port == 80) ||
            (parts.scheme === 'https' && parts.port == 443)) {
            parts.port = null;
            // hostname is already lower case
            parts.netloc = parts.hostname;
        }
        break;
    default:
        // if we don't have specific normalizations for this
        // scheme, return the original url unmolested
        return url;
    }

    // for [file|http|https].  Not sure about other schemes
    parts.path = urlparse.normalizepath(parts.path);

    return urlparse.urlunsplit(parts);
};

urlparse.urldefrag = function(url)
{
    var idx = url.indexOf('#');
    if (idx == -1) {
        return [ url, '' ];
    } else {
        return [ url.substr(0,idx), url.substr(idx+1) ];
    }
};

urlparse.urlsplit = function(url, default_scheme, allow_fragments)
{
    var leftover;

    if (typeof allow_fragments === 'undefined') {
        allow_fragments = true;
    }

    // scheme (optional), host, port
    var fullurl = /^([A-Za-z]+)?(:?\/\/)([0-9.\-A-Za-z]*)(?::(\d+))?(.*)$/;
    // path, query, fragment
    var parse_leftovers = /([^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;

    var o = {};

    var parts = url.match(fullurl);
    if (parts) {
        o.scheme = parts[1] || default_scheme || '';
        o.hostname = parts[3].toLowerCase() || '';
        o.port = parseInt(parts[4],10) || '';
        // Probably should grab the netloc from regexp
        //  and then parse again for hostname/port

        o.netloc = parts[3];
        if (parts[4]) {
            o.netloc += ':' + parts[4];
        }

        leftover = parts[5];
    } else {
        o.scheme = default_scheme || '';
        o.netloc = '';
        o.hostname = '';
        leftover = url;
    }
    o.scheme = o.scheme.toLowerCase();

    parts = leftover.match(parse_leftovers);

    o.path =  parts[1] || '';
    o.query = parts[2] || '';

    if (allow_fragments) {
        o.fragment = parts[3] || '';
    } else {
        o.fragment = '';
    }

    return o;
};

urlparse.urlunsplit = function(o) {
    var s = '';
    if (o.scheme) {
        s += o.scheme + '://';
    }

    if (o.netloc) {
        if (s == '') {
            s += '//';
        }
        s +=  o.netloc;
    } else if (o.hostname) {
        // extension.  Python only uses netloc
        if (s == '') {
            s += '//';
        }
        s += o.hostname;
        if (o.port) {
            s += ':' + o.port;
        }
    }

    if (o.path) {
        s += o.path;
    }

    if (o.query) {
        s += '?' + o.query;
    }
    if (o.fragment) {
        s += '#' + o.fragment;
    }
    return s;
};

urlparse.urljoin = function(base, url, allow_fragments)
{
    if (typeof allow_fragments === 'undefined') {
        allow_fragments = true;
    }

    var url_parts = urlparse.urlsplit(url);

    // if url parts has a scheme (i.e. absolute)
    // then nothing to do
    if (url_parts.scheme) {
        if (! allow_fragments) {
            return url;
        } else {
            return urlparse.urldefrag(url)[0];
        }
    }
    var base_parts = urlparse.urlsplit(base);

    // copy base, only if not present
    if (!base_parts.scheme) {
        base_parts.scheme = url_parts.scheme;
    }

    // copy netloc, only if not present
    if (!base_parts.netloc || !base_parts.hostname) {
        base_parts.netloc = url_parts.netloc;
        base_parts.hostname = url_parts.hostname;
        base_parts.port = url_parts.port;
    }

    // paths
    if (url_parts.path.length > 0) {
        if (url_parts.path.charAt(0) == '/') {
            base_parts.path = url_parts.path;
        } else {
            // relative path.. get rid of "current filename" and
            //   replace.  Same as var parts =
            //   base_parts.path.split('/'); parts[parts.length-1] =
            //   url_parts.path; base_parts.path = parts.join('/');
            var idx = base_parts.path.lastIndexOf('/');
            if (idx == -1) {
                base_parts.path = url_parts.path;
            } else {
                base_parts.path = base_parts.path.substr(0,idx) + '/' +
                    url_parts.path;
            }
        }
    }

    // clean up path
    base_parts.path = urlparse.normalizepath(base_parts.path);

    // copy query string
    base_parts.query = url_parts.query;

    // copy fragments
    if (allow_fragments) {
        base_parts.fragment = url_parts.fragment;
    } else {
        base_parts.fragment = '';
    }

    return urlparse.urlunsplit(base_parts);
};

/**
 * getcwd - named after posix call of same name (see 'man 2 getcwd')
 *
 */
Envjs.getcwd = function() {
    return '.';
};

/**
 * resolves location relative to doc location
 *
 * @param {Object} path  Relative or absolute URL
 * @param {Object} base  (semi-optional)  The base url used in resolving "path" above
 */
Envjs.uri = function(path, base) {
	path = path.replace(/\\/g, '/');
    //console.log('constructing uri from path %s and base %s', path, base);

    // Semi-common trick is to make an iframe with src='javascript:false'
    //  (or some equivalent).  By returning '', the load is skipped
    if (path.indexOf('javascript:') === 0) {
        return '';
    }

    // if path is absolute, then just normalize and return
    if (path.match('^[a-zA-Z]+://')) {
        return urlparse.urlnormalize(path);
    }

    // if path is a Windows style absolute path (C:\foo\bar\index.html)
	// make it a file: URL
    if (path.match('^[a-zA-Z]+:/')) {
        return 'file:///' + urlparse.urlnormalize(path);
    }

    // interesting special case, a few very large websites use
    // '//foo/bar/' to mean 'http://foo/bar'
    if (path.match('^//')) {
        path = 'http:' + path;
    }

    // if base not passed in, try to get it from document
    // Ideally I would like the caller to pass in document.baseURI to
    //  make this more self-sufficient and testable
    if (!base && document) {
        base = document.baseURI;
    }

    // about:blank doesn't count
    if (base === 'about:blank'){
        base = '';
    }

    // if base is still empty, then we are in QA mode loading local
    // files.  Get current working directory
    if (!base) {
        base = 'file:///' + (""+Envjs.getcwd()).replace(/\\/g, '/') + '/';
    }
    // handles all cases if path is abosulte or relative to base
    // 3rd arg is "false" --> remove fragments
    var newurl = urlparse.urlnormalize(urlparse.urljoin(base, path, false));
	//console.log('uri %s %s = %s', base, path, newurl);
    return newurl;
};



/**
 * Used in the XMLHttpRquest implementation to run a
 * request in a seperate thread
 * @param {Object} fn
 */
Envjs.runAsync = function(fn){};


/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} url
 */
Envjs.writeToFile = function(text, url){};


/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} suffix
 */
Envjs.writeToTempFile = function(text, suffix){};

/**
 * Used to read the contents of a local file
 * @param {Object} url
 */
Envjs.readFromFile = function(url){};

/**
 * Used to delete a local file
 * @param {Object} url
 */
Envjs.deleteFile = function(url){};

/**
 * establishes connection and calls responsehandler
 * @param {Object} xhr
 * @param {Object} responseHandler
 * @param {Object} data
 */
Envjs.connection = function(xhr, responseHandler, data){};


__extend__(Envjs, urlparse);
/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent, aliasList){
    return (function(){return this;})();
};

Envjs.javaEnabled = false;

Envjs.homedir        = '';
Envjs.tmpdir         = '';
Envjs.os_name        = '';
Envjs.os_arch        = '';
Envjs.os_version     = '';
Envjs.lang           = '';
Envjs.platform       = '';

//some common user agents as constants so you can emulate them
Envjs.userAgents = {
	firefox3: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.7) Gecko/2009021910 Firefox/3.0.7'
}

var __windows__ = {};

Envjs.windows = function(uuid, scope){
	var w;
	if(arguments.length === 0){
		/*for(w in __windows__){
			console.log('window uuid => %s', w);
			console.log('window document => %s', __windows__[w].document.baseURI);
		}*/
		return __windows__;
	}else if(arguments.length === 1){
		return (uuid in __windows__) ? __windows__[uuid] : null
	}else if(arguments.length === 2){
		__windows__[uuid] = scope;
		if(scope === null){
            delete __windows__[uuid];
		}
	}
};
/**
 *
 * @param {Object} frameElement
 * @param {Object} url
 */
Envjs.loadFrame = function(frame, url){	
    try {
        //console.log('loading frame %s', url);
        if(frame.contentWindow && frame.contentWindow.close){
            //mark for garbage collection
            frame.contentWindow.close();
        }

        //create a new scope for the window proxy
        //platforms will need to override this function
        //to make sure the scope is global-like
        frame.contentWindow = Envjs.proxy({});
		//console.log("frame.ownerDocument %s subframe %s", 
		//	frame.ownerDocument.location,
		//	frame.ownerDocument.__ownerFrame__);
		if(frame.ownerDocument&&frame.ownerDocument.__ownerFrame__){
			//console.log('frame is parent %s', frame.ownerDocument.__ownerFrame__.contentWindow.guid);
			new Window(frame.contentWindow, frame.ownerDocument.__ownerFrame__.contentWindow);
		}else{
			//console.log("window is parent %s", window.guid);
			new Window(frame.contentWindow, window);
		}

        //I dont think frames load asynchronously in firefox
        //and I think the tests have verified this but for
        //some reason I'm less than confident... Are there cases?
        frame.contentDocument = frame.contentWindow.document;
        frame.contentDocument.async = false;
        frame.contentDocument.__ownerFrame__ = frame;
        if(url){
            //console.log('envjs.loadFrame async %s', frame.contentDocument.async);
            frame.contentDocument.location.assign(Envjs.uri(url, frame.ownerDocument.location.toString()));
        }
    } catch(e) {
        console.log("failed to load frame content: from %s %s", url, e);
    }
};


/**
 * unloadFrame
 * @param {Object} frame
 */
Envjs.unloadFrame = function(frame){
    var all, length, i;
    try{
        //TODO: probably self-referencing structures within a document tree
        //preventing it from being entirely garbage collected once orphaned.
        //Should have code to walk tree and break all links between contained
        //objects.
        frame.contentDocument = null;
        if(frame.contentWindow){
			//console.log('closing window %s', frame.contentWindow);
            frame.contentWindow.close();
        }
        Envjs.gc();
    }catch(e){
        console.log(e);
    }
};

/**
 * Platform clean up hook if it ever makes sense - see Envjs.unloadFrame for example
 */
Envjs.gc = function(){};
/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Envjs rhino-env.1.2.35
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

__context__ = Packages.org.mozilla.javascript.Context.getCurrentContext();

Envjs.platform       = "Rhino";
Envjs.revision       = "1.7.0.rc2";

/*
 * Envjs rhino-env.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * Writes message to system out.
 *
 * Some sites redefine 'print' as in 'window.print', so instead of
 * printing to stdout, you are popping open a new window, which might
 * call print, etc, etc,etc This can cause infinite loops and can
 * exhausing all memory.
 *
 * By defining this upfront now, Envjs.log will always call the native 'print'
 * function
 *
 * @param {Object} message
 */
Envjs.log = print;

Envjs.lineSource = function(e){
    return e&&e.rhinoException?e.rhinoException.lineSource():"(line ?)";
};
Envjs.eval = function(context, source, name){
    __context__.evaluateString(
        context,
        source,
        name,
        0,
        null
    );
};
Envjs.renderSVG = function(svgstring, url){
    //console.log("svg template url %s", templateSVG);
    // Create a JPEG transcoder
    var t = new Packages.org.apache.batik.transcoder.image.JPEGTranscoder();

    // Set the transcoding hints.
    t.addTranscodingHint(
        Packages.org.apache.batik.transcoder.image.JPEGTranscoder.KEY_QUALITY,
        new java.lang.Float(1.0));
    // Create the transcoder input.
    var input = new Packages.org.apache.batik.transcoder.TranscoderInput(
        new java.io.StringReader(svgstring));

    // Create the transcoder output.
    var ostream = new java.io.ByteArrayOutputStream();
    var output = new Packages.org.apache.batik.transcoder.TranscoderOutput(ostream);

    // Save the image.
    t.transcode(input, output);

    // Flush and close the stream.
    ostream.flush();
    ostream.close();
    
	var out = new java.io.FileOutputStream(new java.io.File(new java.net.URI(url.toString())));
	try{
    	out.write( ostream.toByteArray() );
	}catch(e){
		
	}finally{
    	out.flush();
    	out.close();
    }
};
//Temporary patch for parser module
Packages.org.mozilla.javascript.Context.
    getCurrentContext().setOptimizationLevel(-1);

Envjs.shell = new Packages.java.util.Scanner(Packages.java.lang.System['in']);
/**
 * Rhino provides a very succinct 'sync'
 * @param {Function} fn
 */
try{
    Envjs.sync = sync;
    Envjs.spawn = spawn;
} catch(e){
    //sync unavailable on AppEngine
    Envjs.sync = function(fn){
        //console.log('Threadless platform, sync is safe');
        return fn;
    };

    Envjs.spawn = function(fn){
        //console.log('Threadless platform, spawn shares main thread.');
        return fn();
    };
}

/**
 * sleep thread for specified duration
 * @param {Object} millseconds
 */
Envjs.sleep = function(millseconds){
    try{
        java.lang.Thread.currentThread().sleep(millseconds);
    }catch(e){
        console.log('Threadless platform, cannot sleep.');
    }
};

/**
 * provides callback hook for when the system exits
 */
Envjs.onExit = function(callback){
    var rhino = Packages.org.mozilla.javascript,
        contextFactory =  __context__.getFactory(),
        listener = new rhino.ContextFactory.Listener({
            contextReleased: function(context){
                if(context === __context__)
                    console.log('context released', context);
                contextFactory.removeListener(this);
                if(callback)
                    callback();
            }
        });
    contextFactory.addListener(listener);
};

/**
 * Get 'Current Working Directory'
 */
Envjs.getcwd = function() {
    return java.lang.System.getProperty('user.dir');
}

/**
 *
 * @param {Object} fn
 * @param {Object} onInterupt
 */
Envjs.runAsync = function(fn, onInterupt){
    ////Envjs.debug("running async");
    var running = true,
        run;

    try{
        run = Envjs.sync(function(){
            fn();
            Envjs.wait();
        });
        Envjs.spawn(run);
    }catch(e){
        console.log("error while running async operation", e);
        try{if(onInterrupt)onInterrupt(e)}catch(ee){};
    }
};

/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} url
 */
Envjs.writeToFile = function(text, url){
    //Envjs.debug("writing text to url : " + url);
    var out = new java.io.FileWriter(
        new java.io.File(
            new java.net.URI(url.toString())));
    out.write( text, 0, text.length );
    out.flush();
    out.close();
};

/**
 * Used to write to a local file
 * @param {Object} text
 * @param {Object} suffix
 */
Envjs.writeToTempFile = function(text, suffix){
    //Envjs.debug("writing text to temp url : " + suffix);
    // Create temp file.
    var temp = java.io.File.createTempFile("envjs-tmp", suffix);

    // Delete temp file when program exits.
    temp.deleteOnExit();

    // Write to temp file
    var out = new java.io.FileWriter(temp);
    out.write(text, 0, text.length);
    out.close();
    return temp.getAbsolutePath().toString()+'';
};


/**
 * Used to read the contents of a local file
 * @param {Object} url
 */
Envjs.readFromFile = function( url ){
    var fileReader = new java.io.FileReader(
        new java.io.File( 
            new java.net.URI( url )));
            
    var stringwriter = new java.io.StringWriter(),
        buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024),
        length;

    while ((length = fileReader.read(buffer, 0, 1024)) != -1) {
        stringwriter.write(buffer, 0, length);
    }

    stringwriter.close();
    return stringwriter.toString()+"";
};
    

/**
 * Used to delete a local file
 * @param {Object} url
 */
Envjs.deleteFile = function(url){
    var file = new java.io.File( new java.net.URI( url ) );
    file["delete"]();
};

/**
 * establishes connection and calls responsehandler
 * @param {Object} xhr
 * @param {Object} responseHandler
 * @param {Object} data
 */
Envjs.connection = function(xhr, responseHandler, data){
    var url = java.net.URL(xhr.url),
        connection,
        header,
        outstream,
        buffer,
        length,
        binary = false,
        name, value,
        contentEncoding,
        instream,
        responseXML,
        i;
    
        
    if ( /^file\:/.test(url) ) {
        try{
            if ( "PUT" == xhr.method || "POST" == xhr.method ) {
                data =  data || "" ;
                Envjs.writeToFile(data, url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else if ( xhr.method == "DELETE" ) {
                Envjs.deleteFile(url);
                xhr.readyState = 4;
                //could be improved, I just cant recall the correct http codes
                xhr.status = 200;
                xhr.statusText = "";
            } else {
                //try to add some canned headers that make sense
                xhr.readyState = 4;
                xhr.statusText = "ok";
                xhr.responseText = Envjs.readFromFile(xhr.url);
                try{
                    if(xhr.url.match(/html$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/html';
                    }else if(xhr.url.match(/.xml$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/xml';
                    }else if(xhr.url.match(/.js$/)){
                        xhr.responseHeaders["Content-Type"] = 'text/javascript';
                    }else if(xhr.url.match(/.json$/)){
                        xhr.responseHeaders["Content-Type"] = 'application/json';
                    }else{
                        xhr.responseHeaders["Content-Type"] = 'text/plain';
                    }
                    //xhr.responseHeaders['Last-Modified'] = connection.getLastModified();
                    //xhr.responseHeaders['Content-Length'] = headerValue+'';
                    //xhr.responseHeaders['Date'] = new Date()+'';*/
                }catch(e){
                    console.log('failed to load response headers',e);
                }
            }
        }catch(e){
            console.log('failed to open file %s %s', url, e);
            connection = null;
            xhr.readyState = 4;
            xhr.statusText = "Local File Protocol Error";
            xhr.responseText = "<html><head/><body><p>"+ e+ "</p></body></html>";
        }
    } else {
        connection = url.openConnection();
        //handle redirects manually since cookie support sucks out of the box
        connection.setFollowRedirects(false);
        connection.setRequestMethod( xhr.method );

        // Add headers to Java connection
        for (header in xhr.headers){
            connection.addRequestProperty(header+'', xhr.headers[header]+'');
        }
        connection.addRequestProperty("Accept-Encoding", 'gzip');
        connection.addRequestProperty("Agent", 'gzip');

        //write data to output stream if required
        if(data){
            if(data instanceof Document){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream(),
                    xml = (new XMLSerializer()).serializeToString(data);
                    buffer = new java.lang.String(xml).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
                    outstream.close();
                }
            }else if(data.length&&data.length>0){
                if ( xhr.method == "PUT" || xhr.method == "POST" ) {
                    connection.setDoOutput(true);
                    outstream = connection.getOutputStream();
                    buffer = new java.lang.String(data).getBytes('UTF-8');
                    outstream.write(buffer, 0, buffer.length);
                    outstream.close();
                }
            }
            connection.connect();
        }else{
            connection.connect();
        }
    }

    if(connection){
        try{
            length = connection.getHeaderFields().size();
            // Stick the response headers into responseHeaders
            for (i = 0; i < length; i++) {
                name = connection.getHeaderFieldKey(i);
                value = connection.getHeaderField(i);
                if (name)
                    xhr.responseHeaders[name+''] = value+'';
            }
        }catch(e){
            console.log('failed to load response headers \n%s',e);
        }

        xhr.readyState = 4;
        xhr.status = parseInt(connection.responseCode,10) || undefined;
        xhr.statusText = connection.responseMessage || "";

        contentEncoding = connection.getContentEncoding() || "utf-8";
        instream = null;
        responseXML = null;
        
        try{
            //console.log('contentEncoding %s', contentEncoding);
            if( contentEncoding.equalsIgnoreCase("gzip") ||
                contentEncoding.equalsIgnoreCase("decompress")){
                //zipped content
                binary = true;
                outstream = new java.io.ByteArrayOutputStream();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Byte.TYPE, 1024);
                instream = new java.util.zip.GZIPInputStream(connection.getInputStream())
            }else{
                //this is a text file
                outstream = new java.io.StringWriter();
                buffer = java.lang.reflect.Array.newInstance(java.lang.Character.TYPE, 1024);
                instream = new java.io.InputStreamReader(connection.getInputStream());
            }
        }catch(e){
            if (connection.getResponseCode() == 404){
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }else{
                console.log('failed to open connection stream \n %s %s',
                            e.toString(), e);
            }
            instream = connection.getErrorStream();
        }

        while ((length = instream.read(buffer, 0, 1024)) != -1) {
            outstream.write(buffer, 0, length);
        }

        outstream.close();
        instream.close();
        
        if(binary){
            xhr.responseText = new java.lang.String(outstream.toByteArray(), 'UTF-8')+'';
        }else{
            xhr.responseText = outstream.toString()+'';
        }

    }
    if(responseHandler){
        //Envjs.debug('calling ajax response handler');
        responseHandler();
    }
};

//Since we're running in rhino I guess we can safely assume
//java is 'enabled'.  I'm sure this requires more thought
//than I've given it here
Envjs.javaEnabled = true;

Envjs.homedir        = java.lang.System.getProperty("user.home");
Envjs.tmpdir         = java.lang.System.getProperty("java.io.tmpdir");
Envjs.os_name        = java.lang.System.getProperty("os.name");
Envjs.os_arch        = java.lang.System.getProperty("os.arch");
Envjs.os_version     = java.lang.System.getProperty("os.version");
Envjs.lang           = java.lang.System.getProperty("user.lang");


Envjs.gc = function(){ gc(); };

/**
 * Makes an object window-like by proxying object accessors
 * @param {Object} scope
 * @param {Object} parent
 */
Envjs.proxy = function(scope, parent) {
    try{
        if(scope+'' == '[object global]'){
            return scope
        }else{
            return  __context__.initStandardObjects();
        }
    }catch(e){
        console.log('failed to init standard objects %s %s \n%s', scope, parent, e);
    }

};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

/**
 * @author envjs team
 */
/*var Console,
    console;*/

/*
 * Envjs console.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author envjs team
 * borrowed 99%-ish with love from firebug-lite
 *
 * http://wiki.commonjs.org/wiki/Console
 */
Console = function(module){
    var $level,
    $logger,
    $null = function(){};


    if(Envjs[module] && Envjs[module].loglevel){
        $level = Envjs.module.loglevel;
        $logger = {
            log: function(level){
                logFormatted(arguments, (module)+" ");
            },
            debug: $level>1 ? $null: function() {
                logFormatted(arguments, (module)+" debug");
            },
            info: $level>2 ? $null:function(){
                logFormatted(arguments, (module)+" info");
            },
            warn: $level>3 ? $null:function(){
                logFormatted(arguments, (module)+" warning");
            },
            error: $level>4 ? $null:function(){
                logFormatted(arguments, (module)+" error");
            }
        };
    } else {
        $logger = {
            log: function(level){
                logFormatted(arguments, "");
            },
            debug: $null,
            info: $null,
            warn: $null,
            error: $null
        };
    }

    return $logger;
};

console = new Console("console",1);

function logFormatted(objects, className)
{
    var html = [];

    var format = objects[0];
    var objIndex = 0;

    if (typeof(format) != "string")
    {
        format = "";
        objIndex = -1;
    }

    var parts = parseFormat(format);
    for (var i = 0; i < parts.length; ++i)
    {
        var part = parts[i];
        if (part && typeof(part) == "object")
        {
            var object = objects[++objIndex];
            part.appender(object, html);
        }
        else {
            appendText(part, html);
	}
    }

    for (var i = objIndex+1; i < objects.length; ++i)
    {
        appendText(" ", html);

        var object = objects[i];
        if (typeof(object) == "string") {
            appendText(object, html);
        } else {
            appendObject(object, html);
	}
    }

    Envjs.log(html.join(' '));
}

function parseFormat(format)
{
    var parts = [];

    var reg = /((^%|[^\\]%)(\d+)?(\.)([a-zA-Z]))|((^%|[^\\]%)([a-zA-Z]))/;
    var appenderMap = {s: appendText, d: appendInteger, i: appendInteger, f: appendFloat};

    for (var m = reg.exec(format); m; m = reg.exec(format))
    {
        var type = m[8] ? m[8] : m[5];
        var appender = type in appenderMap ? appenderMap[type] : appendObject;
        var precision = m[3] ? parseInt(m[3]) : (m[4] == "." ? -1 : 0);

        parts.push(format.substr(0, m[0][0] == "%" ? m.index : m.index+1));
        parts.push({appender: appender, precision: precision});

        format = format.substr(m.index+m[0].length);
    }

    parts.push(format);

    return parts;
}

function escapeHTML(value)
{
    return value;
}

function objectToString(object)
{
    try
    {
        return object+"";
    }
    catch (exc)
    {
        return null;
    }
}

// ********************************************************************************************

function appendText(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendNull(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendString(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendInteger(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendFloat(object, html)
{
    html.push(escapeHTML(objectToString(object)));
}

function appendFunction(object, html)
{
    var reName = /function ?(.*?)\(/;
    var m = reName.exec(objectToString(object));
    var name = m ? m[1] : "function";
    html.push(escapeHTML(name));
}

function appendObject(object, html)
{
    try
    {
        if (object == undefined) {
            appendNull("undefined", html);
        } else if (object == null) {
            appendNull("null", html);
        } else if (typeof object == "string") {
            appendString(object, html);
	} else if (typeof object == "number") {
            appendInteger(object, html);
	} else if (typeof object == "function") {
            appendFunction(object, html);
        } else if (object.nodeType == 1) {
            appendSelector(object, html);
        } else if (typeof object == "object") {
            appendObjectFormatted(object, html);
        } else {
            appendText(object, html);
	}
    }
    catch (exc)
    {
    }
}

function appendObjectFormatted(object, html)
{
    var text = objectToString(object);
    var reObject = /\[object (.*?)\]/;

    var m = reObject.exec(text);
    html.push( m ? m[1] : text);
}

function appendSelector(object, html)
{

    html.push(escapeHTML(object.nodeName.toLowerCase()));
    if (object.id) {
        html.push(escapeHTML(object.id));
    }
    if (object.className) {
        html.push(escapeHTML(object.className));
    }
}

function appendNode(node, html)
{
    if (node.nodeType == 1)
    {
        html.push( node.nodeName.toLowerCase());

        for (var i = 0; i < node.attributes.length; ++i)
        {
            var attr = node.attributes[i];
            if (!attr.specified) {
                continue;
	    }

            html.push( attr.nodeName.toLowerCase(),escapeHTML(attr.nodeValue));
        }

        if (node.firstChild)
        {
            for (var child = node.firstChild; child; child = child.nextSibling) {
                appendNode(child, html);
	    }

            html.push( node.nodeName.toLowerCase());
        }
    }
    else if (node.nodeType === 3)
    {
        html.push(escapeHTML(node.nodeValue));
    }
};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Envjs dom.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 * 
 * Parts of the implementation were originally written by:\
 * and Jon van Noort   (jon@webarcana.com.au) \
 * and David Joham     (djoham@yahoo.com)",\ 
 * and Scott Severtson
 * 
 * This file simply provides the global definitions we need to \
 * be able to correctly implement to core browser DOM interfaces."
 */

/*var Attr,
    CDATASection,
    CharacterData,
    Comment,
    Document,
    DocumentFragment,
    DocumentType,
    DOMException,
    DOMImplementation,
    Element,
    Entity,
    EntityReference,
    NamedNodeMap,
    Namespace,
    Node,
    NodeList,
    Notation,
    ProcessingInstruction,
    Text,
    Range,
    XMLSerializer,
    DOMParser;
*/


/*
 * Envjs dom.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @class  NodeList -
 *      provides the abstraction of an ordered collection of nodes
 *
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NodeList is attached to (or null)
 */
NodeList = function(ownerDocument, parentNode) {
    this.length = 0;
    this.parentNode = parentNode;
    this.ownerDocument = ownerDocument;
    this._readonly = false;
    __setArray__(this, []);
};

__extend__(NodeList.prototype, {
    item : function(index) {
        var ret = null;
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            ret = this[index];
        }
        // if the index is out of bounds, default value null is returned
        return ret;
    },
    get xml() {
        var ret = "",
            i;

        // create string containing the concatenation of the string values of each child
        for (i=0; i < this.length; i++) {
            if(this[i]){
                if(this[i].nodeType == Node.TEXT_NODE && i>0 &&
                   this[i-1].nodeType == Node.TEXT_NODE){
                    //add a single space between adjacent text nodes
                    ret += " "+this[i].xml;
                }else{
                    ret += this[i].xml;
                }
            }
        }
        return ret;
    },
    toArray: function () {
        var children = [],
            i;
        for ( i=0; i < this.length; i++) {
            children.push (this[i]);
        }
        return children;
    },
    toString: function(){
        return "[object NodeList]";
    }
});


/**
 * @method __findItemIndex__
 *      find the item index of the node
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  node : Node
 * @return : int
 */
var __findItemIndex__ = function (nodelist, node) {
    var ret = -1, i;
    for (i=0; i<nodelist.length; i++) {
        // compare id to each node's _id
        if (nodelist[i] === node) {
            // found it!
            ret = i;
            break;
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __insertBefore__
 *      insert the specified Node into the NodeList before the specified index
 *      Used by Node.insertBefore(). Note: Node.insertBefore() is responsible
 *      for Node Pointer surgery __insertBefore__ simply modifies the internal
 *      data structure (Array).
 * @param  newChild      : Node - the Node to be inserted
 * @param  refChildIndex : int     - the array index to insert the Node before
 */
var __insertBefore__ = function(nodelist, newChild, refChildIndex) {
    if ((refChildIndex >= 0) && (refChildIndex <= nodelist.length)) {
        // bounds check
        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // node is a DocumentFragment
            // append the children of DocumentFragment
            Array.prototype.splice.apply(nodelist,
                [refChildIndex, 0].concat(newChild.childNodes.toArray()));
        }
        else {
            // append the newChild
            Array.prototype.splice.apply(nodelist,[refChildIndex, 0, newChild]);
        }
    }
};

/**
 * @method __replaceChild__
 *      replace the specified Node in the NodeList at the specified index
 *      Used by Node.replaceChild(). Note: Node.replaceChild() is responsible
 *      for Node Pointer surgery __replaceChild__ simply modifies the internal
 *      data structure (Array).
 *
 * @param  newChild      : Node - the Node to be inserted
 * @param  refChildIndex : int     - the array index to hold the Node
 */
var __replaceChild__ = function(nodelist, newChild, refChildIndex) {
    var ret = null;

    // bounds check
    if ((refChildIndex >= 0) && (refChildIndex < nodelist.length)) {
        // preserve old child for return
        ret = nodelist[refChildIndex];

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // node is a DocumentFragment
            // get array containing children prior to refChild
            Array.prototype.splice.apply(nodelist,
                [refChildIndex, 1].concat(newChild.childNodes.toArray()));
        }
        else {
            // simply replace node in array (links between Nodes are
            // made at higher level)
            nodelist[refChildIndex] = newChild;
        }
    }
    // return replaced node
    return ret;
};

/**
 * @method __removeChild__
 *      remove the specified Node in the NodeList at the specified index
 *      Used by Node.removeChild(). Note: Node.removeChild() is responsible
 *      for Node Pointer surgery __removeChild__ simply modifies the internal
 *      data structure (Array).
 * @param  refChildIndex : int - the array index holding the Node to be removed
 */
var __removeChild__ = function(nodelist, refChildIndex) {
    var ret = null;

    if (refChildIndex > -1) {
        // found it!
        // return removed node
        ret = nodelist[refChildIndex];

        // rebuild array without removed child
        Array.prototype.splice.apply(nodelist,[refChildIndex, 1]);
    }
    // return removed node
    return ret;
};

/**
 * @method __appendChild__
 *      append the specified Node to the NodeList. Used by Node.appendChild().
 *      Note: Node.appendChild() is responsible for Node Pointer surgery
 *      __appendChild__ simply modifies the internal data structure (Array).
 * @param  newChild      : Node - the Node to be inserted
 */
var __appendChild__ = function(nodelist, newChild) {
    if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
        // node is a DocumentFragment
        // append the children of DocumentFragment
        Array.prototype.push.apply(nodelist, newChild.childNodes.toArray() );
    } else {
        // simply add node to array (links between Nodes are made at higher level)
        Array.prototype.push.apply(nodelist, [newChild]);
    }

};

/**
 * @method __cloneNodes__ -
 *      Returns a NodeList containing clones of the Nodes in this NodeList
 * @param  deep : boolean -
 *      If true, recursively clone the subtree under each of the nodes;
 *      if false, clone only the nodes themselves (and their attributes,
 *      if it is an Element).
 * @param  parentNode : Node - the new parent of the cloned NodeList
 * @return : NodeList - NodeList containing clones of the Nodes in this NodeList
 */
var __cloneNodes__ = function(nodelist, deep, parentNode) {
    var cloneNodeList = new NodeList(nodelist.ownerDocument, parentNode);

    // create list containing clones of each child
    for (var i=0; i < nodelist.length; i++) {
        __appendChild__(cloneNodeList, nodelist[i].cloneNode(deep));
    }

    return cloneNodeList;
};


var __ownerDocument__ = function(node){
    return (node.nodeType == Node.DOCUMENT_NODE)?node:node.ownerDocument;
};

/**
 * @class  Node -
 *      The Node interface is the primary datatype for the entire
 *      Document Object Model. It represents a single node in the
 *      document tree.
 * @param  ownerDocument : Document - The Document object associated with this node.
 */

Node = function(ownerDocument) {
    this.baseURI = 'about:blank';
    this.namespaceURI = null;
    this.nodeName = "";
    this.nodeValue = null;

    // A NodeList that contains all children of this node. If there are no
    // children, this is a NodeList containing no nodes.  The content of the
    // returned NodeList is "live" in the sense that, for instance, changes to
    // the children of the node object that it was created from are immediately
    // reflected in the nodes returned by the NodeList accessors; it is not a
    // static snapshot of the content of the node. This is true for every
    // NodeList, including the ones returned by the getElementsByTagName method.
    this.childNodes      = new NodeList(ownerDocument, this);

    // The first child of this node. If there is no such node, this is null
    this.firstChild      = null;
    // The last child of this node. If there is no such node, this is null.
    this.lastChild       = null;
    // The node immediately preceding this node. If there is no such node,
    // this is null.
    this.previousSibling = null;
    // The node immediately following this node. If there is no such node,
    // this is null.
    this.nextSibling     = null;

    this.attributes = null;
    // The namespaces in scope for this node
    this._namespaces = new NamespaceNodeMap(ownerDocument, this);
    this._readonly = false;

    //IMPORTANT: These must come last so rhino will not iterate parent
    //           properties before child properties.  (qunit.equiv issue)

    // The parent of this node. All nodes, except Document, DocumentFragment,
    // and Attr may have a parent.  However, if a node has just been created
    // and not yet added to the tree, or if it has been removed from the tree,
    // this is null
    this.parentNode      = null;
    // The Document object associated with this node
    this.ownerDocument = ownerDocument;

};

// nodeType constants
Node.ELEMENT_NODE                = 1;
Node.ATTRIBUTE_NODE              = 2;
Node.TEXT_NODE                   = 3;
Node.CDATA_SECTION_NODE          = 4;
Node.ENTITY_REFERENCE_NODE       = 5;
Node.ENTITY_NODE                 = 6;
Node.PROCESSING_INSTRUCTION_NODE = 7;
Node.COMMENT_NODE                = 8;
Node.DOCUMENT_NODE               = 9;
Node.DOCUMENT_TYPE_NODE          = 10;
Node.DOCUMENT_FRAGMENT_NODE      = 11;
Node.NOTATION_NODE               = 12;
Node.NAMESPACE_NODE              = 13;

Node.DOCUMENT_POSITION_EQUAL        = 0x00;
Node.DOCUMENT_POSITION_DISCONNECTED = 0x01;
Node.DOCUMENT_POSITION_PRECEDING    = 0x02;
Node.DOCUMENT_POSITION_FOLLOWING    = 0x04;
Node.DOCUMENT_POSITION_CONTAINS     = 0x08;
Node.DOCUMENT_POSITION_CONTAINED_BY = 0x10;
Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC      = 0x20;


__extend__(Node.prototype, {
    get localName(){
        return this.prefix?
            this.nodeName.substring(this.prefix.length+1, this.nodeName.length):
            this.nodeName;
    },
    get prefix(){
        return this.nodeName.split(':').length>1?
            this.nodeName.split(':')[0]:
            null;
    },
    set prefix(value){
        if(value === null){
            this.nodeName = this.localName;
        }else{
            this.nodeName = value+':'+this.localName;
        }
    },
    hasAttributes : function() {
        if (this.attributes.length == 0) {
            return false;
        }else{
            return true;
        }
    },
    get textContent(){
        return __recursivelyGatherText__(this);
    },
    set textContent(newText){
        while(this.firstChild != null){
            this.removeChild( this.firstChild );
        }
        var text = this.ownerDocument.createTextNode(newText);
        this.appendChild(text);
    },
    insertBefore : function(newChild, refChild) {
        var prevNode;

        if(newChild==null){
            return newChild;
        }
        if(refChild==null){
            this.appendChild(newChild);
            return this.newChild;
        }

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // if refChild is specified, insert before it
        if (refChild) {
            // find index of refChild
            var itemIndex = __findItemIndex__(this.childNodes, refChild);
            // throw Exception if there is no child node with this id
            if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
                throw(new DOMException(DOMException.NOT_FOUND_ERR));
            }

            // if the newChild is already in the tree,
            var newChildParent = newChild.parentNode;
            if (newChildParent) {
                // remove it
                newChildParent.removeChild(newChild);
            }

            // insert newChild into childNodes
            __insertBefore__(this.childNodes, newChild, itemIndex);

            // do node pointer surgery
            prevNode = refChild.previousSibling;

            // handle DocumentFragment
            if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
                if (newChild.childNodes.length > 0) {
                    // set the parentNode of DocumentFragment's children
                    for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                        newChild.childNodes[ind].parentNode = this;
                    }

                    // link refChild to last child of DocumentFragment
                    refChild.previousSibling = newChild.childNodes[newChild.childNodes.length-1];
                }
            }else {
                // set the parentNode of the newChild
                newChild.parentNode = this;
                // link refChild to newChild
                refChild.previousSibling = newChild;
            }

        }else {
            // otherwise, append to end
            prevNode = this.lastChild;
            this.appendChild(newChild);
        }

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for DocumentFragment
            if (newChild.childNodes.length > 0) {
                if (prevNode) {
                    prevNode.nextSibling = newChild.childNodes[0];
                }else {
                    // this is the first child in the list
                    this.firstChild = newChild.childNodes[0];
                }
                newChild.childNodes[0].previousSibling = prevNode;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = refChild;
            }
        }else {
            // do node pointer surgery for newChild
            if (prevNode) {
                prevNode.nextSibling = newChild;
            }else {
                // this is the first child in the list
                this.firstChild = newChild;
            }
            newChild.previousSibling = prevNode;
            newChild.nextSibling     = refChild;
        }

        return newChild;
    },
    replaceChild : function(newChild, oldChild) {
        var ret = null;

        if(newChild==null || oldChild==null){
            return oldChild;
        }

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if newChild was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(newChild)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
                throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // get index of oldChild
        var index = __findItemIndex__(this.childNodes, oldChild);

        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (index < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }

        // if the newChild is already in the tree,
        var newChildParent = newChild.parentNode;
        if (newChildParent) {
            // remove it
            newChildParent.removeChild(newChild);
        }

        // add newChild to childNodes
        ret = __replaceChild__(this.childNodes,newChild, index);


        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for Document Fragment
            if (newChild.childNodes.length > 0) {
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                    newChild.childNodes[ind].parentNode = this;
                }

                if (oldChild.previousSibling) {
                    oldChild.previousSibling.nextSibling = newChild.childNodes[0];
                } else {
                    this.firstChild = newChild.childNodes[0];
                }

                if (oldChild.nextSibling) {
                    oldChild.nextSibling.previousSibling = newChild;
                } else {
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                }

                newChild.childNodes[0].previousSibling = oldChild.previousSibling;
                newChild.childNodes[newChild.childNodes.length-1].nextSibling = oldChild.nextSibling;
            }
        } else {
            // do node pointer surgery for newChild
            newChild.parentNode = this;

            if (oldChild.previousSibling) {
                oldChild.previousSibling.nextSibling = newChild;
            }else{
                this.firstChild = newChild;
            }
            if (oldChild.nextSibling) {
                oldChild.nextSibling.previousSibling = newChild;
            }else{
                this.lastChild = newChild;
            }
            newChild.previousSibling = oldChild.previousSibling;
            newChild.nextSibling = oldChild.nextSibling;
        }

        return ret;
    },
    removeChild : function(oldChild) {
        if(!oldChild){
            return null;
        }
        // throw Exception if NamedNodeMap is readonly
        if (__ownerDocument__(this).implementation.errorChecking &&
            (this._readonly || oldChild._readonly)) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }

        // get index of oldChild
        var itemIndex = __findItemIndex__(this.childNodes, oldChild);

        // throw Exception if there is no child node with this id
        if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
        }

        // remove oldChild from childNodes
        __removeChild__(this.childNodes, itemIndex);

        // do node pointer surgery
        oldChild.parentNode = null;

        if (oldChild.previousSibling) {
            oldChild.previousSibling.nextSibling = oldChild.nextSibling;
        }else {
            this.firstChild = oldChild.nextSibling;
        }
        if (oldChild.nextSibling) {
            oldChild.nextSibling.previousSibling = oldChild.previousSibling;
        }else {
            this.lastChild = oldChild.previousSibling;
        }

        oldChild.previousSibling = null;
        oldChild.nextSibling = null;

        return oldChild;
    },
    appendChild : function(newChild) {
        if(!newChild){
            return null;
        }
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(this)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if the node is an ancestor
            if (__isAncestor__(this, newChild)) {
              throw(new DOMException(DOMException.HIERARCHY_REQUEST_ERR));
            }
        }

        // if the newChild is already in the tree,
        var newChildParent = newChild.parentNode;
        if (newChildParent) {
            // remove it
           //console.debug('removing node %s', newChild);
            newChildParent.removeChild(newChild);
        }

        // add newChild to childNodes
        __appendChild__(this.childNodes, newChild);

        if (newChild.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // do node pointer surgery for DocumentFragment
            if (newChild.childNodes.length > 0) {
                for (var ind = 0; ind < newChild.childNodes.length; ind++) {
                    newChild.childNodes[ind].parentNode = this;
                }

                if (this.lastChild) {
                    this.lastChild.nextSibling = newChild.childNodes[0];
                    newChild.childNodes[0].previousSibling = this.lastChild;
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                } else {
                    this.lastChild = newChild.childNodes[newChild.childNodes.length-1];
                    this.firstChild = newChild.childNodes[0];
                }
            }
        } else {
            // do node pointer surgery for newChild
            newChild.parentNode = this;
            if (this.lastChild) {
                this.lastChild.nextSibling = newChild;
                newChild.previousSibling = this.lastChild;
                this.lastChild = newChild;
            } else {
                this.lastChild = newChild;
                this.firstChild = newChild;
            }
       }
       return newChild;
    },
    hasChildNodes : function() {
        return (this.childNodes.length > 0);
    },
    cloneNode: function(deep) {
        // use importNode to clone this Node
        //do not throw any exceptions
        try {
            return __ownerDocument__(this).importNode(this, deep);
        } catch (e) {
            //there shouldn't be any exceptions, but if there are, return null
            // may want to warn: $debug("could not clone node: "+e.code);
            return null;
        }
    },
    normalize : function() {
        var i;
        var inode;
        var nodesToRemove = new NodeList();

        if (this.nodeType == Node.ELEMENT_NODE || this.nodeType == Node.DOCUMENT_NODE) {
            var adjacentTextNode = null;

            // loop through all childNodes
            for(i = 0; i < this.childNodes.length; i++) {
                inode = this.childNodes.item(i);

                if (inode.nodeType == Node.TEXT_NODE) {
                    // this node is a text node
                    if (inode.length < 1) {
                        // this text node is empty
                        // add this node to the list of nodes to be remove
                        __appendChild__(nodesToRemove, inode);
                    }else {
                        if (adjacentTextNode) {
                            // previous node was also text
                            adjacentTextNode.appendData(inode.data);
                            // merge the data in adjacent text nodes
                            // add this node to the list of nodes to be removed
                            __appendChild__(nodesToRemove, inode);
                        } else {
                            // remember this node for next cycle
                            adjacentTextNode = inode;
                        }
                    }
                } else {
                    // (soon to be) previous node is not a text node
                    adjacentTextNode = null;
                    // normalize non Text childNodes
                    inode.normalize();
                }
            }

            // remove redundant Text Nodes
            for(i = 0; i < nodesToRemove.length; i++) {
                inode = nodesToRemove.item(i);
                inode.parentNode.removeChild(inode);
            }
        }
    },
    isSupported : function(feature, version) {
        // use Implementation.hasFeature to determine if this feature is supported
        return __ownerDocument__(this).implementation.hasFeature(feature, version);
    },
    getElementsByTagName : function(tagname) {
        // delegate to _getElementsByTagNameRecursive
        // recurse childNodes
        var nodelist = new NodeList(__ownerDocument__(this));
        for (var i = 0; i < this.childNodes.length; i++) {
            __getElementsByTagNameRecursive__(this.childNodes.item(i),
                                              tagname,
                                              nodelist);
        }
        return nodelist;
    },
    getElementsByTagNameNS : function(namespaceURI, localName) {
        // delegate to _getElementsByTagNameNSRecursive
        return __getElementsByTagNameNSRecursive__(this, namespaceURI, localName,
            new NodeList(__ownerDocument__(this)));
    },
    importNode : function(importedNode, deep) {
        var i;
        var importNode;

        //there is no need to perform namespace checks since everything has already gone through them
        //in order to have gotten into the DOM in the first place. The following line
        //turns namespace checking off in ._isValidNamespace
        __ownerDocument__(this).importing = true;

        if (importedNode.nodeType == Node.ELEMENT_NODE) {
            if (!__ownerDocument__(this).implementation.namespaceAware) {
                // create a local Element (with the name of the importedNode)
                importNode = __ownerDocument__(this).createElement(importedNode.tagName);

                // create attributes matching those of the importedNode
                for(i = 0; i < importedNode.attributes.length; i++) {
                    importNode.setAttribute(importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                }
            } else {
                // create a local Element (with the name & namespaceURI of the importedNode)
                importNode = __ownerDocument__(this).createElementNS(importedNode.namespaceURI, importedNode.nodeName);

                // create attributes matching those of the importedNode
                for(i = 0; i < importedNode.attributes.length; i++) {
                    importNode.setAttributeNS(importedNode.attributes.item(i).namespaceURI,
                        importedNode.attributes.item(i).name, importedNode.attributes.item(i).value);
                }

                // create namespace definitions matching those of the importedNode
                for(i = 0; i < importedNode._namespaces.length; i++) {
                    importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                    importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                }
            }
        } else if (importedNode.nodeType == Node.ATTRIBUTE_NODE) {
            if (!__ownerDocument__(this).implementation.namespaceAware) {
                // create a local Attribute (with the name of the importedAttribute)
                importNode = __ownerDocument__(this).createAttribute(importedNode.name);
            } else {
                // create a local Attribute (with the name & namespaceURI of the importedAttribute)
                importNode = __ownerDocument__(this).createAttributeNS(importedNode.namespaceURI, importedNode.nodeName);

                // create namespace definitions matching those of the importedAttribute
                for(i = 0; i < importedNode._namespaces.length; i++) {
                    importNode._namespaces[i] = __ownerDocument__(this).createNamespace(importedNode._namespaces.item(i).localName);
                    importNode._namespaces[i].value = importedNode._namespaces.item(i).value;
                }
            }

            // set the value of the local Attribute to match that of the importedAttribute
            importNode.value = importedNode.value;

        } else if (importedNode.nodeType == Node.DOCUMENT_FRAGMENT_NODE) {
            // create a local DocumentFragment
            importNode = __ownerDocument__(this).createDocumentFragment();
        } else if (importedNode.nodeType == Node.NAMESPACE_NODE) {
            // create a local NamespaceNode (with the same name & value as the importedNode)
            importNode = __ownerDocument__(this).createNamespace(importedNode.nodeName);
            importNode.value = importedNode.value;
        } else if (importedNode.nodeType == Node.TEXT_NODE) {
            // create a local TextNode (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createTextNode(importedNode.data);
        } else if (importedNode.nodeType == Node.CDATA_SECTION_NODE) {
            // create a local CDATANode (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createCDATASection(importedNode.data);
        } else if (importedNode.nodeType == Node.PROCESSING_INSTRUCTION_NODE) {
            // create a local ProcessingInstruction (with the same target & data as the importedNode)
            importNode = __ownerDocument__(this).createProcessingInstruction(importedNode.target, importedNode.data);
        } else if (importedNode.nodeType == Node.COMMENT_NODE) {
            // create a local Comment (with the same data as the importedNode)
            importNode = __ownerDocument__(this).createComment(importedNode.data);
        } else {  // throw Exception if nodeType is not supported
            throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
        }

        if (deep) {
            // recurse childNodes
            for(i = 0; i < importedNode.childNodes.length; i++) {
                importNode.appendChild(__ownerDocument__(this).importNode(importedNode.childNodes.item(i), true));
            }
        }

        //reset importing
        __ownerDocument__(this).importing = false;
        return importNode;

    },
    contains : function(node){
        while(node && node != this ){
            node = node.parentNode;
        }
        return !!node;
    },
    compareDocumentPosition : function(b){
        //console.log("comparing document position %s %s", this, b);
        var i,
            length,
            a = this,
            parent,
            aparents,
            bparents;
        //handle a couple simpler case first
        if(a === b) {
            return Node.DOCUMENT_POSITION_EQUAL;
        }
        if(a.ownerDocument !== b.ownerDocument) {
            return Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC|
               Node.DOCUMENT_POSITION_FOLLOWING|
               Node.DOCUMENT_POSITION_DISCONNECTED;
        }
        if(a.parentNode === b.parentNode){
            length = a.parentNode.childNodes.length;
            for(i=0;i<length;i++){
                if(a.parentNode.childNodes[i] === a){
                    return Node.DOCUMENT_POSITION_FOLLOWING;
                }else if(a.parentNode.childNodes[i] === b){
                    return Node.DOCUMENT_POSITION_PRECEDING;
                }
            }
        }

        if(a.contains(b)) {
            return Node.DOCUMENT_POSITION_CONTAINED_BY|
                   Node.DOCUMENT_POSITION_FOLLOWING;
        }
        if(b.contains(a)) {
            return Node.DOCUMENT_POSITION_CONTAINS|
                   Node.DOCUMENT_POSITION_PRECEDING;
        }
        aparents = [];
        parent = a.parentNode;
        while(parent){
            aparents[aparents.length] = parent;
            parent = parent.parentNode;
        }

        bparents = [];
        parent = b.parentNode;
        while(parent){
            i = aparents.indexOf(parent);
            if(i < 0){
                bparents[bparents.length] = parent;
                parent = parent.parentNode;
            }else{
                //i cant be 0 since we already checked for equal parentNode
                if(bparents.length > aparents.length){
                    return Node.DOCUMENT_POSITION_FOLLOWING;
                }else if(bparents.length < aparents.length){
                    return Node.DOCUMENT_POSITION_PRECEDING;
                }else{
                    //common ancestor diverge point
                    if (i === 0) {
                        return Node.DOCUMENT_POSITION_FOLLOWING;
                    } else {
                        parent = aparents[i-1];
                    }
                    return parent.compareDocumentPosition(bparents.pop());
                }
            }
        }

        return Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC|
               Node.DOCUMENT_POSITION_DISCONNECTED;

    },
    toString : function() {
        return '[object Node]';
    }

});



/**
 * @method __getElementsByTagNameRecursive__ - implements getElementsByTagName()
 * @param  elem     : Element  - The element which are checking and then recursing into
 * @param  tagname  : string      - The name of the tag to match on. The special value "*" matches all tags
 * @param  nodeList : NodeList - The accumulating list of matching nodes
 *
 * @return : NodeList
 */
var __getElementsByTagNameRecursive__ = function (elem, tagname, nodeList) {

    if (elem.nodeType == Node.ELEMENT_NODE || elem.nodeType == Node.DOCUMENT_NODE) {

        if(elem.nodeType !== Node.DOCUMENT_NODE &&
            ((elem.nodeName.toUpperCase() == tagname.toUpperCase()) ||
                (tagname == "*")) ){
            // add matching node to nodeList
            __appendChild__(nodeList, elem);
        }

        // recurse childNodes
        for(var i = 0; i < elem.childNodes.length; i++) {
            nodeList = __getElementsByTagNameRecursive__(elem.childNodes.item(i), tagname, nodeList);
        }
    }

    return nodeList;
};

/**
 * @method __getElementsByTagNameNSRecursive__
 *      implements getElementsByTagName()
 *
 * @param  elem     : Element  - The element which are checking and then recursing into
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @param  nodeList     : NodeList - The accumulating list of matching nodes
 *
 * @return : NodeList
 */
var __getElementsByTagNameNSRecursive__ = function(elem, namespaceURI, localName, nodeList) {
    if (elem.nodeType == Node.ELEMENT_NODE || elem.nodeType == Node.DOCUMENT_NODE) {

        if (((elem.namespaceURI == namespaceURI) || (namespaceURI == "*")) &&
            ((elem.localName == localName) || (localName == "*"))) {
            // add matching node to nodeList
            __appendChild__(nodeList, elem);
        }

        // recurse childNodes
        for(var i = 0; i < elem.childNodes.length; i++) {
            nodeList = __getElementsByTagNameNSRecursive__(
                elem.childNodes.item(i), namespaceURI, localName, nodeList);
        }
    }

    return nodeList;
};

/**
 * @method __isAncestor__ - returns true if node is ancestor of target
 * @param  target         : Node - The node we are using as context
 * @param  node         : Node - The candidate ancestor node
 * @return : boolean
 */
var __isAncestor__ = function(target, node) {
    // if this node matches, return true,
    // otherwise recurse up (if there is a parentNode)
    return ((target == node) || ((target.parentNode) && (__isAncestor__(target.parentNode, node))));
};



var __recursivelyGatherText__ = function(aNode) {
    var accumulateText = "",
        idx,
        node;
    for (idx=0;idx < aNode.childNodes.length;idx++){
        node = aNode.childNodes.item(idx);
        if(node.nodeType == Node.TEXT_NODE)
            accumulateText += node.data;
        else
            accumulateText += __recursivelyGatherText__(node);
    }
    return accumulateText;
};

/**
 * function __escapeXML__
 * @param  str : string - The string to be escaped
 * @return : string - The escaped string
 */
var escAmpRegEx = /&(?!(amp;|lt;|gt;|quot|apos;))/g;
var escLtRegEx = /</g;
var escGtRegEx = />/g;
var quotRegEx = /"/g;
var aposRegEx = /'/g;

function __escapeXML__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;").
            replace(quotRegEx, "&quot;").
            replace(aposRegEx, "&apos;");

    return str;
};

/*
function __escapeHTML5__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;");

    return str;
};
function __escapeHTML5Atribute__(str) {
    str = str.replace(escAmpRegEx, "&amp;").
            replace(escLtRegEx, "&lt;").
            replace(escGtRegEx, "&gt;").
            replace(quotRegEx, "&quot;").
            replace(aposRegEx, "&apos;");

    return str;
};
*/

/**
 * function __unescapeXML__
 * @param  str : string - The string to be unescaped
 * @return : string - The unescaped string
 */
var unescAmpRegEx = /&amp;/g;
var unescLtRegEx = /&lt;/g;
var unescGtRegEx = /&gt;/g;
var unquotRegEx = /&quot;/g;
var unaposRegEx = /&apos;/g;
function __unescapeXML__(str) {
    str = str.replace(unescAmpRegEx, "&").
            replace(unescLtRegEx, "<").
            replace(unescGtRegEx, ">").
            replace(unquotRegEx, "\"").
            replace(unaposRegEx, "'");

    return str;
};

/**
 * @class  NamedNodeMap -
 *      used to represent collections of nodes that can be accessed by name
 *      typically a set of Element attributes
 *
 * @extends NodeList -
 *      note W3C spec says that this is not the case, but we need an item()
 *      method identical to NodeList's, so why not?
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NamedNodeMap is attached to (or null)
 */
NamedNodeMap = function(ownerDocument, parentNode) {
    NodeList.apply(this, arguments);
    __setArray__(this, []);
};
NamedNodeMap.prototype = new NodeList();
__extend__(NamedNodeMap.prototype, {
    add: function(name){
        this[this.length] = name;
    },
    getNamedItem : function(name) {
        var ret = null;
        //console.log('NamedNodeMap getNamedItem %s', name);
        // test that Named Node exists
        var itemIndex = __findNamedItemIndex__(this, name);

        if (itemIndex > -1) {
            // found it!
            ret = this[itemIndex];
        }
        // if node is not found, default value null is returned
        return ret;
    },
    setNamedItem : function(arg) {
      //console.log('setNamedItem %s', arg);
      // test for exceptions
      if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if arg was not created by this Document
            if (this.ownerDocument != arg.ownerDocument) {
              throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if DOMNamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
              throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
      }

     //console.log('setNamedItem __findNamedItemIndex__ ');
      // get item index
      var itemIndex = __findNamedItemIndex__(this, arg.name);
      var ret = null;

     //console.log('setNamedItem __findNamedItemIndex__ %s', itemIndex);
      if (itemIndex > -1) {                          // found it!
            ret = this[itemIndex];                // use existing Attribute

            // throw Exception if DOMAttr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
              this[itemIndex] = arg;                // over-write existing NamedNode
              this[arg.name.toLowerCase()] = arg;
            }
      } else {
            // add new NamedNode
           //console.log('setNamedItem add new named node map (by index)');
            Array.prototype.push.apply(this, [arg]);
           //console.log('setNamedItem add new named node map (by name) %s %s', arg, arg.name);
            this[arg.name] = arg;
           //console.log('finsished setNamedItem add new named node map (by name) %s', arg.name);

      }

     //console.log('setNamedItem parentNode');
      arg.ownerElement = this.parentNode;            // update ownerElement
      // return old node or new node
     //console.log('setNamedItem exit');
      return ret;
    },
    removeNamedItem : function(name) {
          var ret = null;
          // test for exceptions
          // throw Exception if NamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking &&
                (this._readonly || (this.parentNode && this.parentNode._readonly))) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // get item index
          var itemIndex = __findNamedItemIndex__(this, name);

          // throw Exception if there is no node named name in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }

          // get Node
          var oldNode = this[itemIndex];
          //this[oldNode.name] = undefined;

          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // return removed node
          return __removeChild__(this, itemIndex);
    },
    getNamedItemNS : function(namespaceURI, localName) {
        var ret = null;

        // test that Named Node exists
        var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);

        if (itemIndex > -1) {
            // found it! return NamedNode
            ret = this[itemIndex];
        }
        // if node is not found, default value null is returned
        return ret;
    },
    setNamedItemNS : function(arg) {
        //console.log('setNamedItemNS %s', arg);
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if NamedNodeMap is readonly
            if (this._readonly || (this.parentNode && this.parentNode._readonly)) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if arg was not created by this Document
            if (__ownerDocument__(this) != __ownerDocument__(arg)) {
                throw(new DOMException(DOMException.WRONG_DOCUMENT_ERR));
            }

            // throw Exception if arg is already an attribute of another Element object
            if (arg.ownerElement && (arg.ownerElement != this.parentNode)) {
                throw(new DOMException(DOMException.INUSE_ATTRIBUTE_ERR));
            }
        }

        // get item index
        var itemIndex = __findNamedItemNSIndex__(this, arg.namespaceURI, arg.localName);
        var ret = null;

        if (itemIndex > -1) {
            // found it!
            // use existing Attribute
            ret = this[itemIndex];
            // throw Exception if Attr is readonly
            if (__ownerDocument__(this).implementation.errorChecking && ret._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            } else {
                // over-write existing NamedNode
                this[itemIndex] = arg;
            }
        }else {
            // add new NamedNode
            Array.prototype.push.apply(this, [arg]);
        }
        arg.ownerElement = this.parentNode;

        // return old node or null
        return ret;
        //console.log('finished setNamedItemNS %s', arg);
    },
    removeNamedItemNS : function(namespaceURI, localName) {
          var ret = null;

          // test for exceptions
          // throw Exception if NamedNodeMap is readonly
          if (__ownerDocument__(this).implementation.errorChecking && (this._readonly || (this.parentNode && this.parentNode._readonly))) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          // get item index
          var itemIndex = __findNamedItemNSIndex__(this, namespaceURI, localName);

          // throw Exception if there is no matching node in this map
          if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
            throw(new DOMException(DOMException.NOT_FOUND_ERR));
          }

          // get Node
          var oldNode = this[itemIndex];

          // throw Exception if Node is readonly
          if (__ownerDocument__(this).implementation.errorChecking && oldNode._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
          }

          return __removeChild__(this, itemIndex);             // return removed node
    },
    get xml() {
          var ret = "";

          // create string containing concatenation of all (but last) Attribute string values (separated by spaces)
          for (var i=0; i < this.length -1; i++) {
            ret += this[i].xml +" ";
          }

          // add last Attribute to string (without trailing space)
          if (this.length > 0) {
            ret += this[this.length -1].xml;
          }

          return ret;
    },
    toString : function(){
        return "[object NamedNodeMap]";
    }

});

/**
 * @method __findNamedItemIndex__
 *      find the item index of the node with the specified name
 *
 * @param  name : string - the name of the required node
 * @param  isnsmap : if its a NamespaceNodeMap
 * @return : int
 */
var __findNamedItemIndex__ = function(namednodemap, name, isnsmap) {
    var ret = -1;
    // loop through all nodes
    for (var i=0; i<namednodemap.length; i++) {
        // compare name to each node's nodeName
        if(namednodemap[i].localName && name && isnsmap){
            if (namednodemap[i].localName.toLowerCase() == name.toLowerCase()) {
                // found it!
                ret = i;
                break;
            }
        }else{
            if(namednodemap[i].name && name){
                if (namednodemap[i].name.toLowerCase() == name.toLowerCase()) {
                    // found it!
                    ret = i;
                    break;
                }
            }
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __findNamedItemNSIndex__
 *      find the item index of the node with the specified
 *      namespaceURI and localName
 *
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : int
 */
var __findNamedItemNSIndex__ = function(namednodemap, namespaceURI, localName) {
    var ret = -1;
    // test that localName is not null
    if (localName) {
        // loop through all nodes
        for (var i=0; i<namednodemap.length; i++) {
            if(namednodemap[i].namespaceURI && namednodemap[i].localName){
                // compare name to each node's namespaceURI and localName
                if ((namednodemap[i].namespaceURI.toLowerCase() == namespaceURI.toLowerCase()) &&
                    (namednodemap[i].localName.toLowerCase() == localName.toLowerCase())) {
                    // found it!
                    ret = i;
                    break;
                }
            }
        }
    }
    // if node is not found, default value -1 is returned
    return ret;
};

/**
 * @method __hasAttribute__
 *      Returns true if specified node exists
 *
 * @param  name : string - the name of the required node
 * @return : boolean
 */
var __hasAttribute__ = function(namednodemap, name) {
    var ret = false;
    // test that Named Node exists
    var itemIndex = __findNamedItemIndex__(namednodemap, name);
        if (itemIndex > -1) {
        // found it!
        ret = true;
    }
    // if node is not found, default value false is returned
    return ret;
}

/**
 * @method __hasAttributeNS__
 *      Returns true if specified node exists
 *
 * @param  namespaceURI : string - the namespace URI of the required node
 * @param  localName    : string - the local name of the required node
 * @return : boolean
 */
var __hasAttributeNS__ = function(namednodemap, namespaceURI, localName) {
    var ret = false;
    // test that Named Node exists
    var itemIndex = __findNamedItemNSIndex__(namednodemap, namespaceURI, localName);
    if (itemIndex > -1) {
        // found it!
        ret = true;
    }
    // if node is not found, default value false is returned
    return ret;
}

/**
 * @method __cloneNamedNodes__
 *      Returns a NamedNodeMap containing clones of the Nodes in this NamedNodeMap
 *
 * @param  parentNode : Node - the new parent of the cloned NodeList
 * @param  isnsmap : bool - is this a NamespaceNodeMap
 * @return NamedNodeMap containing clones of the Nodes in this NamedNodeMap
 */
var __cloneNamedNodes__ = function(namednodemap, parentNode, isnsmap) {
    var cloneNamedNodeMap = isnsmap?
        new NamespaceNodeMap(namednodemap.ownerDocument, parentNode):
        new NamedNodeMap(namednodemap.ownerDocument, parentNode);

    // create list containing clones of all children
    for (var i=0; i < namednodemap.length; i++) {
        __appendChild__(cloneNamedNodeMap, namednodemap[i].cloneNode(false));
    }

    return cloneNamedNodeMap;
};


/**
 * @class  NamespaceNodeMap -
 *      used to represent collections of namespace nodes that can be
 *      accessed by name typically a set of Element attributes
 *
 * @extends NamedNodeMap
 *
 * @param  ownerDocument : Document - the ownerDocument
 * @param  parentNode    : Node - the node that the NamespaceNodeMap is attached to (or null)
 */
var NamespaceNodeMap = function(ownerDocument, parentNode) {
    this.NamedNodeMap = NamedNodeMap;
    this.NamedNodeMap(ownerDocument, parentNode);
    __setArray__(this, []);
};
NamespaceNodeMap.prototype = new NamedNodeMap();
__extend__(NamespaceNodeMap.prototype, {
    get xml() {
        var ret = "",
            ns,
            ind;
        // identify namespaces declared local to this Element (ie, not inherited)
        for (ind = 0; ind < this.length; ind++) {
            // if namespace declaration does not exist in the containing node's, parentNode's namespaces
            ns = null;
            try {
                var ns = this.parentNode.parentNode._namespaces.
                    getNamedItem(this[ind].localName);
            }catch (e) {
                //breaking to prevent default namespace being inserted into return value
                break;
            }
            if (!(ns && (""+ ns.nodeValue == ""+ this[ind].nodeValue))) {
                // display the namespace declaration
                ret += this[ind].xml +" ";
            }
        }
        return ret;
    }
});

/**
 * @class  Namespace -
 *      The Namespace interface represents an namespace in an Element object
 *
 * @param  ownerDocument : The Document object associated with this node.
 */
Namespace = function(ownerDocument) {
    Node.apply(this, arguments);
    // the name of this attribute
    this.name      = "";

    // If this attribute was explicitly given a value in the original document,
    // this is true; otherwise, it is false.
    // Note that the implementation is in charge of this attribute, not the user.
    // If the user changes the value of the attribute (even if it ends up having
    // the same value as the default value) then the specified flag is
    // automatically flipped to true
    this.specified = false;
};
Namespace.prototype = new Node();
__extend__(Namespace.prototype, {
    get value(){
        // the value of the attribute is returned as a string
        return this.nodeValue;
    },
    set value(value){
        this.nodeValue = value+'';
    },
    get nodeType(){
        return Node.NAMESPACE_NODE;
    },
    get xml(){
        var ret = "";

          // serialize Namespace Declaration
          if (this.nodeName != "") {
            ret += this.nodeName +"=\""+ __escapeXML__(this.nodeValue) +"\"";
          }
          else {  // handle default namespace
            ret += "xmlns=\""+ __escapeXML__(this.nodeValue) +"\"";
          }

          return ret;
    },
    toString: function(){
        return '[object Namespace]';
    }
});


/**
 * @class  CharacterData - parent abstract class for Text and Comment
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
CharacterData = function(ownerDocument) {
    Node.apply(this, arguments);
};
CharacterData.prototype = new Node();
__extend__(CharacterData.prototype,{
    get data(){
        return this.nodeValue;
    },
    set data(data){
        this.nodeValue = data;
    },
    get textContent(){
        return this.nodeValue;
    },
    set textContent(newText){
        this.nodeValue = newText;
    },
    get length(){return this.nodeValue.length;},
    appendData: function(arg){
        // throw Exception if CharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        // append data
        this.data = "" + this.data + arg;
    },
    deleteData: function(offset, count){
        // throw Exception if CharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset >  this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // delete data
            if(!count || (offset + count) > this.data.length) {
              this.data = this.data.substring(0, offset);
            }else {
              this.data = this.data.substring(0, offset).
                concat(this.data.substring(offset + count));
            }
        }
    },
    insertData: function(offset, arg){
        // throw Exception if CharacterData is readonly
        if(__ownerDocument__(this).implementation.errorChecking && this._readonly){
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }

        if(this.data){
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset >  this.data.length))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // insert data
            this.data =  this.data.substring(0, offset).concat(arg, this.data.substring(offset));
        }else {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking && (offset !== 0)) {
               throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // set data
            this.data = arg;
        }
    },
    replaceData: function(offset, count, arg){
        // throw Exception if CharacterData is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }

        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset >  this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }

            // replace data
            this.data = this.data.substring(0, offset).
                concat(arg, this.data.substring(offset + count));
        }else {
            // set data
            this.data = arg;
        }
    },
    substringData: function(offset, count){
        var ret = null;
        if (this.data) {
            // throw Exception if offset is negative or greater than the data length,
            // or the count is negative
            if (__ownerDocument__(this).implementation.errorChecking &&
                ((offset < 0) || (offset > this.data.length) || (count < 0))) {
                throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
            // if count is not specified
            if (!count) {
                ret = this.data.substring(offset); // default to 'end of string'
            }else{
                ret = this.data.substring(offset, offset + count);
            }
        }
        return ret;
    },
    toString : function(){
        return "[object CharacterData]";
    }
});

/**
 * @class  Text
 *      The Text interface represents the textual content (termed
 *      character data in XML) of an Element or Attr.
 *      If there is no markup inside an element's content, the text is
 *      contained in a single object implementing the Text interface that
 *      is the only child of the element. If there is markup, it is
 *      parsed into a list of elements and Text nodes that form the
 *      list of children of the element.
 * @extends CharacterData
 * @param  ownerDocument The Document object associated with this node.
 */
Text = function(ownerDocument) {
    CharacterData.apply(this, arguments);
    this.nodeName  = "#text";
};
Text.prototype = new CharacterData();
__extend__(Text.prototype,{
    get localName(){
        return null;
    },
    // Breaks this Text node into two Text nodes at the specified offset,
    // keeping both in the tree as siblings. This node then only contains
    // all the content up to the offset point.  And a new Text node, which
    // is inserted as the next sibling of this node, contains all the
    // content at and after the offset point.
    splitText : function(offset) {
        var data,
            inode;
        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Node is readonly
            if (this._readonly) {
              throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }
            // throw Exception if offset is negative or greater than the data length,
            if ((offset < 0) || (offset > this.data.length)) {
              throw(new DOMException(DOMException.INDEX_SIZE_ERR));
            }
        }
        if (this.parentNode) {
            // get remaining string (after offset)
            data  = this.substringData(offset);
            // create new TextNode with remaining string
            inode = __ownerDocument__(this).createTextNode(data);
            // attach new TextNode
            if (this.nextSibling) {
              this.parentNode.insertBefore(inode, this.nextSibling);
            } else {
              this.parentNode.appendChild(inode);
            }
            // remove remaining string from original TextNode
            this.deleteData(offset);
        }
        return inode;
    },
    get nodeType(){
        return Node.TEXT_NODE;
    },
    get xml(){
        return __escapeXML__(""+ this.nodeValue);
    },
    toString: function(){
        return "[object Text]";
    }
});

/**
 * @class CDATASection 
 *      CDATA sections are used to escape blocks of text containing 
 *      characters that would otherwise be regarded as markup.
 *      The only delimiter that is recognized in a CDATA section is 
 *      the "\]\]\>" string that ends the CDATA section
 * @extends Text
 * @param  ownerDocument : The Document object associated with this node.
 */
CDATASection = function(ownerDocument) {
    Text.apply(this, arguments);
    this.nodeName = '#cdata-section';
};
CDATASection.prototype = new Text();
__extend__(CDATASection.prototype,{
    get nodeType(){
        return Node.CDATA_SECTION_NODE;
    },
    get xml(){
        return "<![CDATA[" + this.nodeValue + "]]>";
    },
    toString : function(){
        return "[object CDATASection]";
    }
});
/**
 * @class  Comment
 *      This represents the content of a comment, i.e., all the
 *      characters between the starting '<!--' and ending '-->'
 * @extends CharacterData
 * @param  ownerDocument :  The Document object associated with this node.
 */
Comment = function(ownerDocument) {
    CharacterData.apply(this, arguments);
    this.nodeName  = "#comment";
};
Comment.prototype = new CharacterData();
__extend__(Comment.prototype, {
    get localName(){
        return null;
    },
    get nodeType(){
        return Node.COMMENT_NODE;
    },
    get xml(){
        return "<!--" + this.nodeValue + "-->";
    },
    toString : function(){
        return "[object Comment]";
    }
});


/**
 * @author envjs team
 * @param {Document} onwnerDocument
 */
DocumentType = function(ownerDocument) {
    Node.apply(this, arguments);
    this.systemId = null;
    this.publicId = null;
};
DocumentType.prototype = new Node();
__extend__({
    get name(){
        return this.nodeName;
    },
    get entities(){
        return null;
    },
    get internalSubsets(){
        return null;
    },
    get notations(){
        return null;
    },
    toString : function(){
        return "[object DocumentType]";
    }
});

/**
 * @class  Attr
 *      The Attr interface represents an attribute in an Element object
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
Attr = function(ownerDocument) {
    Node.apply(this, arguments);
    // set when Attr is added to NamedNodeMap
    this.ownerElement = null;
    //TODO: our implementation of Attr is incorrect because we don't
    //      treat the value of the attribute as a child text node.
};
Attr.prototype = new Node();
__extend__(Attr.prototype, {
    // the name of this attribute
    get name(){
        return this.nodeName;
    },
    // the value of the attribute is returned as a string
    get value(){
        return this.nodeValue||'';
    },
    set value(value){
        // throw Exception if Attribute is readonly
        if (__ownerDocument__(this).implementation.errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        // delegate to node
        this.nodeValue = value;
    },
    get textContent(){
        return this.nodeValue;
    },
    set textContent(newText){
        this.nodeValue = newText;
    },
    get specified(){
        return (this !== null && this !== undefined);
    },
    get nodeType(){
        return Node.ATTRIBUTE_NODE;
    },
    get xml() {
        if (this.nodeValue) {
            return  __escapeXML__(this.nodeValue+"");
        } else {
            return '';
        }
    },
    toString : function() {
        return '[object Attr]';
    }
});


/**
 * @class  Element -
 *      By far the vast majority of objects (apart from text)
 *      that authors encounter when traversing a document are
 *      Element nodes.
 * @extends Node
 * @param  ownerDocument : The Document object associated with this node.
 */
Element = function(ownerDocument) {
    Node.apply(this, arguments);
    this.attributes = new NamedNodeMap(this.ownerDocument, this);
};
Element.prototype = new Node();
__extend__(Element.prototype, {
    // The name of the element.
    get tagName(){
        return this.nodeName;
    },

    getAttribute: function(name) {
        var ret = null;
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
        if (attr) {
            ret = attr.value;
        }
        // if Attribute exists, return its value, otherwise, return null
        return ret;
    },
    setAttribute : function (name, value) {
        // if attribute exists, use it
        var attr = this.attributes.getNamedItem(name);
       //console.log('attr %s', attr);
        //I had to add this check because as the script initializes
        //the id may be set in the constructor, and the html element
        //overrides the id property with a getter/setter.
        if(__ownerDocument__(this)){
            if (attr===null||attr===undefined) {
                // otherwise create it
                attr = __ownerDocument__(this).createAttribute(name);
               //console.log('attr %s', attr);
            }


            // test for exceptions
            if (__ownerDocument__(this).implementation.errorChecking) {
                // throw Exception if Attribute is readonly
                if (attr._readonly) {
                    throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
                }

                // throw Exception if the value string contains an illegal character
                if (!__isValidString__(value+'')) {
                    throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
                }
            }

            // assign values to properties (and aliases)
            attr.value     = value + '';

            // add/replace Attribute in NamedNodeMap
            this.attributes.setNamedItem(attr);
           //console.log('element setNamedItem %s', attr);
        }else{
           console.warn('Element has no owner document '+this.tagName+
                '\n\t cant set attribute ' + name + ' = '+value );
        }
    },
    removeAttribute : function removeAttribute(name) {
        // delegate to NamedNodeMap.removeNamedItem
        return this.attributes.removeNamedItem(name);
    },
    getAttributeNode : function getAttributeNode(name) {
        // delegate to NamedNodeMap.getNamedItem
        return this.attributes.getNamedItem(name);
    },
    setAttributeNode: function(newAttr) {
        // if this Attribute is an ID
        if (__isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value;  // cache ID for getElementById()
        }
        // delegate to NamedNodeMap.setNamedItem
        return this.attributes.setNamedItem(newAttr);
    },
    removeAttributeNode: function(oldAttr) {
      // throw Exception if Attribute is readonly
      if (__ownerDocument__(this).implementation.errorChecking && oldAttr._readonly) {
        throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
      }

      // get item index
      var itemIndex = this.attributes._findItemIndex(oldAttr._id);

      // throw Exception if node does not exist in this map
      if (__ownerDocument__(this).implementation.errorChecking && (itemIndex < 0)) {
        throw(new DOMException(DOMException.NOT_FOUND_ERR));
      }

      return this.attributes._removeChild(itemIndex);
    },
    getAttributeNS : function(namespaceURI, localName) {
        var ret = "";
        // delegate to NAmedNodeMap.getNamedItemNS
        var attr = this.attributes.getNamedItemNS(namespaceURI, localName);
        if (attr) {
            ret = attr.value;
        }
        return ret;  // if Attribute exists, return its value, otherwise return ""
    },
    setAttributeNS : function(namespaceURI, qualifiedName, value) {
        // call NamedNodeMap.getNamedItem
        //console.log('setAttributeNS %s %s %s', namespaceURI, qualifiedName, value);
        var attr = this.attributes.getNamedItem(namespaceURI, qualifiedName);

        if (!attr) {  // if Attribute exists, use it
            // otherwise create it
            attr = __ownerDocument__(this).createAttributeNS(namespaceURI, qualifiedName);
        }

        value = '' + value;

        // test for exceptions
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if Attribute is readonly
            if (attr._readonly) {
                throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
            }

            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this.ownerDocument, namespaceURI, qualifiedName, true)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the value string contains an illegal character
            if (!__isValidString__(value)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }

        // if this Attribute is an ID
        //if (__isIdDeclaration__(name)) {
        //    this.id = value;
        //}

        // assign values to properties (and aliases)
        attr.value     = value;
        attr.nodeValue = value;

        // delegate to NamedNodeMap.setNamedItem
        this.attributes.setNamedItemNS(attr);
    },
    removeAttributeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap.removeNamedItemNS
        return this.attributes.removeNamedItemNS(namespaceURI, localName);
    },
    getAttributeNodeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap.getNamedItemNS
        return this.attributes.getNamedItemNS(namespaceURI, localName);
    },
    setAttributeNodeNS : function(newAttr) {
        // if this Attribute is an ID
        if ((newAttr.prefix == "") &&  __isIdDeclaration__(newAttr.name)) {
            this.id = newAttr.value+'';  // cache ID for getElementById()
        }

        // delegate to NamedNodeMap.setNamedItemNS
        return this.attributes.setNamedItemNS(newAttr);
    },
    hasAttribute : function(name) {
        // delegate to NamedNodeMap._hasAttribute
        return __hasAttribute__(this.attributes,name);
    },
    hasAttributeNS : function(namespaceURI, localName) {
        // delegate to NamedNodeMap._hasAttributeNS
        return __hasAttributeNS__(this.attributes, namespaceURI, localName);
    },
    get nodeType(){
        return Node.ELEMENT_NODE;
    },
    get xml() {
        var ret = "",
            ns = "",
            attrs,
            attrstring,
            i;

        // serialize namespace declarations
        if (this.namespaceURI ){
            if((this === this.ownerDocument.documentElement) ||
               (!this.parentNode)||
               (this.parentNode && (this.parentNode.namespaceURI !== this.namespaceURI))) {
                ns = ' xmlns' + (this.prefix?(':'+this.prefix):'') +
                    '="' + this.namespaceURI + '"';
            }
        }

        // serialize Attribute declarations
        attrs = this.attributes;
        attrstring = "";
        for(i=0;i< attrs.length;i++){
            if(attrs[i].name.match('xmlns:')) {
                attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
            }
        }
        for(i=0;i< attrs.length;i++){
            if(!attrs[i].name.match('xmlns:')) {
                attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
            }
        }

        if(this.hasChildNodes()){
            // serialize this Element
            ret += "<" + this.tagName + ns + attrstring +">";
            ret += this.childNodes.xml;
            ret += "</" + this.tagName + ">";
        }else{
            ret += "<" + this.tagName + ns + attrstring +"/>";
        }

        return ret;
    },
    toString : function(){
        return '[object Element]';
    }
});
/**
 * @class  DOMException - raised when an operation is impossible to perform
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  code : int - the exception code (one of the DOMException constants)
 */
DOMException = function(code) {
    this.code = code;
};

// DOMException constants
// Introduced in DOM Level 1:
DOMException.INDEX_SIZE_ERR                 = 1;
DOMException.DOMSTRING_SIZE_ERR             = 2;
DOMException.HIERARCHY_REQUEST_ERR          = 3;
DOMException.WRONG_DOCUMENT_ERR             = 4;
DOMException.INVALID_CHARACTER_ERR          = 5;
DOMException.NO_DATA_ALLOWED_ERR            = 6;
DOMException.NO_MODIFICATION_ALLOWED_ERR    = 7;
DOMException.NOT_FOUND_ERR                  = 8;
DOMException.NOT_SUPPORTED_ERR              = 9;
DOMException.INUSE_ATTRIBUTE_ERR            = 10;

// Introduced in DOM Level 2:
DOMException.INVALID_STATE_ERR              = 11;
DOMException.SYNTAX_ERR                     = 12;
DOMException.INVALID_MODIFICATION_ERR       = 13;
DOMException.NAMESPACE_ERR                  = 14;
DOMException.INVALID_ACCESS_ERR             = 15;

/**
 * @class  DocumentFragment -
 *      DocumentFragment is a "lightweight" or "minimal" Document object.
 * @extends Node
 * @param  ownerDocument :  The Document object associated with this node.
 */
DocumentFragment = function(ownerDocument) {
    Node.apply(this, arguments);
    this.nodeName  = "#document-fragment";
};
DocumentFragment.prototype = new Node();
__extend__(DocumentFragment.prototype,{
    get nodeType(){
        return Node.DOCUMENT_FRAGMENT_NODE;
    },
    get xml(){
        var xml = "",
        count = this.childNodes.length;

        // create string concatenating the serialized ChildNodes
        for (var i = 0; i < count; i++) {
            xml += this.childNodes.item(i).xml;
        }

        return xml;
    },
    toString : function(){
        return "[object DocumentFragment]";
    },
    get localName(){
        return null;
    }
});


/**
 * @class  ProcessingInstruction -
 *      The ProcessingInstruction interface represents a
 *      "processing instruction", used in XML as a way to
 *      keep processor-specific information in the text of
 *      the document
 * @extends Node
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  ownerDocument :  The Document object associated with this node.
 */
ProcessingInstruction = function(ownerDocument) {
    Node.apply(this, arguments);
};
ProcessingInstruction.prototype = new Node();
__extend__(ProcessingInstruction.prototype, {
    get data(){
        return this.nodeValue;
    },
    set data(data){
        // throw Exception if Node is readonly
        if (__ownerDocument__(this).errorChecking && this._readonly) {
            throw(new DOMException(DOMException.NO_MODIFICATION_ALLOWED_ERR));
        }
        this.nodeValue = data;
    },
    get textContent(){
        return this.data;
    },
    get localName(){
        return null;
    },
    get target(){
      // The target of this processing instruction.
      // XML defines this as being the first token following the markup that begins the processing instruction.
      // The content of this processing instruction.
        return this.nodeName;
    },
    set target(value){
      // The target of this processing instruction.
      // XML defines this as being the first token following the markup that begins the processing instruction.
      // The content of this processing instruction.
        this.nodeName = value;
    },
    get nodeType(){
        return Node.PROCESSING_INSTRUCTION_NODE;
    },
    get xml(){
        return "<?" + this.nodeName +" "+ this.nodeValue + "?>";
    },
    toString : function(){
        return "[object ProcessingInstruction]";
    }
});


/**
 * @author envjs team
 */

Entity = function() {
    throw new Error("Entity Not Implemented" );
};

Entity.constants = {
        // content taken from W3C "HTML 4.01 Specification"
        //                        "W3C Recommendation 24 December 1999"

    nbsp: "\u00A0",
    iexcl: "\u00A1",
    cent: "\u00A2",
    pound: "\u00A3",
    curren: "\u00A4",
    yen: "\u00A5",
    brvbar: "\u00A6",
    sect: "\u00A7",
    uml: "\u00A8",
    copy: "\u00A9",
    ordf: "\u00AA",
    laquo: "\u00AB",
    not: "\u00AC",
    shy: "\u00AD",
    reg: "\u00AE",
    macr: "\u00AF",
    deg: "\u00B0",
    plusmn: "\u00B1",
    sup2: "\u00B2",
    sup3: "\u00B3",
    acute: "\u00B4",
    micro: "\u00B5",
    para: "\u00B6",
    middot: "\u00B7",
    cedil: "\u00B8",
    sup1: "\u00B9",
    ordm: "\u00BA",
    raquo: "\u00BB",
    frac14: "\u00BC",
    frac12: "\u00BD",
    frac34: "\u00BE",
    iquest: "\u00BF",
    Agrave: "\u00C0",
    Aacute: "\u00C1",
    Acirc: "\u00C2",
    Atilde: "\u00C3",
    Auml: "\u00C4",
    Aring: "\u00C5",
    AElig: "\u00C6",
    Ccedil: "\u00C7",
    Egrave: "\u00C8",
    Eacute: "\u00C9",
    Ecirc: "\u00CA",
    Euml: "\u00CB",
    Igrave: "\u00CC",
    Iacute: "\u00CD",
    Icirc: "\u00CE",
    Iuml: "\u00CF",
    ETH: "\u00D0",
    Ntilde: "\u00D1",
    Ograve: "\u00D2",
    Oacute: "\u00D3",
    Ocirc: "\u00D4",
    Otilde: "\u00D5",
    Ouml: "\u00D6",
    times: "\u00D7",
    Oslash: "\u00D8",
    Ugrave: "\u00D9",
    Uacute: "\u00DA",
    Ucirc: "\u00DB",
    Uuml: "\u00DC",
    Yacute: "\u00DD",
    THORN: "\u00DE",
    szlig: "\u00DF",
    agrave: "\u00E0",
    aacute: "\u00E1",
    acirc: "\u00E2",
    atilde: "\u00E3",
    auml: "\u00E4",
    aring: "\u00E5",
    aelig: "\u00E6",
    ccedil: "\u00E7",
    egrave: "\u00E8",
    eacute: "\u00E9",
    ecirc: "\u00EA",
    euml: "\u00EB",
    igrave: "\u00EC",
    iacute: "\u00ED",
    icirc: "\u00EE",
    iuml: "\u00EF",
    eth: "\u00F0",
    ntilde: "\u00F1",
    ograve: "\u00F2",
    oacute: "\u00F3",
    ocirc: "\u00F4",
    otilde: "\u00F5",
    ouml: "\u00F6",
    divide: "\u00F7",
    oslash: "\u00F8",
    ugrave: "\u00F9",
    uacute: "\u00FA",
    ucirc: "\u00FB",
    uuml: "\u00FC",
    yacute: "\u00FD",
    thorn: "\u00FE",
    yuml: "\u00FF",
    fnof: "\u0192",
    Alpha: "\u0391",
    Beta: "\u0392",
    Gamma: "\u0393",
    Delta: "\u0394",
    Epsilon: "\u0395",
    Zeta: "\u0396",
    Eta: "\u0397",
    Theta: "\u0398",
    Iota: "\u0399",
    Kappa: "\u039A",
    Lambda: "\u039B",
    Mu: "\u039C",
    Nu: "\u039D",
    Xi: "\u039E",
    Omicron: "\u039F",
    Pi: "\u03A0",
    Rho: "\u03A1",
    Sigma: "\u03A3",
    Tau: "\u03A4",
    Upsilon: "\u03A5",
    Phi: "\u03A6",
    Chi: "\u03A7",
    Psi: "\u03A8",
    Omega: "\u03A9",
    alpha: "\u03B1",
    beta: "\u03B2",
    gamma: "\u03B3",
    delta: "\u03B4",
    epsilon: "\u03B5",
    zeta: "\u03B6",
    eta: "\u03B7",
    theta: "\u03B8",
    iota: "\u03B9",
    kappa: "\u03BA",
    lambda: "\u03BB",
    mu: "\u03BC",
    nu: "\u03BD",
    xi: "\u03BE",
    omicron: "\u03BF",
    pi: "\u03C0",
    rho: "\u03C1",
    sigmaf: "\u03C2",
    sigma: "\u03C3",
    tau: "\u03C4",
    upsilon: "\u03C5",
    phi: "\u03C6",
    chi: "\u03C7",
    psi: "\u03C8",
    omega: "\u03C9",
    thetasym: "\u03D1",
    upsih: "\u03D2",
    piv: "\u03D6",
    bull: "\u2022",
    hellip: "\u2026",
    prime: "\u2032",
    Prime: "\u2033",
    oline: "\u203E",
    frasl: "\u2044",
    weierp: "\u2118",
    image: "\u2111",
    real: "\u211C",
    trade: "\u2122",
    alefsym: "\u2135",
    larr: "\u2190",
    uarr: "\u2191",
    rarr: "\u2192",
    darr: "\u2193",
    harr: "\u2194",
    crarr: "\u21B5",
    lArr: "\u21D0",
    uArr: "\u21D1",
    rArr: "\u21D2",
    dArr: "\u21D3",
    hArr: "\u21D4",
    forall: "\u2200",
    part: "\u2202",
    exist: "\u2203",
    empty: "\u2205",
    nabla: "\u2207",
    isin: "\u2208",
    notin: "\u2209",
    ni: "\u220B",
    prod: "\u220F",
    sum: "\u2211",
    minus: "\u2212",
    lowast: "\u2217",
    radic: "\u221A",
    prop: "\u221D",
    infin: "\u221E",
    ang: "\u2220",
    and: "\u2227",
    or: "\u2228",
    cap: "\u2229",
    cup: "\u222A",
    intXX: "\u222B",
    there4: "\u2234",
    sim: "\u223C",
    cong: "\u2245",
    asymp: "\u2248",
    ne: "\u2260",
    equiv: "\u2261",
    le: "\u2264",
    ge: "\u2265",
    sub: "\u2282",
    sup: "\u2283",
    nsub: "\u2284",
    sube: "\u2286",
    supe: "\u2287",
    oplus: "\u2295",
    otimes: "\u2297",
    perp: "\u22A5",
    sdot: "\u22C5",
    lceil: "\u2308",
    rceil: "\u2309",
    lfloor: "\u230A",
    rfloor: "\u230B",
    lang: "\u2329",
    rang: "\u232A",
    loz: "\u25CA",
    spades: "\u2660",
    clubs: "\u2663",
    hearts: "\u2665",
    diams: "\u2666",
    quot: "\u0022",
    amp: "\u0026",
    lt: "\u003C",
    gt: "\u003E",
    OElig: "\u0152",
    oelig: "\u0153",
    Scaron: "\u0160",
    scaron: "\u0161",
    Yuml: "\u0178",
    circ: "\u02C6",
    tilde: "\u02DC",
    ensp: "\u2002",
    emsp: "\u2003",
    thinsp: "\u2009",
    zwnj: "\u200C",
    zwj: "\u200D",
    lrm: "\u200E",
    rlm: "\u200F",
    ndash: "\u2013",
    mdash: "\u2014",
    lsquo: "\u2018",
    rsquo: "\u2019",
    sbquo: "\u201A",
    ldquo: "\u201C",
    rdquo: "\u201D",
    bdquo: "\u201E",
    dagger: "\u2020",
    Dagger: "\u2021",
    permil: "\u2030",
    lsaquo: "\u2039",
    rsaquo: "\u203A",
    euro: "\u20AC",

    // non-standard entities
    apos: "'"
};

/**
 * @author envjs team
 */

EntityReference = function() {
    throw new Error("EntityReference Not Implemented" );
};

/**
 * @class  DOMImplementation -
 *      provides a number of methods for performing operations
 *      that are independent of any particular instance of the
 *      document object model.
 *
 * @author Jon van Noort (jon@webarcana.com.au)
 */
DOMImplementation = function() {
    this.preserveWhiteSpace = false;  // by default, ignore whitespace
    this.namespaceAware = true;       // by default, handle namespaces
    this.errorChecking  = true;      // by default, test for exceptions
};

__extend__(DOMImplementation.prototype,{
    // @param  feature : string - The package name of the feature to test.
    //      the legal only values are "XML" and "CORE" (case-insensitive).
    // @param  version : string - This is the version number of the package
    //       name to test. In Level 1, this is the string "1.0".*
    // @return : boolean
    hasFeature : function(feature, version) {
        var ret = false;
        if (feature.toLowerCase() == "xml") {
            ret = (!version || (version == "1.0") || (version == "2.0"));
        }
        else if (feature.toLowerCase() == "core") {
            ret = (!version || (version == "2.0"));
        }
        else if (feature == "http://www.w3.org/TR/SVG11/feature#BasicStructure") {
            ret = (version == "1.1");
        }
        return ret;
    },
    createDocumentType : function(qname, publicId, systemId){
        var doctype = new DocumentType();
        doctype.nodeName = qname?qname.toUpperCase():null;
        doctype.publicId = publicId?publicId:null;
        doctype.systemId = systemId?systemId:null;
        return doctype;
    },
    createDocument : function(nsuri, qname, doctype){

        var doc = null, documentElement;

        doc = new Document(this, null);
        if(doctype){
            doc.doctype = doctype;
        }

        if(nsuri && qname){
            documentElement = doc.createElementNS(nsuri, qname);
        }else if(qname){
            documentElement = doc.createElement(qname);
        }
        if(documentElement){
            doc.appendChild(documentElement);
        }
        return doc;
    },
    createHTMLDocument : function(title){
        var doc = new HTMLDocument($implementation, null, "");
        var html = doc.createElement("html"); doc.appendChild(html);
        var head = doc.createElement("head"); html.appendChild(head);
        var body = doc.createElement("body"); html.appendChild(body);
        var t = doc.createElement("title"); head.appendChild(t);
        if( title) {
            t.appendChild(doc.createTextNode(title));
        }
        return doc;
    },
    translateErrCode : function(code) {
        //convert DOMException Code to human readable error message;
      var msg = "";

      switch (code) {
        case DOMException.INDEX_SIZE_ERR :                // 1
           msg = "INDEX_SIZE_ERR: Index out of bounds";
           break;

        case DOMException.DOMSTRING_SIZE_ERR :            // 2
           msg = "DOMSTRING_SIZE_ERR: The resulting string is too long to fit in a DOMString";
           break;

        case DOMException.HIERARCHY_REQUEST_ERR :         // 3
           msg = "HIERARCHY_REQUEST_ERR: The Node can not be inserted at this location";
           break;

        case DOMException.WRONG_DOCUMENT_ERR :            // 4
           msg = "WRONG_DOCUMENT_ERR: The source and the destination Documents are not the same";
           break;

        case DOMException.INVALID_CHARACTER_ERR :         // 5
           msg = "INVALID_CHARACTER_ERR: The string contains an invalid character";
           break;

        case DOMException.NO_DATA_ALLOWED_ERR :           // 6
           msg = "NO_DATA_ALLOWED_ERR: This Node / NodeList does not support data";
           break;

        case DOMException.NO_MODIFICATION_ALLOWED_ERR :   // 7
           msg = "NO_MODIFICATION_ALLOWED_ERR: This object cannot be modified";
           break;

        case DOMException.NOT_FOUND_ERR :                 // 8
           msg = "NOT_FOUND_ERR: The item cannot be found";
           break;

        case DOMException.NOT_SUPPORTED_ERR :             // 9
           msg = "NOT_SUPPORTED_ERR: This implementation does not support function";
           break;

        case DOMException.INUSE_ATTRIBUTE_ERR :           // 10
           msg = "INUSE_ATTRIBUTE_ERR: The Attribute has already been assigned to another Element";
           break;

        // Introduced in DOM Level 2:
        case DOMException.INVALID_STATE_ERR :             // 11
           msg = "INVALID_STATE_ERR: The object is no longer usable";
           break;

        case DOMException.SYNTAX_ERR :                    // 12
           msg = "SYNTAX_ERR: Syntax error";
           break;

        case DOMException.INVALID_MODIFICATION_ERR :      // 13
           msg = "INVALID_MODIFICATION_ERR: Cannot change the type of the object";
           break;

        case DOMException.NAMESPACE_ERR :                 // 14
           msg = "NAMESPACE_ERR: The namespace declaration is incorrect";
           break;

        case DOMException.INVALID_ACCESS_ERR :            // 15
           msg = "INVALID_ACCESS_ERR: The object does not support this function";
           break;

        default :
           msg = "UNKNOWN: Unknown Exception Code ("+ code +")";
      }

      return msg;
    },
    toString : function(){
        return "[object DOMImplementation]";
    }
});



/**
 * @method DOMImplementation._isNamespaceDeclaration - Return true, if attributeName is a namespace declaration
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  attributeName : string - the attribute name
 * @return : boolean
 */
function __isNamespaceDeclaration__(attributeName) {
  // test if attributeName is 'xmlns'
  return (attributeName.indexOf('xmlns') > -1);
}

/**
 * @method DOMImplementation._isIdDeclaration - Return true, if attributeName is an id declaration
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  attributeName : string - the attribute name
 * @return : boolean
 */
function __isIdDeclaration__(attributeName) {
  // test if attributeName is 'id' (case insensitive)
  return attributeName?(attributeName.toLowerCase() == 'id'):false;
}

/**
 * @method DOMImplementation._isValidName - Return true,
 *   if name contains no invalid characters
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the candidate name
 * @return : boolean
 */
function __isValidName__(name) {
  // test if name contains only valid characters
  return name.match(re_validName);
}
var re_validName = /^[a-zA-Z_:][a-zA-Z0-9\.\-_:]*$/;

/**
 * @method DOMImplementation._isValidString - Return true, if string does not contain any illegal chars
 *  All of the characters 0 through 31 and character 127 are nonprinting control characters.
 *  With the exception of characters 09, 10, and 13, (Ox09, Ox0A, and Ox0D)
 *  Note: different from _isValidName in that ValidStrings may contain spaces
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  name : string - the candidate string
 * @return : boolean
 */
function __isValidString__(name) {
  // test that string does not contains invalid characters
  return (name.search(re_invalidStringChars) < 0);
}
var re_invalidStringChars = /\x01|\x02|\x03|\x04|\x05|\x06|\x07|\x08|\x0B|\x0C|\x0E|\x0F|\x10|\x11|\x12|\x13|\x14|\x15|\x16|\x17|\x18|\x19|\x1A|\x1B|\x1C|\x1D|\x1E|\x1F|\x7F/;

/**
 * @method DOMImplementation._parseNSName - parse the namespace name.
 *  if there is no colon, the
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  qualifiedName : string - The qualified name
 * @return : NSName - [
         .prefix        : string - The prefix part of the qname
         .namespaceName : string - The namespaceURI part of the qname
    ]
 */
function __parseNSName__(qualifiedName) {
    var resultNSName = {};
    // unless the qname has a namespaceName, the prefix is the entire String
    resultNSName.prefix          = qualifiedName;
    resultNSName.namespaceName   = "";
    // split on ':'
    var delimPos = qualifiedName.indexOf(':');
    if (delimPos > -1) {
        // get prefix
        resultNSName.prefix        = qualifiedName.substring(0, delimPos);
        // get namespaceName
        resultNSName.namespaceName = qualifiedName.substring(delimPos +1, qualifiedName.length);
    }
    return resultNSName;
}

/**
 * @method DOMImplementation._parseQName - parse the qualified name
 * @author Jon van Noort (jon@webarcana.com.au)
 * @param  qualifiedName : string - The qualified name
 * @return : QName
 */
function __parseQName__(qualifiedName) {
    var resultQName = {};
    // unless the qname has a prefix, the local name is the entire String
    resultQName.localName = qualifiedName;
    resultQName.prefix    = "";
    // split on ':'
    var delimPos = qualifiedName.indexOf(':');
    if (delimPos > -1) {
        // get prefix
        resultQName.prefix    = qualifiedName.substring(0, delimPos);
        // get localName
        resultQName.localName = qualifiedName.substring(delimPos +1, qualifiedName.length);
    }
    return resultQName;
}
/**
 * @author envjs team
 */
Notation = function() {
    throw new Error("Notation Not Implemented" );
};/**
 * @author thatcher
 */
Range = function(){

};

__extend__(Range.prototype, {
    get startContainer(){

    },
    get endContainer(){

    },
    get startOffset(){

    },
    get endOffset(){

    },
    get collapsed(){

    },
    get commonAncestorContainer(){

    },
    setStart: function(refNode, offset){//throws RangeException

    },
    setEnd: function(refNode, offset){//throws RangeException
    
    },
    setStartBefore: function(refNode){//throws RangeException
    
    },
    setStartAfter: function(refNode){//throws RangeException
    
    },
    setEndBefore: function(refNode){//throws RangeException
    
    },
    setEndAfter: function(refNode){//throws RangeException
    
    },
    collapse: function(toStart){//throws RangeException
    
    },
    selectNode: function(refNode){//throws RangeException
    
    },
    selectNodeContents: function(refNode){//throws RangeException
    
    },
    compareBoundaryPoints: function(how, sourceRange){

    },
    deleteContents: function(){

    },
    extractContents: function(){

    },
    cloneContents: function(){

    },
    insertNode: function(newNode){

    },
    surroundContents: function(newParent){

    },
    cloneRange: function(){

    },
    toString: function(){
        return '[object Range]';
    },
    detach: function(){

    }
});


  // CompareHow
Range.START_TO_START                 = 0;
Range.START_TO_END                   = 1;
Range.END_TO_END                     = 2;
Range.END_TO_START                   = 3;
  
/*
 * Forward declarations
 */
var __isValidNamespace__;

/**
 * @class  Document - The Document interface represents the entire HTML
 *      or XML document. Conceptually, it is the root of the document tree,
 *      and provides the primary access to the document's data.
 *
 * @extends Node
 * @param  implementation : DOMImplementation - the creator Implementation
 */
Document = function(implementation, docParentWindow) {
    Node.apply(this, arguments);

    //TODO: Temporary!!! Cnage back to true!!!
    this.async = true;
    // The Document Type Declaration (see DocumentType) associated with this document
    this.doctype = null;
    // The DOMImplementation object that handles this document.
    this.implementation = implementation;

    this.nodeName  = "#document";
    // initially false, set to true by parser
    this.parsing = false;
    this.baseURI = 'about:blank';

    this.ownerDocument = null;

    this.importing = false;
};

Document.prototype = new Node();
__extend__(Document.prototype,{
    get localName(){
        return null;
    },
    get textContent(){
        return null;
    },
    get all(){
        return this.getElementsByTagName("*");
    },
    get documentElement(){
        var i, length = this.childNodes?this.childNodes.length:0;
        for(i=0;i<length;i++){
            if(this.childNodes[i].nodeType === Node.ELEMENT_NODE){
                return this.childNodes[i];
            }
        }
        return null;
    },
    get documentURI(){
        return this.baseURI;
    },
    createExpression: function(xpath, nsuriMap){
        return new XPathExpression(xpath, nsuriMap);
    },
    createDocumentFragment: function() {
        var node = new DocumentFragment(this);
        return node;
    },
    createTextNode: function(data) {
        var node = new Text(this);
        node.data = data;
        return node;
    },
    createComment: function(data) {
        var node = new Comment(this);
        node.data = data;
        return node;
    },
    createCDATASection : function(data) {
        var node = new CDATASection(this);
        node.data = data;
        return node;
    },
    createProcessingInstruction: function(target, data) {
        // throw Exception if the target string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(target))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }

        var node = new ProcessingInstruction(this);
        node.target = target;
        node.data = data;
        return node;
    },
    createElement: function(tagName) {
        // throw Exception if the tagName string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(tagName))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }
        var node = new Element(this);
        node.nodeName = tagName;
        return node;
    },
    createElementNS : function(namespaceURI, qualifiedName) {
        //we use this as a parser flag to ignore the xhtml
        //namespace assumed by the parser
        //console.log('creating element %s %s', namespaceURI, qualifiedName);
        if(this.baseURI === 'http://envjs.com/xml' &&
            namespaceURI === 'http://www.w3.org/1999/xhtml'){
            return this.createElement(qualifiedName);
        }
        //console.log('createElementNS %s %s', namespaceURI, qualifiedName);
        if (__ownerDocument__(this).implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }
        var node  = new Element(this);
        var qname = __parseQName__(qualifiedName);
        node.namespaceURI = namespaceURI;
        node.prefix       = qname.prefix;
        node.nodeName     = qualifiedName;

        //console.log('created element %s %s', namespaceURI, qualifiedName);
        return node;
    },
    createAttribute : function(name) {
        //console.log('createAttribute %s ', name);
        // throw Exception if the name string contains an illegal character
        if (__ownerDocument__(this).implementation.errorChecking &&
            (!__isValidName__(name))) {
            throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
        }
        var node = new Attr(this);
        node.nodeName = name;
        return node;
    },
    createAttributeNS : function(namespaceURI, qualifiedName) {
        //we use this as a parser flag to ignore the xhtml
        //namespace assumed by the parser
        if(this.baseURI === 'http://envjs.com/xml' &&
            namespaceURI === 'http://www.w3.org/1999/xhtml'){
            return this.createAttribute(qualifiedName);
        }
        //console.log('createAttributeNS %s %s', namespaceURI, qualifiedName);
        // test for exceptions
        if (this.implementation.errorChecking) {
            // throw Exception if the Namespace is invalid
            if (!__isValidNamespace__(this, namespaceURI, qualifiedName, true)) {
                throw(new DOMException(DOMException.NAMESPACE_ERR));
            }

            // throw Exception if the qualifiedName string contains an illegal character
            if (!__isValidName__(qualifiedName)) {
                throw(new DOMException(DOMException.INVALID_CHARACTER_ERR));
            }
        }
        var node  = new Attr(this);
        var qname = __parseQName__(qualifiedName);
        node.namespaceURI = namespaceURI === '' ? null : namespaceURI;
        node.prefix       = qname.prefix;
        node.nodeName     = qualifiedName;
        node.nodeValue    = "";
        //console.log('attribute %s %s %s', node.namespaceURI, node.prefix, node.nodeName);
        return node;
    },
    createNamespace : function(qualifiedName) {
        //console.log('createNamespace %s', qualifiedName);
        // create Namespace specifying 'this' as ownerDocument
        var node  = new Namespace(this);
        var qname = __parseQName__(qualifiedName);

        // assign values to properties (and aliases)
        node.prefix       = qname.prefix;
        node.localName    = qname.localName;
        node.name         = qualifiedName;
        node.nodeValue    = "";

        return node;
    },

    createRange: function(){
        return new Range();
    },

    evaluate: function(xpathText, contextNode, nsuriMapper, resultType, result){
        //return new XPathExpression().evaluate();
        throw Error('Document.evaluate not supported yet!');
    },

    getElementById : function(elementId) {
        var retNode = null,
            node;
        // loop through all Elements
        var all = this.getElementsByTagName('*');
        for (var i=0; i < all.length; i++) {
            node = all[i];
            // if id matches
            if (node.id == elementId) {
                //found the node
                retNode = node;
                break;
            }
        }
        return retNode;
    },
    normalizeDocument: function(){
        this.normalize();
    },
    get nodeType(){
        return Node.DOCUMENT_NODE;
    },
    get xml(){
        return this.documentElement.xml;
    },
    toString: function(){
        return "[object XMLDocument]";
    },
    get defaultView(){
        return { getComputedStyle: function(elem){
            return window.getComputedStyle(elem);
        }};
    },
});

/*
 * Helper function
 *
 */
__isValidNamespace__ = function(doc, namespaceURI, qualifiedName, isAttribute) {

    if (doc.importing === true) {
        //we're doing an importNode operation (or a cloneNode) - in both cases, there
        //is no need to perform any namespace checking since the nodes have to have been valid
        //to have gotten into the DOM in the first place
        return true;
    }

    var valid = true;
    // parse QName
    var qName = __parseQName__(qualifiedName);


    //only check for namespaces if we're finished parsing
    if (this.parsing === false) {

        // if the qualifiedName is malformed
        if (qName.localName.indexOf(":") > -1 ){
            valid = false;
        }

        if ((valid) && (!isAttribute)) {
            // if the namespaceURI is not null
            if (!namespaceURI) {
                valid = false;
            }
        }

        // if the qualifiedName has a prefix
        if ((valid) && (qName.prefix === "")) {
            valid = false;
        }
    }

    // if the qualifiedName has a prefix that is "xml" and the namespaceURI is
    //  different from "http://www.w3.org/XML/1998/namespace" [Namespaces].
    if ((valid) && (qName.prefix === "xml") && (namespaceURI !== "http://www.w3.org/XML/1998/namespace")) {
        valid = false;
    }

    return valid;
};
/**
 *
 * This file only handles XML parser.
 * It is extended by parser/domparser.js (and parser/htmlparser.js)
 *
 * This depends on e4x, which some engines may not have.
 *
 * @author thatcher
 */
DOMParser = function(principle, documentURI, baseURI) {
    // TODO: why/what should these 3 args do?
};
__extend__(DOMParser.prototype,{
    parseFromString: function(xmlstring, mimetype){
        var doc = new Document(new DOMImplementation()),
            e4;

        // The following are e4x directives.
        // Full spec is here:
        // http://www.ecma-international.org/publications/standards/Ecma-357.htm
        //
        // that is pretty gross, so checkout this summary
        // http://rephrase.net/days/07/06/e4x
        //
        // also see the Mozilla Developer Center:
        // https://developer.mozilla.org/en/E4X
        //
        XML.ignoreComments = false;
        XML.ignoreProcessingInstructions = false;
        XML.ignoreWhitespace = false;

        // for some reason e4x can't handle initial xml declarations
        // https://bugzilla.mozilla.org/show_bug.cgi?id=336551
        // The official workaround is the big regexp below
        // but simpler one seems to be ok
        // xmlstring = xmlstring.replace(/^<\?xml\s+version\s*=\s*(["'])[^\1]+\1[^?]*\?>/, "");
        //
        xmlstring = xmlstring.replace(/<\?xml.*\?>/, '');

        e4 = new XMLList(xmlstring);

        __toDomNode__(e4, doc, doc);

        //console.log('xml \n %s', doc.documentElement.xml);
        return doc;
    }
});

var __toDomNode__ = function(e4, parent, doc){
    var xnode,
        domnode,
        children,
        target,
        value,
        length,
        element,
        kind,
        item;
    //console.log('converting e4x node list \n %s', e4)

    // not using the for each(item in e4) since some engines can't
    // handle the syntax (i.e. says syntax error)
    //
    // for each(xnode in e4) {
    for (item in e4) {
        // NO do not do this if (e4.hasOwnProperty(item)) {
        // breaks spidermonkey
        xnode = e4[item];

        kind = xnode.nodeKind();
        //console.log('treating node kind %s', kind);
        switch(kind){
        case 'element':
            // add node
            //console.log('creating element %s %s', xnode.localName(), xnode.namespace());
            if(xnode.namespace() && (xnode.namespace()+'') !== ''){
                //console.log('createElementNS %s %s',xnode.namespace()+'', xnode.localName() );
                domnode = doc.createElementNS(xnode.namespace()+'', xnode.localName());
            }else{
                domnode = doc.createElement(xnode.name()+'');
            }
            parent.appendChild(domnode);

            // add attributes
            __toDomNode__(xnode.attributes(), domnode, doc);

            // add children
            children = xnode.children();
            length = children.length();
            //console.log('recursing? %s', length ? 'yes' : 'no');
            if (length > 0) {
                __toDomNode__(children, domnode, doc);
            }
            break;
        case 'attribute':
            // console.log('setting attribute %s %s %s',
            //       xnode.localName(), xnode.namespace(), xnode.valueOf());

            //
            // cross-platform alert.  The original code used
            //  xnode.text() to get the attribute value
            //  This worked in Rhino, but did not in Spidermonkey
            //  valueOf seemed to work in both
            //
            if(xnode.namespace() && xnode.namespace().prefix){
                //console.log("%s", xnode.namespace().prefix);
                parent.setAttributeNS(xnode.namespace()+'',
                                      xnode.namespace().prefix+':'+xnode.localName(),
                                      xnode.valueOf());
            }else if((xnode.name()+'').match('http://www.w3.org/2000/xmlns/::')){
                if(xnode.localName()!=='xmlns'){
                    parent.setAttributeNS('http://www.w3.org/2000/xmlns/',
                                          'xmlns:'+xnode.localName(),
                                          xnode.valueOf());
                }
            }else{
                parent.setAttribute(xnode.localName()+'', xnode.valueOf());
            }
            break;
        case 'text':
            //console.log('creating text node : %s', xnode);
            domnode = doc.createTextNode(xnode+'');
            parent.appendChild(domnode);
            break;
        case 'comment':
            //console.log('creating comment node : %s', xnode);
            value = xnode+'';
            domnode = doc.createComment(value.substring(4,value.length-3));
            parent.appendChild(domnode);
            break;
        case 'processing-instruction':
            //console.log('creating processing-instruction node : %s', xnode);
            value = xnode+'';
            target = value.split(' ')[0].substring(2);
            value = value.split(' ').splice(1).join(' ').replace('?>','');
            //console.log('creating processing-instruction data : %s', value);
            domnode = doc.createProcessingInstruction(target, value);
            parent.appendChild(domnode);
            break;
        default:
            console.log('e4x DOM ERROR');
            throw new Error("Assertion failed in xml parser");
        }
    }
};
/**
 * @author envjs team
 * @class XMLSerializer
 */

XMLSerializer = function() {};

__extend__(XMLSerializer.prototype, {
    serializeToString: function(node){
        return node.xml;
    },
    toString : function(){
        return "[object XMLSerializer]";
    }
});

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Envjs event.1.2.35
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 *
 * This file simply provides the global definitions we need to
 * be able to correctly implement to core browser DOM Event interfaces.
 */
/*var Event,
    MouseEvent,
    UIEvent,
    KeyboardEvent,
    MutationEvent,
    DocumentEvent,
    EventTarget,
    EventException,
    //nonstandard but very useful for implementing mutation events
    //among other things like general profiling
    Aspect;*/
/*
 * Envjs event.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}
/**
 * Borrowed with love from:
 * 
 * jQuery AOP - jQuery plugin to add features of aspect-oriented programming (AOP) to jQuery.
 * http://jquery-aop.googlecode.com/
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Version: 1.1
 */
(function() {

	var _after	= 1;
	var _before	= 2;
	var _around	= 3;
	var _intro  = 4;
	var _regexEnabled = true;

	/**
	 * Private weaving function.
	 */
	var weaveOne = function(source, method, advice) {

		var old = source[method];

		var aspect;
		if (advice.type == _after)
			aspect = function() {
				var returnValue = old.apply(this, arguments);
				return advice.value.apply(this, [returnValue, method]);
			};
		else if (advice.type == _before)
			aspect = function() {
				advice.value.apply(this, [arguments, method]);
				return old.apply(this, arguments);
			};
		else if (advice.type == _intro)
			aspect = function() {
				return advice.value.apply(this, arguments);
			};
		else if (advice.type == _around) {
			aspect = function() {
				var invocation = { object: this, args: arguments };
				return advice.value.apply(invocation.object, [{ arguments: invocation.args, method: method, proceed : 
					function() {
						return old.apply(invocation.object, invocation.args);
					}
				}] );
			};
		}

		aspect.unweave = function() { 
			source[method] = old;
			pointcut = source = aspect = old = null;
		};

		source[method] = aspect;

		return aspect;

	};


	/**
	 * Private weaver and pointcut parser.
	 */
	var weave = function(pointcut, advice)
	{

		var source = (typeof(pointcut.target.prototype) != 'undefined') ? pointcut.target.prototype : pointcut.target;
		var advices = [];

		// If it's not an introduction and no method was found, try with regex...
		if (advice.type != _intro && typeof(source[pointcut.method]) == 'undefined')
		{

			for (var method in source)
			{
				if (source[method] != null && source[method] instanceof Function && method.match(pointcut.method))
				{
					advices[advices.length] = weaveOne(source, method, advice);
				}
			}

			if (advices.length == 0)
				throw 'No method: ' + pointcut.method;

		} 
		else
		{
			// Return as an array of one element
			advices[0] = weaveOne(source, pointcut.method, advice);
		}

		return _regexEnabled ? advices : advices[0];

	};

	Aspect = 
	{
		/**
		 * Creates an advice after the defined point-cut. The advice will be executed after the point-cut method 
		 * has completed execution successfully, and will receive one parameter with the result of the execution.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.after( {target: window, method: 'MyGlobalMethod'}, function(result) { alert('Returned: ' + result); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.after( {target: String, method: 'indexOf'}, function(index) { alert('Result found at: ' + index + ' on:' + this); } );
		 * @result Array<Function>
		 *
		 * @name after
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called after the execution of the point-cut. It receives one parameter
		 *                        with the result of the point-cut's execution.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		after : function(pointcut, advice)
		{
			return weave( pointcut, { type: _after, value: advice } );
		},

		/**
		 * Creates an advice before the defined point-cut. The advice will be executed before the point-cut method 
		 * but cannot modify the behavior of the method, or prevent its execution.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.before( {target: window, method: 'MyGlobalMethod'}, function() { alert('About to execute MyGlobalMethod'); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.before( {target: String, method: 'indexOf'}, function(index) { alert('About to execute String.indexOf on: ' + this); } );
		 * @result Array<Function>
		 *
		 * @name before
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called before the execution of the point-cut.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		before : function(pointcut, advice)
		{
			return weave( pointcut, { type: _before, value: advice } );
		},


		/**
		 * Creates an advice 'around' the defined point-cut. This type of advice can control the point-cut method execution by calling
		 * the functions '.proceed()' on the 'invocation' object, and also, can modify the arguments collection before sending them to the function call.
		 * This function returns an array of weaved aspects (Function).
		 *
		 * @example jQuery.aop.around( {target: window, method: 'MyGlobalMethod'}, function(invocation) {
		 *                alert('# of Arguments: ' + invocation.arguments.length); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.around( {target: String, method: 'indexOf'}, function(invocation) { 
		 *                alert('Searching: ' + invocation.arguments[0] + ' on: ' + this); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.around( {target: window, method: /Get(\d+)/}, function(invocation) {
		 *                alert('Executing ' + invocation.method); 
		 *                return invocation.proceed(); 
		 *          } );
		 * @desc Matches all global methods starting with 'Get' and followed by a number.
		 * @result Array<Function>
		 *
		 *
		 * @name around
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved. Regex are supported, but not on built-in objects.
		 * @param Function advice Function containing the code that will get called around the execution of the point-cut. This advice will be called with one
		 *                        argument containing one function '.proceed()', the collection of arguments '.arguments', and the matched method name '.method'.
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		around : function(pointcut, advice)
		{
			return weave( pointcut, { type: _around, value: advice } );
		},

		/**
		 * Creates an introduction on the defined point-cut. This type of advice replaces any existing methods with the same
		 * name. To restore them, just unweave it.
		 * This function returns an array with only one weaved aspect (Function).
		 *
		 * @example jQuery.aop.introduction( {target: window, method: 'MyGlobalMethod'}, function(result) { alert('Returned: ' + result); } );
		 * @result Array<Function>
		 *
		 * @example jQuery.aop.introduction( {target: String, method: 'log'}, function() { alert('Console: ' + this); } );
		 * @result Array<Function>
		 *
		 * @name introduction
		 * @param Map pointcut Definition of the point-cut to apply the advice. A point-cut is the definition of the object/s and method/s to be weaved.
		 * @option Object target Target object to be weaved. 
		 * @option String method Name of the function to be weaved.
		 * @param Function advice Function containing the code that will be executed on the point-cut. 
		 *
		 * @type Array<Function>
		 * @cat Plugins/General
		 */
		introduction : function(pointcut, advice)
		{
			return weave( pointcut, { type: _intro, value: advice } );
		},
		
		/**
		 * Configures global options.
		 *
		 * @name setup
		 * @param Map settings Configuration options.
		 * @option Boolean regexMatch Enables/disables regex matching of method names.
		 *
		 * @example jQuery.aop.setup( { regexMatch: false } );
		 * @desc Disable regex matching.
		 *
		 * @type Void
		 * @cat Plugins/General
		 */
		setup: function(settings)
		{
			_regexEnabled = settings.regexMatch;
		}
	};

})();




/**
 * @name EventTarget
 * @w3c:domlevel 2
 * @uri -//TODO: paste dom event level 2 w3c spc uri here
 */
EventTarget = function(){};
EventTarget.prototype.addEventListener = function(type, fn, phase){
    __addEventListener__(this, type, fn, phase);
};
EventTarget.prototype.removeEventListener = function(type, fn){
    __removeEventListener__(this, type, fn);
};
EventTarget.prototype.dispatchEvent = function(event, bubbles){
    __dispatchEvent__(this, event, bubbles);
};

__extend__(Node.prototype, EventTarget.prototype);


var $events = [{}];

function __addEventListener__(target, type, fn, phase){
    phase = !!phase?"CAPTURING":"BUBBLING";
    if ( !target.uuid ) {
        //console.log('event uuid %s %s', target, target.uuid);
        target.uuid = $events.length+'';
    }
    if ( !$events[target.uuid] ) {
        //console.log('creating listener for target: %s %s', target, target.uuid);
        $events[target.uuid] = {};
    }
    if ( !$events[target.uuid][type] ){
        //console.log('creating listener for type: %s %s %s', target, target.uuid, type);
        $events[target.uuid][type] = {
            CAPTURING:[],
            BUBBLING:[]
        };
    }
    if ( $events[target.uuid][type][phase].indexOf( fn ) < 0 ){
        //console.log('adding event listener %s %s %s %s %s %s', target, target.uuid, type, phase,
        //    $events[target.uuid][type][phase].length, $events[target.uuid][type][phase].indexOf( fn ));
        //console.log('creating listener for function: %s %s %s', target, target.uuid, phase);
        $events[target.uuid][type][phase].push( fn );
        //console.log('adding event listener %s %s %s %s %s %s', target, target.uuid, type, phase,
        //    $events[target.uuid][type][phase].length, $events[target.uuid][type][phase].indexOf( fn ));
    }
    //console.log('registered event listeners %s', $events.length);
}

function __removeEventListener__(target, type, fn, phase){

    phase = !!phase?"CAPTURING":"BUBBLING";
    if ( !target.uuid ) {
        return;
    }
    if ( !$events[target.uuid] ) {
        return;
    }
    if(type == '*'){
        //used to clean all event listeners for a given node
        //console.log('cleaning all event listeners for node %s %s',target, target.uuid);
        delete $events[target.uuid];
        return;
    }else if ( !$events[target.uuid][type] ){
        return;
    }
    $events[target.uuid][type][phase] =
    $events[target.uuid][type][phase].filter(function(f){
        //console.log('removing event listener %s %s %s %s', target, type, phase, fn);
        return f != fn;
    });
}

var __eventuuid__ = 0;
function __dispatchEvent__(target, event, bubbles){

    if (!event.uuid) {
        event.uuid = __eventuuid__++;
    }
    //the window scope defines the $event object, for IE(^^^) compatibility;
    //$event = event;
    //console.log('dispatching event %s', event.uuid);
    if (bubbles === undefined || bubbles === null) {
        bubbles = true;
    }

    if (!event.target) {
        event.target = target;
    }

    //console.log('dispatching? %s %s %s', target, event.type, bubbles);
    if ( event.type && (target.nodeType || target === window )) {

        //console.log('dispatching event %s %s %s', target, event.type, bubbles);
        __captureEvent__(target, event);

        event.eventPhase = Event.AT_TARGET;
        if ( target.uuid && $events[target.uuid] && $events[target.uuid][event.type] ) {
            event.currentTarget = target;
            //console.log('dispatching %s %s %s %s', target, event.type,
            //  $events[target.uuid][event.type]['CAPTURING'].length);
            $events[target.uuid][event.type].CAPTURING.forEach(function(fn){
                //console.log('AT_TARGET (CAPTURING) event %s', fn);
                var returnValue = fn( event );
                //console.log('AT_TARGET (CAPTURING) return value %s', returnValue);
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
            //console.log('dispatching %s %s %s %s', target, event.type,
            //  $events[target.uuid][event.type]['BUBBLING'].length);
            $events[target.uuid][event.type].BUBBLING.forEach(function(fn){
                //console.log('AT_TARGET (BUBBLING) event %s', fn);
                var returnValue = fn( event );
                //console.log('AT_TARGET (BUBBLING) return value %s', returnValue);
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
        }
        if (target["on" + event.type]) {
            target["on" + event.type](event);
        }
        if (bubbles && !event.cancelled){
            __bubbleEvent__(target, event);
        }
        if(!event._preventDefault){
            //At this point I'm guessing that just HTMLEvents are concerned
            //with default behavior being executed in a browser but I could be
            //wrong as usual.  The goal is much more to filter at this point
            //what events have no need to be handled
            //console.log('triggering default behavior for %s', event.type);
            if(event.type in Envjs.defaultEventBehaviors){
                Envjs.defaultEventBehaviors[event.type](event);
            }
        }
        //console.log('deleting event %s', event.uuid);
        event.target = null;
        event = null;
    }else{
        throw new EventException(EventException.UNSPECIFIED_EVENT_TYPE_ERR);
    }
}

function __captureEvent__(target, event){
    var ancestorStack = [],
        parent = target.parentNode;

    event.eventPhase = Event.CAPTURING_PHASE;
    while(parent){
        if(parent.uuid && $events[parent.uuid] && $events[parent.uuid][event.type]){
            ancestorStack.push(parent);
        }
        parent = parent.parentNode;
    }
    while(ancestorStack.length && !event.cancelled){
        event.currentTarget = ancestorStack.pop();
        if($events[event.currentTarget.uuid] && $events[event.currentTarget.uuid][event.type]){
            $events[event.currentTarget.uuid][event.type].CAPTURING.forEach(function(fn){
                var returnValue = fn( event );
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
        }
    }
}

function __bubbleEvent__(target, event){
    var parent = target.parentNode;
    event.eventPhase = Event.BUBBLING_PHASE;
    while(parent){
        if(parent.uuid && $events[parent.uuid] && $events[parent.uuid][event.type] ){
            event.currentTarget = parent;
            $events[event.currentTarget.uuid][event.type].BUBBLING.forEach(function(fn){
                var returnValue = fn( event );
                if(returnValue === false){
                    event.stopPropagation();
                }
            });
        }
        parent = parent.parentNode;
    }
}

/**
 * @class Event
 */
Event = function(options){
    // event state is kept read-only by forcing
    // a new object for each event.  This may not
    // be appropriate in the long run and we'll
    // have to decide if we simply dont adhere to
    // the read-only restriction of the specification
    this._bubbles = true;
    this._cancelable = true;
    this._cancelled = false;
    this._currentTarget = null;
    this._target = null;
    this._eventPhase = Event.AT_TARGET;
    this._timeStamp = new Date().getTime();
    this._preventDefault = false;
    this._stopPropogation = false;
};

__extend__(Event.prototype,{
    get bubbles(){return this._bubbles;},
    get cancelable(){return this._cancelable;},
    get currentTarget(){return this._currentTarget;},
    set currentTarget(currentTarget){ this._currentTarget = currentTarget; },
    get eventPhase(){return this._eventPhase;},
    set eventPhase(eventPhase){this._eventPhase = eventPhase;},
    get target(){return this._target;},
    set target(target){ this._target = target;},
    get timeStamp(){return this._timeStamp;},
    get type(){return this._type;},
    initEvent: function(type, bubbles, cancelable){
        this._type=type?type:'';
        this._bubbles=!!bubbles;
        this._cancelable=!!cancelable;
    },
    preventDefault: function(){
        this._preventDefault = true;
    },
    stopPropagation: function(){
        if(this._cancelable){
            this._cancelled = true;
            this._bubbles = false;
        }
    },
    get cancelled(){
        return this._cancelled;
    },
    toString: function(){
        return '[object Event]';
    }
});

__extend__(Event,{
    CAPTURING_PHASE : 1,
    AT_TARGET       : 2,
    BUBBLING_PHASE  : 3
});



/**
 * @name UIEvent
 * @param {Object} options
 */
UIEvent = function(options) {
    this._view = null;
    this._detail = 0;
};

UIEvent.prototype = new Event();
__extend__(UIEvent.prototype,{
    get view(){
        return this._view;
    },
    get detail(){
        return this._detail;
    },
    initUIEvent: function(type, bubbles, cancelable, windowObject, detail){
        this.initEvent(type, bubbles, cancelable);
        this._detail = 0;
        this._view = windowObject;
    }
});

var $onblur,
    $onfocus,
    $onresize;


/**
 * @name MouseEvent
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
MouseEvent = function(options) {
    this._screenX= 0;
    this._screenY= 0;
    this._clientX= 0;
    this._clientY= 0;
    this._ctrlKey= false;
    this._metaKey= false;
    this._altKey= false;
    this._button= null;
    this._relatedTarget= null;
};
MouseEvent.prototype = new UIEvent();
__extend__(MouseEvent.prototype,{
    get screenX(){
        return this._screenX;
    },
    get screenY(){
        return this._screenY;
    },
    get clientX(){
        return this._clientX;
    },
    get clientY(){
        return this._clientY;
    },
    get ctrlKey(){
        return this._ctrlKey;
    },
    get altKey(){
        return this._altKey;
    },
    get shiftKey(){
        return this._shiftKey;
    },
    get metaKey(){
        return this._metaKey;
    },
    get button(){
        return this._button;
    },
    get relatedTarget(){
        return this._relatedTarget;
    },
    initMouseEvent: function(type, bubbles, cancelable, windowObject, detail,
            screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, 
            metaKey, button, relatedTarget){
        this.initUIEvent(type, bubbles, cancelable, windowObject, detail);
        this._screenX = screenX;
        this._screenY = screenY;
        this._clientX = clientX;
        this._clientY = clientY;
        this._ctrlKey = ctrlKey;
        this._altKey = altKey;
        this._shiftKey = shiftKey;
        this._metaKey = metaKey;
        this._button = button;
        this._relatedTarget = relatedTarget;
    }
});

/**
 * Interface KeyboardEvent (introduced in DOM Level 3)
 */
KeyboardEvent = function(options) {
    this._keyIdentifier = 0;
    this._keyLocation = 0;
    this._ctrlKey = false;
    this._metaKey = false;
    this._altKey = false;
    this._metaKey = false;
};
KeyboardEvent.prototype = new UIEvent();

__extend__(KeyboardEvent.prototype,{

    get ctrlKey(){
        return this._ctrlKey;
    },
    get altKey(){
        return this._altKey;
    },
    get shiftKey(){
        return this._shiftKey;
    },
    get metaKey(){
        return this._metaKey;
    },
    get button(){
        return this._button;
    },
    get relatedTarget(){
        return this._relatedTarget;
    },
    getModifiersState: function(keyIdentifier){

    },
    initMouseEvent: function(type, bubbles, cancelable, windowObject,
            keyIdentifier, keyLocation, modifiersList, repeat){
        this.initUIEvent(type, bubbles, cancelable, windowObject, 0);
        this._keyIdentifier = keyIdentifier;
        this._keyLocation = keyLocation;
        this._modifiersList = modifiersList;
        this._repeat = repeat;
    }
});

KeyboardEvent.DOM_KEY_LOCATION_STANDARD      = 0;
KeyboardEvent.DOM_KEY_LOCATION_LEFT          = 1;
KeyboardEvent.DOM_KEY_LOCATION_RIGHT         = 2;
KeyboardEvent.DOM_KEY_LOCATION_NUMPAD        = 3;
KeyboardEvent.DOM_KEY_LOCATION_MOBILE        = 4;
KeyboardEvent.DOM_KEY_LOCATION_JOYSTICK      = 5;



//We dont fire mutation events until someone has registered for them
var __supportedMutations__ = /DOMSubtreeModified|DOMNodeInserted|DOMNodeRemoved|DOMAttrModified|DOMCharacterDataModified/;

var __fireMutationEvents__ = Aspect.before({
    target: EventTarget,
    method: 'addEventListener'
}, function(target, type){
    if(type && type.match(__supportedMutations__)){
        //unweaving removes the __addEventListener__ aspect
        __fireMutationEvents__.unweave();
        // These two methods are enough to cover all dom 2 manipulations
        Aspect.around({
            target: Node,
            method:"removeChild"
        }, function(invocation){
            var event,
                node = invocation.arguments[0];
            event = node.ownerDocument.createEvent('MutationEvents');
            event.initEvent('DOMNodeRemoved', true, false, node.parentNode, null, null, null, null);
            node.dispatchEvent(event, false);
            return invocation.proceed();

        });
        Aspect.around({
            target: Node,
            method:"appendChild"
        }, function(invocation) {
            var event,
                node = invocation.proceed();
            event = node.ownerDocument.createEvent('MutationEvents');
            event.initEvent('DOMNodeInserted', true, false, node.parentNode, null, null, null, null);
            node.dispatchEvent(event, false);
            return node;
        });
    }
});

/**
 * @name MutationEvent
 * @param {Object} options
 */
MutationEvent = function(options) {
    this._cancelable = false;
    this._timeStamp = 0;
};

MutationEvent.prototype = new Event();
__extend__(MutationEvent.prototype,{
    get relatedNode(){
        return this._relatedNode;
    },
    get prevValue(){
        return this._prevValue;
    },
    get newValue(){
        return this._newValue;
    },
    get attrName(){
        return this._attrName;
    },
    get attrChange(){
        return this._attrChange;
    },
    initMutationEvent: function( type, bubbles, cancelable,
            relatedNode, prevValue, newValue, attrName, attrChange ){
        this._relatedNode = relatedNode;
        this._prevValue = prevValue;
        this._newValue = newValue;
        this._attrName = attrName;
        this._attrChange = attrChange;
        switch(type){
            case "DOMSubtreeModified":
                this.initEvent(type, true, false);
                break;
            case "DOMNodeInserted":
                this.initEvent(type, true, false);
                break;
            case "DOMNodeRemoved":
                this.initEvent(type, true, false);
                break;
            case "DOMNodeRemovedFromDocument":
                this.initEvent(type, false, false);
                break;
            case "DOMNodeInsertedIntoDocument":
                this.initEvent(type, false, false);
                break;
            case "DOMAttrModified":
                this.initEvent(type, true, false);
                break;
            case "DOMCharacterDataModified":
                this.initEvent(type, true, false);
                break;
            default:
                this.initEvent(type, bubbles, cancelable);
        }
    }
});

// constants
MutationEvent.ADDITION = 0;
MutationEvent.MODIFICATION = 1;
MutationEvent.REMOVAL = 2;


/**
 * @name EventException
 */
EventException = function(code) {
  this.code = code;
};
EventException.UNSPECIFIED_EVENT_TYPE_ERR = 0;
/**
 *
 * DOM Level 2: http://www.w3.org/TR/DOM-Level-2-Events/events.html
 * DOM Level 3: http://www.w3.org/TR/DOM-Level-3-Events/
 *
 * interface DocumentEvent {
 *   Event createEvent (in DOMString eventType)
 *      raises (DOMException);
 * };
 *
 * Firefox (3.6) exposes DocumentEvent
 * Safari (4) does NOT.
 */

/**
 * TODO: Not sure we need a full prototype.  We not just an regular object?
 */
DocumentEvent = function(){};
DocumentEvent.prototype.__EventMap__ = {
    // Safari4: singular and plural forms accepted
    // Firefox3.6: singular and plural forms accepted
    'Event'          : Event,
    'Events'         : Event,
    'UIEvent'        : UIEvent,
    'UIEvents'       : UIEvent,
    'MouseEvent'     : MouseEvent,
    'MouseEvents'    : MouseEvent,
    'MutationEvent'  : MutationEvent,
    'MutationEvents' : MutationEvent,

    // Safari4: accepts HTMLEvents, but not HTMLEvent
    // Firefox3.6: accepts HTMLEvents, but not HTMLEvent
    'HTMLEvent'      : Event,
    'HTMLEvents'     : Event,

    // Safari4: both not accepted
    // Firefox3.6, only KeyEvents is accepted
    'KeyEvent'       : KeyboardEvent,
    'KeyEvents'      : KeyboardEvent,

    // Safari4: both accepted
    // Firefox3.6: none accepted
    'KeyboardEvent'  : KeyboardEvent,
    'KeyboardEvents' : KeyboardEvent
};

DocumentEvent.prototype.createEvent = function(eventType) {
    var Clazz = this.__EventMap__[eventType];
    if (Clazz) {
        return new Clazz();
    }
    throw(new DOMException(DOMException.NOT_SUPPORTED_ERR));
};

__extend__(Document.prototype, DocumentEvent.prototype);

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

/*
 * Envjs timer.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 * 
 * Parts of the implementation were originally written by:\
 * Steven Parkes
 * 
 * requires Envjs.wait, Envjs.sleep, Envjs.WAIT_INTERVAL
 */
/*var setTimeout,
    clearTimeout,
    setInterval,
    clearInterval;
*/

    
/*
 * Envjs timer.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){




/*
*       timer.js
*   implementation provided by Steven Parkes
*/

//private
var $timers = [],
    EVENT_LOOP_RUNNING = false;

$timers.lock = function(fn){
    Envjs.sync(fn)();
};

Envjs.clear = function(){
    $timers.lock(function(){
		for(var i=0; i<$timers.length; i++) {
			if ( !$timers[i] ) {
				continue;
			}
            $timers[i].stop();
            delete $timers[i];
        }
    });
}

//private internal class
var Timer = function(fn, interval){
    this.fn = fn;
    this.interval = interval;
    this.at = Date.now() + interval;
    // allows for calling wait() from callbacks
    this.running = false;
};

Timer.prototype.start = function(){};
Timer.prototype.stop = function(){};

//static
Timer.normalize = function(time) {
    time = time*1;
    if ( isNaN(time) || time < 0 ) {
        time = 0;
    }

    if ( EVENT_LOOP_RUNNING && time < Timer.MIN_TIME ) {
        time = Timer.MIN_TIME;
    }
    return time;
};
// html5 says this should be at least 4, but the parser is using
// a setTimeout for the SAX stuff which messes up the world
Timer.MIN_TIME = /* 4 */ 0;

/**
 * @function setTimeout
 * @param {Object} fn
 * @param {Object} time
 */
setTimeout = function(fn, time){
    var num;
    time = Timer.normalize(time);
    $timers.lock(function(){
        num = $timers.length+1;
        var tfn;
        if (typeof fn == 'string') {
            tfn = function() {
                try {
                    // eval in global scope
                    eval(fn, null);
                } catch (e) {
                    console.log('timer error %s %s', fn, e);
                } finally {
                    clearInterval(num);
                }
            };
        } else {
            tfn = function() {
                try {
                    fn();
                } catch (e) {
                    console.log('timer error %s %s', fn, e);
                } finally {
                    clearInterval(num);
                }
            };
        }
        //console.log("Creating timer number %s", num);
        $timers[num] = new Timer(tfn, time);
        $timers[num].start();
    });
    return num;
};

/**
 * @function setInterval
 * @param {Object} fn
 * @param {Object} time
 */
setInterval = function(fn, time){
    //console.log('setting interval %s %s', time, fn.toString().substring(0,64));
    time = Timer.normalize(time);
    if ( time < 10 ) {
        time = 10;
    }
    if (typeof fn == 'string') {
        var fnstr = fn;
        fn = function() {
            eval(fnstr);
        };
    }
    var num;
    $timers.lock(function(){
        num = $timers.length+1;
        //Envjs.debug("Creating timer number "+num);
        $timers[num] = new Timer(fn, time);
        $timers[num].start();
    });
    return num;
};

/**
 * clearInterval
 * @param {Object} num
 */
clearInterval = clearTimeout = function(num){
    //console.log("clearing interval "+num);
    $timers.lock(function(){
        if ( $timers[num] ) {
            $timers[num].stop();
            delete $timers[num];
        }
    });
};

// wait === null/undefined: execute any timers as they fire,
//  waiting until there are none left
// wait(n) (n > 0): execute any timers as they fire until there
//  are none left waiting at least n ms but no more, even if there
//  are future events/current threads
// wait(0): execute any immediately runnable timers and return
// wait(-n): keep sleeping until the next event is more than n ms
//  in the future
//
// TODO: make a priority queue ...

Envjs.wait = function(wait) {
    //console.log('wait %s', wait);
    var delta_wait,
        start = Date.now(),
        was_running = EVENT_LOOP_RUNNING;

    if (wait < 0) {
        delta_wait = -wait;
        wait = 0;
    }
    EVENT_LOOP_RUNNING = true;
    if (wait !== 0 && wait !== null && wait !== undefined){
        wait += Date.now();
    }

    var earliest,
        timer,
        sleep,
        index,
        goal,
        now,
        nextfn,
		commandline;

    for (;;) {
        /*console.log('timer loop');
		try{
		commandline = Envjs.shell.next(' ');
		}catch(e){console.log(e);}
	    console.log('commandline %s', commandline);*/
        earliest = sleep = goal = now = nextfn = null;
        $timers.lock(function(){
            for(index in $timers){
                if( isNaN(index*0) ) {
                    continue;
                }
                timer = $timers[index];
                // determine timer with smallest run-at time that is
                // not already running
                if( !timer.running && ( !earliest || timer.at < earliest.at) ) {
                    earliest = timer;
                }
            }
        });
        //next sleep time
        sleep = earliest && earliest.at - Date.now();
		/*console.log('timer loop earliest %s sleep %s', earliest, sleep);*/
        if ( earliest && sleep <= 0 ) {
            nextfn = earliest.fn;
            try {
                /*console.log('running stack %s', nextfn.toString().substring(0,64));*/
                earliest.running = true;
                nextfn();
            } catch (e) {
                console.log('timer error %s %s', nextfn, e);
            } finally {
                earliest.running = false;
            }
            goal = earliest.at + earliest.interval;
            now = Date.now();
            if ( goal < now ) {
                earliest.at = now;
            } else {
                earliest.at = goal;
            }
            continue;
        }

        // bunch of subtle cases here ...
        if ( !earliest ) {
            // no events in the queue (but maybe XHR will bring in events, so ...
            if ( !wait || wait < Date.now() ) {
                // Loop ends if there are no events and a wait hasn't been
                // requested or has expired
                break;
            }
        // no events, but a wait requested: fall through to sleep
        } else {
            // there are events in the queue, but they aren't firable now
            /*if ( delta_wait && sleep <= delta_wait ) {
                //TODO: why waste a check on a tight
                // loop if it just falls through?
            // if they will happen within the next delta, fall through to sleep
            } else */if ( wait === 0 || ( wait > 0 && wait < Date.now () ) ) {
                // loop ends even if there are events but the user
                // specifcally asked not to wait too long
                break;
            }
            // there are events and the user wants to wait: fall through to sleep
        }

        // Related to ajax threads ... hopefully can go away ..
        var interval =  Envjs.WAIT_INTERVAL || 100;
        if ( !sleep || sleep > interval ) {
            sleep = interval;
        }
        //console.log('sleeping %s', sleep);
        Envjs.sleep(sleep);

    }
    EVENT_LOOP_RUNNING = was_running;
};


/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());
/*
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 *
 * This file simply provides the global definitions we need to
 * be able to correctly implement to core browser DOM HTML interfaces.
 */
/*var HTMLDocument,
    HTMLElement,
    HTMLCollection,
    HTMLAnchorElement,
    HTMLAreaElement,
    HTMLBaseElement,
    HTMLQuoteElement,
    HTMLBodyElement,
    HTMLBRElement,
    HTMLButtonElement,
    CanvasRenderingContext2D,
    HTMLCanvasElement,
    HTMLTableColElement,
    HTMLModElement,
    HTMLDivElement,
    HTMLDListElement,
    HTMLFieldSetElement,
    HTMLFormElement,
    HTMLFrameElement,
    HTMLFrameSetElement,
    HTMLHeadElement,
    HTMLHeadingElement,
    HTMLHRElement,
    HTMLHtmlElement,
    HTMLIFrameElement,
    HTMLImageElement,
    HTMLInputElement,
    HTMLLabelElement,
    HTMLLegendElement,
    HTMLLIElement,
    HTMLLinkElement,
    HTMLMapElement,
    HTMLMetaElement,
    HTMLObjectElement,
    HTMLOListElement,
    HTMLOptGroupElement,
    HTMLOptionElement,
    HTMLParagraphElement,
    HTMLParamElement,
    HTMLPreElement,
    HTMLScriptElement,
    HTMLSelectElement,
    HTMLSpanElement,
    HTMLStyleElement,
    HTMLTableElement,
    HTMLTableSectionElement,
    HTMLTableCellElement,
    HTMLTableDataCellElement,
    HTMLTableHeaderCellElement,
    HTMLTableRowElement,
    HTMLTextAreaElement,
    HTMLTitleElement,
    HTMLUListElement,
    HTMLUnknownElement,
    Image,
    Option,
    __loadImage__,
    __loadLink__;
*/
/*
 * Envjs html.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}


/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @class  HTMLDocument
 *      The Document interface represents the entire HTML or XML document.
 *      Conceptually, it is the root of the document tree, and provides
 *      the primary access to the document's data.
 *
 * @extends Document
 */
HTMLDocument = function(implementation, ownerWindow, referrer) {
    Document.apply(this, arguments);
    this.referrer = referrer || '';
    this.baseURI = "about:blank";
    this.ownerWindow = ownerWindow;
};

HTMLDocument.prototype = new Document();

__extend__(HTMLDocument.prototype, {
    createElement: function(tagName){
        var node;
        tagName = tagName.toUpperCase();
        // create Element specifying 'this' as ownerDocument
        // This is an html document so we need to use explicit interfaces per the
        //TODO: would be much faster as a big switch
        switch(tagName){
        case "A":
            node = new HTMLAnchorElement(this);break;
        case "AREA":
            node = new HTMLAreaElement(this);break;
        case "BASE":
            node = new HTMLBaseElement(this);break;
        case "BLOCKQUOTE":
            node = new HTMLQuoteElement(this);break;
        case "CANVAS":
            node = new HTMLCanvasElement(this);break;
        case "Q":
            node = new HTMLQuoteElement(this);break;
        case "BODY":
            node = new HTMLBodyElement(this);break;
        case "BR":
            node = new HTMLBRElement(this);break;
        case "BUTTON":
            node = new HTMLButtonElement(this);break;
        case "CAPTION":
            node = new HTMLElement(this);break;
        case "COL":
            node = new HTMLTableColElement(this);break;
        case "COLGROUP":
            node = new HTMLTableColElement(this);break;
        case "DEL":
            node = new HTMLModElement(this);break;
        case "INS":
            node = new HTMLModElement(this);break;
        case "DIV":
            node = new HTMLDivElement(this);break;
        case "DL":
            node = new HTMLDListElement(this);break;
        case "DT":
            node = new HTMLElement(this); break;
        case "FIELDSET":
            node = new HTMLFieldSetElement(this);break;
        case "FORM":
            node = new HTMLFormElement(this);break;
        case "FRAME":
            node = new HTMLFrameElement(this);break;
        case "FRAMESET":
            node = new HTMLFrameSetElement(this);break;
        case "H1":
            node = new HTMLHeadingElement(this);break;
        case "H2":
            node = new HTMLHeadingElement(this);break;
        case "H3":
            node = new HTMLHeadingElement(this);break;
        case "H4":
            node = new HTMLHeadingElement(this);break;
        case "H5":
            node = new HTMLHeadingElement(this);break;
        case "H6":
            node = new HTMLHeadingElement(this);break;
        case "HEAD":
            node = new HTMLHeadElement(this);break;
        case "HR":
            node = new HTMLHRElement(this);break;
        case "HTML":
            node = new HTMLHtmlElement(this);break;
        case "IFRAME":
            node = new HTMLIFrameElement(this);break;
        case "IMG":
            node = new HTMLImageElement(this);break;
        case "INPUT":
            node = new HTMLInputElement(this);break;
        case "LABEL":
            node = new HTMLLabelElement(this);break;
        case "LEGEND":
            node = new HTMLLegendElement(this);break;
        case "LI":
            node = new HTMLLIElement(this);break;
        case "LINK":
            node = new HTMLLinkElement(this);break;
        case "MAP":
            node = new HTMLMapElement(this);break;
        case "META":
            node = new HTMLMetaElement(this);break;
        case "NOSCRIPT":
            node = new HTMLElement(this);break;
        case "OBJECT":
            node = new HTMLObjectElement(this);break;
        case "OPTGROUP":
            node = new HTMLOptGroupElement(this);break;
        case "OL":
            node = new HTMLOListElement(this); break;
        case "OPTION":
            node = new HTMLOptionElement(this);break;
        case "P":
            node = new HTMLParagraphElement(this);break;
        case "PARAM":
            node = new HTMLParamElement(this);break;
        case "PRE":
            node = new HTMLPreElement(this);break;
        case "SCRIPT":
            node = new HTMLScriptElement(this);break;
        case "SELECT":
            node = new HTMLSelectElement(this);break;
        case "SMALL":
            node = new HTMLElement(this);break;
        case "SPAN":
            node = new HTMLSpanElement(this);break;
        case "STRONG":
            node = new HTMLElement(this);break;
        case "STYLE":
            node = new HTMLStyleElement(this);break;
        case "TABLE":
            node = new HTMLTableElement(this);break;
        case "TBODY":
            node = new HTMLTableSectionElement(this);break;
        case "TFOOT":
            node = new HTMLTableSectionElement(this);break;
        case "THEAD":
            node = new HTMLTableSectionElement(this);break;
        case "TD":
            node = new HTMLTableDataCellElement(this);break;
        case "TH":
            node = new HTMLTableHeaderCellElement(this);break;
        case "TEXTAREA":
            node = new HTMLTextAreaElement(this);break;
        case "TITLE":
            node = new HTMLTitleElement(this);break;
        case "TR":
            node = new HTMLTableRowElement(this);break;
        case "UL":
            node = new HTMLUListElement(this);break;
        default:
            node = new HTMLUnknownElement(this);
        }
        // assign values to properties (and aliases)
        node.nodeName  = tagName;
        return node;
    },
    createElementNS : function (uri, local) {
        //print('createElementNS :'+uri+" "+local);
        if(!uri){
            return this.createElement(local);
        }else if ("http://www.w3.org/1999/xhtml" == uri) {
            return this.createElement(local);
        } else if ("http://www.w3.org/1998/Math/MathML" == uri) {
            return this.createElement(local);
        } else if ("http://www.w3.org/2000/svg" == uri) {
 			return this.createElement(local);
		} else {
            return Document.prototype.createElementNS.apply(this,[uri, local]);
        }
    },
    get anchors(){
        return new HTMLCollection(this.getElementsByTagName('a'));
    },
    get applets(){
        return new HTMLCollection(this.getElementsByTagName('applet'));
    },
    get documentElement(){
        var html = Document.prototype.__lookupGetter__('documentElement').apply(this,[]);
        if( html === null){
            html = this.createElement('html');
            this.appendChild(html);
            html.appendChild(this.createElement('head'));
            html.appendChild(this.createElement('body'));
        }
        return html;
    },
    //document.head is non-standard
    get head(){
        //console.log('get head');
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var element = this.documentElement,
        	length = element.childNodes.length,
	        i;
        //check for the presence of the head element in this html doc
        for(i=0;i<length;i++){
            if(element.childNodes[i].nodeType === Node.ELEMENT_NODE){
                if(element.childNodes[i].tagName.toLowerCase() === 'head'){
                    return element.childNodes[i];
                }
            }
        }
        //no head?  ugh bad news html.. I guess we'll force the issue?
        var head = element.appendChild(this.createElement('head'));
        return head;
    },
    get title(){
        //console.log('get title');
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var title,
        	head = this.head,
	        length = head.childNodes.length,
	        i;
        //check for the presence of the title element in this head element
        for(i=0;i<length;i++){
            if(head.childNodes[i].nodeType === Node.ELEMENT_NODE){
                if(head.childNodes[i].tagName.toLowerCase() === 'title'){
                    return head.childNodes[i].textContent;
                }
            }
        }
        //no title?  ugh bad news html.. I guess we'll force the issue?
        title = head.appendChild(this.createElement('title'));
        return title.appendChild(this.createTextNode('Untitled Document')).nodeValue;
    },
    set title(titleStr){
        //console.log('set title %s', titleStr);
        if (!this.documentElement) {
            this.appendChild(this.createElement('html'));
        }
        var title = this.title;
        title.textContent = titleStr;
    },

    get body() {
        var element = this.documentElement,
            length = element.childNodes.length,
            i;
        for (i=0; i<length; i++) {
            if (element.childNodes[i].nodeType === Node.ELEMENT_NODE &&
                (element.childNodes[i].tagName === 'BODY' || 
				 element.childNodes[i].tagName === 'FRAMESET')) {
                return element.childNodes[i];
            }
        }
        return null;
    },
    set body() {
        /* in firefox this is a benevolent do nothing*/
        console.log('set body');
    },

    get cookie(){
        return Envjs.getCookies(this.location+'');
    },
    set cookie(cookie){
        return Envjs.setCookie(this.location+'', cookie);
    },

    /**
     * document.location
     *
     * should be identical to window.location
     *
     * HTML5:
     * http://dev.w3.org/html5/spec/Overview.html#the-location-interface
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.location
     *
     */
    get location() {
        if (this.ownerWindow) {
            return this.ownerWindow.location;
        } else {
            return this.baseURI;
        }
    },
    set location(url) {
        this.baseURI = url;
        if (this.ownerWindow) {
            this.ownerWindow.location = url;
        }
    },

    /**
     * document.URL (read-only)
     *
     * HTML DOM Level 2:
     * http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-46183437
     *
     * HTML5:
     * http://dev.w3.org/html5/spec/Overview.html#dom-document-url
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.URL
     */
    get URL() {
        return this.location.href;
    },

    /**
     * document.domain
     *
     * HTML5 Spec:
     * http://dev.w3.org/html5/spec/Overview.html#dom-document-domain
     *
     * Mozilla MDC:
     * https://developer.mozilla.org/en/DOM/document.domain
     *
     */
    get domain(){
        var HOSTNAME = new RegExp('\/\/([^\:\/]+)'),
        matches = HOSTNAME.exec(this.baseURI);
        return matches&&matches.length>1?matches[1]:"";
    },
    set domain(value){
        var i,
        domainParts = this.domain.split('.').reverse(),
        newDomainParts = value.split('.').reverse();
        if(newDomainParts.length > 1){
            for(i=0;i<newDomainParts.length;i++){
                if(!(newDomainParts[i] === domainParts[i])){
                    return;
                }
            }
            this.baseURI = this.baseURI.replace(domainParts.join('.'), value);
        }
    },

    get forms(){
        return new HTMLCollection(this.getElementsByTagName('form'));
    },
    get images(){
        return new HTMLCollection(this.getElementsByTagName('img'));
    },
    get lastModified(){
        /* TODO */
        return this._lastModified;
    },
    get links(){
        return new HTMLCollection(this.getElementsByTagName('a'));
    },
    getElementsByName : function(name){
        //returns a real Array + the NodeList
        var retNodes = __extend__([],new NodeList(this, this.documentElement)),
        node;
        // loop through all Elements
        var all = this.getElementsByTagName('*');
        for (var i=0; i < all.length; i++) {
            node = all[i];
            if (node.nodeType === Node.ELEMENT_NODE &&
                node.getAttribute('name') == name) {
                retNodes.push(node);
            }
        }
        return retNodes;
    },
    toString: function(){
        return "[object HTMLDocument]";
    },
    get innerHTML(){
        return this.documentElement.outerHTML;
    }
});



Aspect.around({
    target: Node,
    method:"appendChild"
}, function(invocation) {
    var event,
        okay,
        node = invocation.proceed(),
        doc = node.ownerDocument,
		target;

    //console.log('element appended: %s %s %s', node+'', node.nodeName, node.namespaceURI);
    if((node.nodeType !== Node.ELEMENT_NODE)){
        //for now we are only handling element insertions.  probably
        //we will need to handle text node changes to script tags and
        //changes to src attributes
        return node;
    }
	
	if(node.tagName&&node.tagName.toLowerCase()=="input"){
		target = node.parentNode;
		//console.log('adding named map for input');
		while(target&&target.tagName&&target.tagName.toLowerCase()!="form"){
			//console.log('possible target for named map for input is %s', target);
			target = target.parentNode;
		}
		if(target){
			//console.log('target for named map for input is %s', target);
			__addNamedMap__(target, node);
		}
	}
    //console.log('appended html element %s %s %s', node.namespaceURI, node.nodeName, node);
    switch(doc.parsing){
        case true:

        /**
         * Very special case.  While in parsing mode, in head, a
         * script can add another script tag to the head, and it will
         * be evaluated.  This is tested in 'ant fulldoc-spec' tests.
         *
         * Not quite sure if the require that the new script tag must
         * be in the head is correct or not.  NamespaceURI == null
         * might also need to corrected too.
         */
        if (node.tagName.toLowerCase() === 'script' && 
			(node.namespaceURI === "" || 
			 node.namespaceURI === "http://www.w3.org/1999/xhtml" || 
			 node.namespaceURI === null) ) {
            //console.log('appending script while parsing');
            if((this.nodeName.toLowerCase() === 'head')){
                try{
                    okay = Envjs.loadLocalScript(node, null);
                    //console.log('loaded script? %s %s', node.uuid, okay);
                    // only fire event if we actually had something to load
                    if (node.src && node.src.length > 0){
                        event = doc.createEvent('HTMLEvents');
                        event.initEvent( okay ? "load" : "error", false, false );
                        node.dispatchEvent( event, false );
                    }
                }catch(e){
                    console.log('error loading html element %s %e', node, e.toString());
                }
            }
        }
        break;
        case false:
            switch(node.namespaceURI){
                case null:
                    //fall through
                case "":
                    //fall through
                case "http://www.w3.org/1999/xhtml":
                    switch(node.tagName.toLowerCase()){
                    case 'style':
                        document.styleSheets.push(CSSStyleSheet(node));
                        break;
                    case 'script':
                        //console.log('appending script %s', node.src);
                        if((this.nodeName.toLowerCase() === 'head')){
                            try{
                                okay = Envjs.loadLocalScript(node, null);
                                //console.log('loaded script? %s %s', node.uuid, okay);
                                // only fire event if we actually had something to load
                                if (node.src && node.src.length > 0){
                                    event = doc.createEvent('HTMLEvents');
                                    event.initEvent( okay ? "load" : "error", false, false );
                                    node.dispatchEvent( event, false );
                                }
                            }catch(e){
                                console.log('error loading html element %s %e', node, e.toString());
                            }
                        }
                        break;
                    case 'frame':
                    case 'iframe':
                        node.contentWindow = { };
                        node.contentDocument = new HTMLDocument(new DOMImplementation(), node.contentWindow);
                        node.contentWindow.document = node.contentDocument;
                        try{
                            Window;
                        }catch(e){
                            node.contentDocument.addEventListener('DOMContentLoaded', function(){
                                event = node.contentDocument.createEvent('HTMLEvents');
                                event.initEvent("load", false, false);
                                node.dispatchEvent( event, false );
                            });
                            console.log('error loading html element %s %e', node, e.toString());
                        }
                        try{
                            if (node.src && node.src.length > 0){
                                //console.log("trigger load on frame from appendChild %s", node.src);
                                Envjs.loadFrame(node, Envjs.uri(node.src, doc.location+''));
                            }else{
                                Envjs.loadFrame(node);
                            }
                        }catch(e){
                            console.log('error loading html element %s %e', node, e.toString());
                        }
                        break;

                    case 'link':
                        if (node.href && node.href.length > 0) {
                            __loadLink__(node, node.href);
                        }
                        break;
                        /*
                          case 'img':
                          if (node.src && node.src.length > 0){
                          // don't actually load anything, so we're "done" immediately:
                          event = doc.createEvent('HTMLEvents');
                          event.initEvent("load", false, false);
                          node.dispatchEvent( event, false );
                          }
                          break;
                        */
                    case 'option':
                        node._updateoptions();
                        break;
                    default:
                        if(node.getAttribute('onload')){
                            //console.log('calling attribute onload %s | %s', node.onload, node.tagName);
                            node.onload();
                        }
                        break;
                    }//switch on name
                default:
                    break;
            }//switch on ns
            break;
        default:
            // console.log('element appended: %s %s', node+'', node.namespaceURI);
    }//switch on doc.parsing
    return node;

});

Aspect.around({
    target: Node,
    method:"removeChild"
}, function(invocation) {
    var event,
        okay,
        node = invocation.proceed(),
        doc = node.ownerDocument;
    if((node.nodeType !== Node.ELEMENT_NODE)){
        //for now we are only handling element insertions.  probably we will need
        //to handle text node changes to script tags and changes to src
        //attributes
        if(node.nodeType !== Node.DOCUMENT_NODE && node.uuid){
            //console.log('removing event listeners, %s', node, node.uuid);
            node.removeEventListener('*', null, null);
        }
        return node;
    }
    //console.log('appended html element %s %s %s', node.namespaceURI, node.nodeName, node);
	if(node.tagName&&node.tagName.toLowerCase()=="input"){
		target = node.parentNode;
		//console.log('adding named map for input');
		while(target&&target.tagName&&target.tagName.toLowerCase()!="form"){
			//console.log('possible target for named map for input is %s', target);
			target = target.parentNode;
		}
		if(target){
			//console.log('target for named map for input is %s', target);
			__removeNamedMap__(target, node);
		}
	}
    switch(doc.parsing){
        case true:
            //handled by parser if included
            break;
        case false:
            switch(node.namespaceURI){
            case null:
                //fall through
            case "":
                //fall through
            case "http://www.w3.org/1999/xhtml":
                //this is interesting dillema since our event engine is
                //storing the registered events in an array accessed
                //by the uuid property of the node.  unforunately this
                //means listeners hang out way after(forever ;)) the node
                //has been removed and gone out of scope.
                //console.log('removing event listeners, %s', node, node.uuid);
                node.removeEventListener('*', null, null);
                switch(node.tagName.toLowerCase()){
                case 'frame':
                case 'iframe':
                    try{
                        //console.log('removing iframe document');
                        try{
                            Envjs.unloadFrame(node);
                        }catch(e){
                            console.log('error freeing resources from frame %s', e);
                        }
                        node.contentWindow = null;
                        node.contentDocument = null;
                    }catch(e){
                        console.log('error unloading html element %s %e', node, e.toString());
                    }
                    break;
                default:
                    break;
                }//switch on name
            default:
                break;
            }//switch on ns
            break;
        default:
            console.log('element appended: %s %s', node+'', node.namespaceURI);
    }//switch on doc.parsing
    return node;

});



/**
 * Named Element Support
 *
 *
 */

/*
 *
 * @returns 'name' if the node has a appropriate name
 *          null if node does not have a name
 */

var __isNamedElement__ = function(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return null;
    }
    var tagName = node.tagName.toLowerCase();
    var nodename = null;

    switch (tagName) {
        case 'embed':
        case 'form':
        case 'iframe':
		case 'input':
            nodename = node.getAttribute('name');
            break;
        case 'applet':
            nodename = node.id;
            break;
        case 'object':
            // TODO: object needs to be 'fallback free'
            nodename = node.id;
            break;
        case 'img':
            nodename = node.id;
            if (!nodename || ! node.getAttribute('name')) {
                nodename = null;
            }
            break;
    }
    return (nodename) ? nodename : null;
};


var __addNamedMap__ = function(target, node) {
    var nodename = __isNamedElement__(node);
    if (nodename) {
       	target.__defineGetter__(nodename, function() {
            return node;
        });	
		target.__defineSetter__(nodename, function(value) {
	        return value;
	    });
    }
};

var __removeNamedMap__ = function(target, node) {
    if (!node) {
        return;
    }
    var nodename = __isNamedElement__(node);
    if (nodename) {
		delete target[nodename];
    }
};

/**
 * @name HTMLEvents
 * @w3c:domlevel 2
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */

var __eval__ = function(script, node){
    if (!script == "" && Envjs.scriptTypes['']){
        // don't assemble environment if no script...
        try{
            Envjs.eval(node.ownerDocument.ownerWindow, script, script+" ("+node+")");
        }catch(e){
            console.log('error evaluating %s', e);
        }
    }
};

var HTMLEvents= function(){};
HTMLEvents.prototype = {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this);
    },
    onunload: function(event){
        __eval__(this.getAttribute('onunload')||'', this);
    },
    onabort: function(event){
        __eval__(this.getAttribute('onabort')||'', this);
    },
    onerror: function(event){
        __eval__(this.getAttribute('onerror')||'', this);
    },
    onselect: function(event){
        __eval__(this.getAttribute('onselect')||'', this);
    },
    onchange: function(event){
        __eval__(this.getAttribute('onchange')||'', this);
    },
    onsubmit: function(event){
        if (__eval__(this.getAttribute('onsubmit')||'', this)) {
            this.submit();
        }
    },
    onreset: function(event){
        __eval__(this.getAttribute('onreset')||'', this);
    },
    onfocus: function(event){
        __eval__(this.getAttribute('onfocus')||'', this);
    },
    onblur: function(event){
        __eval__(this.getAttribute('onblur')||'', this);
    },
    onresize: function(event){
        __eval__(this.getAttribute('onresize')||'', this);
    },
    onscroll: function(event){
        __eval__(this.getAttribute('onscroll')||'', this);
    }
};

//HTMLDocument, HTMLFramesetElement, HTMLObjectElement
var  __load__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("load", false, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLFramesetElement, HTMLBodyElement
var  __unload__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("unload", false, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLObjectElement
var  __abort__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("abort", true, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLFramesetElement, HTMLObjectElement, HTMLBodyElement
var  __error__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("error", true, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLInputElement, HTMLTextAreaElement
var  __select__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("select", true, false);
    element.dispatchEvent(event);
    return event;
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __change__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("change", true, false);
    element.dispatchEvent(event);
    return event;
};

//HtmlFormElement
var __submit__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("submit", true, true);
    element.dispatchEvent(event);
    return event;
};

//HtmlFormElement
var  __reset__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("reset", false, false);
    element.dispatchEvent(event);
    return event;
};

//LABEL, INPUT, SELECT, TEXTAREA, and BUTTON
var __focus__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("focus", false, false);
    element.dispatchEvent(event);
    return event;
};

//LABEL, INPUT, SELECT, TEXTAREA, and BUTTON
var __blur__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("blur", false, false);
    element.dispatchEvent(event);
    return event;
};

//Window
var __resize__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("resize", true, false);
    element.dispatchEvent(event);
    return event;
};

//Window
var __scroll__ = function(element){
    var event = new Event('HTMLEvents');
    event.initEvent("scroll", true, false);
    element.dispatchEvent(event);
    return event;
};

/**
 * @name KeyboardEvents
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
var KeyboardEvents= function(){};
KeyboardEvents.prototype = {
    onkeydown: function(event){
        __eval__(this.getAttribute('onkeydown')||'', this);
    },
    onkeypress: function(event){
        __eval__(this.getAttribute('onkeypress')||'', this);
    },
    onkeyup: function(event){
        __eval__(this.getAttribute('onkeyup')||'', this);
    }
};


var __registerKeyboardEventAttrs__ = function(elm){
    if(elm.hasAttribute('onkeydown')){ 
        elm.addEventListener('keydown', elm.onkeydown, false); 
    }
    if(elm.hasAttribute('onkeypress')){ 
        elm.addEventListener('keypress', elm.onkeypress, false); 
    }
    if(elm.hasAttribute('onkeyup')){ 
        elm.addEventListener('keyup', elm.onkeyup, false); 
    }
    return elm;
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keydown__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keydown", false, false);
    element.dispatchEvent(event);
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keypress__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keypress", false, false);
    element.dispatchEvent(event);
};

//HTMLInputElement, HTMLSelectElement, HTMLTextAreaElement
var  __keyup__ = function(element){
    var event = new Event('KeyboardEvents');
    event.initEvent("keyup", false, false);
    element.dispatchEvent(event);
};

/**
 * @name MaouseEvents
 * @w3c:domlevel 2 
 * @uri http://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html
 */
var MouseEvents= function(){};
MouseEvents.prototype = {
    onclick: function(event){
        __eval__(this.getAttribute('onclick')||'', this);
    },
    ondblclick: function(event){
        __eval__(this.getAttribute('ondblclick')||'', this);
    },
    onmousedown: function(event){
        __eval__(this.getAttribute('onmousedown')||'', this);
    },
    onmousemove: function(event){
        __eval__(this.getAttribute('onmousemove')||'', this);
    },
    onmouseout: function(event){
        __eval__(this.getAttribute('onmouseout')||'', this);
    },
    onmouseover: function(event){
        __eval__(this.getAttribute('onmouseover')||'', this);
    },
    onmouseup: function(event){
        __eval__(this.getAttribute('onmouseup')||'', this);
    }  
};

var __registerMouseEventAttrs__ = function(elm){
    if(elm.hasAttribute('onclick')){ 
        elm.addEventListener('click', elm.onclick, false); 
    }
    if(elm.hasAttribute('ondblclick')){ 
        elm.addEventListener('dblclick', elm.ondblclick, false); 
    }
    if(elm.hasAttribute('onmousedown')){ 
        elm.addEventListener('mousedown', elm.onmousedown, false); 
    }
    if(elm.hasAttribute('onmousemove')){ 
        elm.addEventListener('mousemove', elm.onmousemove, false); 
    }
    if(elm.hasAttribute('onmouseout')){ 
        elm.addEventListener('mouseout', elm.onmouseout, false); 
    }
    if(elm.hasAttribute('onmouseover')){ 
        elm.addEventListener('mouseover', elm.onmouseover, false); 
    }
    if(elm.hasAttribute('onmouseup')){ 
        elm.addEventListener('mouseup', elm.onmouseup, false); 
    }
    return elm;
};


var  __click__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("click", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mousedown__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mousedown", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseup__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseup", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseover__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseover", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mousemove__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mousemove", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};
var  __mouseout__ = function(element){
    var event = new Event('MouseEvents');
    event.initEvent("mouseout", true, true, null, 0,
                0, 0, 0, 0, false, false, false, 
                false, null, null);
    element.dispatchEvent(event);
};

/**
 * HTMLElement - DOM Level 2
 */


/* Hack for http://www.prototypejs.org/
 *
 * Prototype 1.6 (the library) creates a new global Element, which causes
 * envjs to use the wrong Element.
 *
 * http://envjs.lighthouseapp.com/projects/21590/tickets/108-prototypejs-wont-load-due-it-clobbering-element
 *
 * Options:
 *  (1) Rename the dom/element to something else
 *       rejected: been done before. people want Element.
 *  (2) merge dom+html and not export Element to global namespace
 *      (meaning we would use a local var Element in a closure, so prototype
 *      can do what ever it wants)
 *       rejected: want dom and html separate
 *  (3) use global namespace (put everything under Envjs = {})
 *       rejected: massive change
 *  (4) use commonjs modules (similar to (3) in spirit)
 *       rejected: massive change
 *
 *  or
 *
 *  (5) take a reference to Element during initial loading ("compile
 *      time"), and use the reference instead of "Element".  That's
 *      what the next line does.  We use __DOMElement__ if we need to
 *      reference the parent class.  Only this file explcity uses
 *      Element so this should work, and is the most minimal change I
 *      could think of with no external API changes.
 *
 */
var  __DOMElement__ = Element;

HTMLElement = function(ownerDocument) {
    __DOMElement__.apply(this, arguments);
};

HTMLElement.prototype = new Element();
__extend__(HTMLElement.prototype, HTMLEvents.prototype);
__extend__(HTMLElement.prototype, {
    get className() {
        return this.getAttribute("class")||'';
    },
    set className(value) {
        return this.setAttribute("class",__trim__(value));
    },
    get dir() {
        return this.getAttribute("dir")||"ltr";
    },
    set dir(val) {
        return this.setAttribute("dir",val);
    },
    get id(){
        return this.getAttribute('id') || '';
    },
    set id(id){
        this.setAttribute('id', id);
    },
    get innerHTML(){
        var ret = "",
        i;

        // create string containing the concatenation of the string
        // values of each child
        for (i=0; i < this.childNodes.length; i++) {
            if(this.childNodes[i]){
                if(this.childNodes[i].nodeType === Node.ELEMENT_NODE){
                    ret += this.childNodes[i].xhtml;
                } else if (this.childNodes[i].nodeType === Node.TEXT_NODE && i>0 &&
                           this.childNodes[i-1].nodeType === Node.TEXT_NODE){
                    //add a single space between adjacent text nodes
                    ret += " "+this.childNodes[i].xml;
                }else{
                    ret += this.childNodes[i].xml;
                }
            }
        }
        return ret;
    },
    get lang() {
        return this.getAttribute("lang");
    },
    set lang(val) {
        return this.setAttribute("lang",val);
    },
    get offsetHeight(){
        return Number((this.style.height || '').replace("px",""));
    },
    get offsetWidth(){
        return Number((this.style.width || '').replace("px",""));
    },
    offsetLeft: 0,
    offsetRight: 0,
    get offsetParent(){
        /* TODO */
        return;
    },
    set offsetParent(element){
        /* TODO */
        return;
    },
    scrollHeight: 0,
    scrollWidth: 0,
    scrollLeft: 0,
    scrollRight: 0,
    get style(){
        return this.getAttribute('style')||'';
    },
    get title() {
        return this.getAttribute("title");
    },
    set title(value) {
        return this.setAttribute("title", value);
    },
    get tabIndex(){
        var tabindex = this.getAttribute('tabindex');
        if(tabindex!==null){
            return Number(tabindex);
        } else {
            return 0;
        }
    },
    set tabIndex(value){
        if (value === undefined || value === null) {
            value = 0;
        }
        this.setAttribute('tabindex',Number(value));
    },
    get outerHTML(){
        //Not in the specs but I'll leave it here for now.
        return this.xhtml;
    },
    scrollIntoView: function(){
        /*TODO*/
        return;
    },
    toString: function(){
        return '[object HTMLElement]';
    },
    get xhtml() {
        // HTMLDocument.xhtml is non-standard
        // This is exactly like Document.xml except the tagName has to be
        // lower cased.  I dont like to duplicate this but its really not
        // a simple work around between xml and html serialization via
        // XMLSerializer (which uppercases html tags) and innerHTML (which
        // lowercases tags)

        var ret = "",
            ns = "",
            name = (this.tagName+"").toLowerCase(),
            attrs,
            attrstring = "",
			style = false,
            i;

        // serialize namespace declarations
        if (this.namespaceURI){
            if((this === this.ownerDocument.documentElement) ||
               (!this.parentNode) ||
               (this.parentNode &&
                (this.parentNode.namespaceURI !== this.namespaceURI))) {
                ns = ' xmlns' + (this.prefix ? (':' + this.prefix) : '') +
                    '="' + this.namespaceURI + '"';
            }
        }

        // serialize Attribute declarations
        attrs = this.attributes;
        for(i=0;i< attrs.length;i++){
            attrstring += " "+attrs[i].name+'="'+attrs[i].xml+'"';
			if(attrs[i].name == 'style'){
				style = true;
			}
        }
		if(!style ){
			style = this.getAttribute('style');
			if(style)
				attrstring += ' style="'+style+'"';
		}

        if(this.hasChildNodes()){
            // serialize this Element
	        //console.log('serializing childNodes for %s', name);
            ret += "<" + name + ns + attrstring +">";
            for(i=0;i< this.childNodes.length;i++){
                console.debug('xhtml for '+ this);
                ret += 'xhtml' in this.childNodes[i] ?
                    this.childNodes[i].xhtml :
                    this.childNodes[i].xml;
            }
            ret += "</" + name + ">";
        }else{	
            //console.log('no childNodes to serialize for %s', name);
            switch(name){
            case 'script':
            case 'noscript':
                ret += "<" + name + ns + attrstring +"></"+name+">";
                break;
            default:
                ret += "<" + name + ns + attrstring +"/>";
            }
        }

        return ret;
    },

    /**
     * setAttribute use a dispatch table that other tags can set to
     *  "listen" to various values being set.  The dispatch table
     * and registration functions are at the end of the file.
     *
     */

    setAttribute: function(name, value) {
        var result = __DOMElement__.prototype.setAttribute.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, name);
        if (callback) {
            callback(this, value);
        }
    },
    setAttributeNS: function(namespaceURI, name, value) {
        var result = __DOMElement__.prototype.setAttributeNS.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, name);
        if (callback) {
            callback(this, value);
        }

        return result;
    },
    setAttributeNode: function(newnode) {
        var result = __DOMElement__.prototype.setAttributeNode.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, newnode.name);
        if (callback) {
            callback(this, node.value);
        }
        return result;
    },
    setAttributeNodeNS: function(newnode) {
        var result = __DOMElement__.prototype.setAttributeNodeNS.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, this);
        var tagname = this.tagName;
        var callback = HTMLElement.getAttributeCallback('set', tagname, newnode.name);
        if (callback) {
            callback(this, node.value);
        }
        return result;
    },
    removeAttribute: function(name) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttribute.apply(this, arguments);
    },
    removeAttributeNS: function(namespace, localname) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttributeNS.apply(this, arguments);
    },
    removeAttributeNode: function(name) {
        __removeNamedMap__(this.ownerDocument, this);
        return __DOMElement__.prototype.removeAttribute.apply(this, arguments);
    },
    removeChild: function(oldChild) {
        __removeNamedMap__(this.ownerDocument, oldChild);
        return __DOMElement__.prototype.removeChild.apply(this, arguments);
    },
    importNode: function(othernode, deep) {
        var newnode = __DOMElement__.prototype.importNode.apply(this, arguments);
        __addNamedMap__(this.ownerDocument, newnode);
        return newnode;
    },

    // not actually sure if this is needed or not
    replaceNode: function(newchild, oldchild) {
        var newnode = __DOMElement__.prototype.replaceNode.apply(this, arguments);
        __removeNamedMap__(this.ownerDocument, oldchild);
        __addNamedMap__(this.ownerDocument, newnode);
                return newnode;
    }
});


HTMLElement.attributeCallbacks = {};
HTMLElement.registerSetAttribute = function(tag, attrib, callbackfn) {
    HTMLElement.attributeCallbacks[tag + ':set:' + attrib] = callbackfn;
};
HTMLElement.registerRemoveAttribute = function(tag, attrib, callbackfn) {
    HTMLElement.attributeCallbacks[tag + ':remove:' + attrib] = callbackfn;
};

/**
 * This is really only useful internally
 *
 */
HTMLElement.getAttributeCallback = function(type, tag, attrib) {
    return HTMLElement.attributeCallbacks[tag + ':' + type + ':' + attrib] || null;
};
/*
 * HTMLCollection
 *
 * HTML5 -- 2.7.2.1 HTMLCollection
 * http://dev.w3.org/html5/spec/Overview.html#htmlcollection
 * http://dev.w3.org/html5/spec/Overview.html#collections
 */
HTMLCollection = function(nodelist, type) {

    __setArray__(this, []);
    var n;
    for (var i=0; i<nodelist.length; i++) {
        this[i] = nodelist[i];
        n = nodelist[i].name;
        if (n) {
            this[n] = nodelist[i];
        }
        n = nodelist[i].id;
        if (n) {
            this[n] = nodelist[i];
        }
    }

    this.length = nodelist.length;
};

HTMLCollection.prototype = {

    item: function (idx) {
        return  ((idx >= 0) && (idx < this.length)) ? this[idx] : null;
    },

    namedItem: function (name) {
        return this[name] || null;
    },

    toString: function() {
        return '[object HTMLCollection]';
    }
};
/*
 *  a set of convenience classes to centralize implementation of
 * properties and methods across multiple in-form elements
 *
 *  the hierarchy of related HTML elements and their members is as follows:
 *
 * Condensed Version
 *
 *  HTMLInputCommon
 *     * legent (no value attr)
 *     * fieldset (no value attr)
 *     * label (no value attr)
 *     * option (custom value)
 *  HTMLTypeValueInputs (extends InputCommon)
 *     * select  (custom value)
 *     * button (just sets value)
 *  HTMLInputAreaCommon (extends TypeValueIput)
 *     * input  (custom)
 *     * textarea (just sets value)
 *
 * -----------------------
 *    HTMLInputCommon:  common to all elements
 *       .form
 *
 *    <legend>
 *          [common plus:]
 *       .align
 *
 *    <fieldset>
 *          [identical to "legend" plus:]
 *       .margin
 *
 *
 *  ****
 *
 *    <label>
 *          [common plus:]
 *       .dataFormatAs
 *       .htmlFor
 *       [plus data properties]
 *
 *    <option>
 *          [common plus:]
 *       .defaultSelected
 *       .index
 *       .label
 *       .selected
 *       .text
 *       .value   // unique implementation, not duplicated
 *       .form    // unique implementation, not duplicated
 *  ****
 *
 *    HTMLTypeValueInputs:  common to remaining elements
 *          [common plus:]
 *       .name
 *       .type
 *       .value
 *       [plus data properties]
 *
 *
 *    <select>
 *       .length
 *       .multiple
 *       .options[]
 *       .selectedIndex
 *       .add()
 *       .remove()
 *       .item()                                       // unimplemented
 *       .namedItem()                                  // unimplemented
 *       [plus ".onchange"]
 *       [plus focus events]
 *       [plus data properties]
 *       [plus ".size"]
 *
 *    <button>
 *       .dataFormatAs   // duplicated from above, oh well....
 *       [plus ".status", ".createTextRange()"]
 *
 *  ****
 *
 *    HTMLInputAreaCommon:  common to remaining elements
 *       .defaultValue
 *       .readOnly
 *       .handleEvent()                                // unimplemented
 *       .select()
 *       .onselect
 *       [plus ".size"]
 *       [plus ".status", ".createTextRange()"]
 *       [plus focus events]
 *       [plus ".onchange"]
 *
 *    <textarea>
 *       .cols
 *       .rows
 *       .wrap                                         // unimplemented
 *       .onscroll                                     // unimplemented
 *
 *    <input>
 *       .alt
 *       .accept                                       // unimplemented
 *       .checked
 *       .complete                                     // unimplemented
 *       .defaultChecked
 *       .dynsrc                                       // unimplemented
 *       .height
 *       .hspace                                       // unimplemented
 *       .indeterminate                                // unimplemented
 *       .loop                                         // unimplemented
 *       .lowsrc                                       // unimplemented
 *       .maxLength
 *       .src
 *       .start                                        // unimplemented
 *       .useMap
 *       .vspace                                       // unimplemented
 *       .width
 *       .onclick
 *       [plus ".size"]
 *       [plus ".status", ".createTextRange()"]

 *    [data properties]                                // unimplemented
 *       .dataFld
 *       .dataSrc

 *    [status stuff]                                   // unimplemented
 *       .status
 *       .createTextRange()

 *    [focus events]
 *       .onblur
 *       .onfocus

 */



var inputElements_dataProperties = {};
var inputElements_status = {};

var inputElements_onchange = {
    onchange: function(event){
        __eval__(this.getAttribute('onchange')||'', this);
    }
};

var inputElements_size = {
    get size(){
        return Number(this.getAttribute('size'));
    },
    set size(value){
        this.setAttribute('size',value);
    }
};

var inputElements_focusEvents = {
    blur: function(){
        __blur__(this);

        if (this._oldValue != this.value){
            var event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
            this.dispatchEvent( event );
        }
    },
    focus: function(){
        __focus__(this);
        this._oldValue = this.value;
    }
};


/*
* HTMLInputCommon - convenience class, not DOM
*/
var HTMLInputCommon = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLInputCommon.prototype = new HTMLElement();
__extend__(HTMLInputCommon.prototype, {
    get form() {
        // parent can be null if element is outside of a form
        // or not yet added to the document
        var parent = this.parentNode;
        while (parent && parent.nodeName.toLowerCase() !== 'form') {
            parent = parent.parentNode;
        }
        return parent;
    },
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get access(){
        return this.getAttribute('access');
    },
    set access(value){
        this.setAttribute('access', value);
    },
    get disabled(){
        return (this.getAttribute('disabled') === 'disabled');
    },
    set disabled(value){
        this.setAttribute('disabled', (value ? 'disabled' :''));
    }
});




/*
* HTMLTypeValueInputs - convenience class, not DOM
*/
var HTMLTypeValueInputs = function(ownerDocument) {

    HTMLInputCommon.apply(this, arguments);

    this._oldValue = "";
};
HTMLTypeValueInputs.prototype = new HTMLInputCommon();
__extend__(HTMLTypeValueInputs.prototype, inputElements_size);
__extend__(HTMLTypeValueInputs.prototype, inputElements_status);
__extend__(HTMLTypeValueInputs.prototype, inputElements_dataProperties);
__extend__(HTMLTypeValueInputs.prototype, {
    get name(){
        return this.getAttribute('name')||'';
    },
    set name(value){
        this.setAttribute('name',value);
    },
});


/*
* HTMLInputAreaCommon - convenience class, not DOM
*/
var HTMLInputAreaCommon = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
};
HTMLInputAreaCommon.prototype = new HTMLTypeValueInputs();
__extend__(HTMLInputAreaCommon.prototype, inputElements_focusEvents);
__extend__(HTMLInputAreaCommon.prototype, inputElements_onchange);
__extend__(HTMLInputAreaCommon.prototype, {
    get readOnly(){
        return (this.getAttribute('readonly')=='readonly');
    },
    set readOnly(value){
        this.setAttribute('readonly', (value ? 'readonly' :''));
    },
    select:function(){
        __select__(this);

    }
});


var __updateFormForNamedElement__ = function(node, value) {
    if (node.form) {
        // to check for ID or NAME attribute too
        // not, then nothing to do
        node.form._updateElements();
    }
};

/**
 * HTMLAnchorElement - DOM Level 2
 *
 * HTML5: 4.6.1 The a element
 * http://dev.w3.org/html5/spec/Overview.html#the-a-element
 */
HTMLAnchorElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLAnchorElement.prototype = new HTMLElement();
__extend__(HTMLAnchorElement.prototype, {
    get accessKey() {
        return this.getAttribute("accesskey")||'';
    },
    set accessKey(val) {
        return this.setAttribute("accesskey",val);
    },
    get charset() {
        return this.getAttribute("charset")||'';
    },
    set charset(val) {
        return this.setAttribute("charset",val);
    },
    get coords() {
        return this.getAttribute("coords")||'';
    },
    set coords(val) {
        return this.setAttribute("coords",val);
    },
    get href() {
        var link = this.getAttribute('href');
        if (!link) {
            return '';
        }
        return Envjs.uri(link, this.ownerDocument.location.toString());
    },
    set href(val) {
        return this.setAttribute("href", val);
    },
    get hreflang() {
        return this.getAttribute("hreflang")||'';
    },
    set hreflang(val) {
        this.setAttribute("hreflang",val);
    },
    get name() {
        return this.getAttribute("name")||'';
    },
    set name(val) {
        this.setAttribute("name",val);
    },
    get rel() {
        return this.getAttribute("rel")||'';
    },
    set rel(val) {
        return this.setAttribute("rel", val);
    },
    get rev() {
        return this.getAttribute("rev")||'';
    },
    set rev(val) {
        return this.setAttribute("rev",val);
    },
    get shape() {
        return this.getAttribute("shape")||'';
    },
    set shape(val) {
        return this.setAttribute("shape",val);
    },
    get target() {
        return this.getAttribute("target")||'';
    },
    set target(val) {
        return this.setAttribute("target",val);
    },
    get type() {
        return this.getAttribute("type")||'';
    },
    set type(val) {
        return this.setAttribute("type",val);
    },
    blur: function() {
        __blur__(this);
    },
    focus: function() {
        __focus__(this);
    },
	click: function(){
		__click__(this);
	},
    /**
     * Unlike other elements, toString returns the href
     */
    toString: function() {
        return this.href;
    }
});

/*
 * HTMLAreaElement - DOM Level 2
 *
 * HTML5: 4.8.13 The area element
 * http://dev.w3.org/html5/spec/Overview.html#the-area-element
 */
HTMLAreaElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLAreaElement.prototype = new HTMLElement();
__extend__(HTMLAreaElement.prototype, {
    get accessKey(){
        return this.getAttribute('accesskey');
    },
    set accessKey(value){
        this.setAttribute('accesskey',value);
    },
    get alt(){
        return this.getAttribute('alt') || '';
    },
    set alt(value){
        this.setAttribute('alt',value);
    },
    get coords(){
        return this.getAttribute('coords');
    },
    set coords(value){
        this.setAttribute('coords',value);
    },
    get href(){
        return this.getAttribute('href') || '';
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get noHref(){
        return this.hasAttribute('href');
    },
    get shape(){
        //TODO
        return 0;
    },
    /*get tabIndex(){
      return this.getAttribute('tabindex');
      },
      set tabIndex(value){
      this.setAttribute('tabindex',value);
      },*/
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },

    /**
     * toString like <a>, returns the href
     */
    toString: function() {
        return this.href;
    }
});


/*
 * HTMLBaseElement - DOM Level 2
 *
 * HTML5: 4.2.3 The base element
 * http://dev.w3.org/html5/spec/Overview.html#the-base-element
 */
HTMLBaseElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBaseElement.prototype = new HTMLElement();
__extend__(HTMLBaseElement.prototype, {
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },
    toString: function() {
        return '[object HTMLBaseElement]';
    }
});


/*
 * HTMLQuoteElement - DOM Level 2
 * HTML5: 4.5.5 The blockquote element
 * http://dev.w3.org/html5/spec/Overview.html#htmlquoteelement
 */
HTMLQuoteElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
__extend__(HTMLQuoteElement.prototype, HTMLElement.prototype);
__extend__(HTMLQuoteElement.prototype, {
    /**
     * Quoth the spec:
     * """
     * If the cite attribute is present, it must be a valid URL. To
     * obtain the corresponding citation link, the value of the
     * attribute must be resolved relative to the element. User agents
     * should allow users to follow such citation links.
     * """
     *
     * TODO: normalize
     *
     */
    get cite() {
        return this.getAttribute('cite') || '';
    },

    set cite(value) {
        this.setAttribute('cite', value);
    },
    toString: function() {
        return '[object HTMLQuoteElement]';
    }
});

/*
 * HTMLBodyElement - DOM Level 2
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-body-element-0
 */
HTMLBodyElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLBodyElement.prototype = new HTMLElement();
__extend__(HTMLBodyElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this);
    },
    onunload: function(event){
        __eval__(this.getAttribute('onunload')||'', this);
    },
    toString: function() {
        return '[object HTMLBodyElement]';
    }
});

/*
 * HTMLBRElement
 * HTML5: 4.5.3 The hr Element
 * http://dev.w3.org/html5/spec/Overview.html#the-br-element
 */
HTMLBRElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLBRElement.prototype = new HTMLElement();
__extend__(HTMLBRElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLBRElement]';
    }
});


/*
 * HTMLButtonElement - DOM Level 2
 *
 * HTML5: 4.10.6 The button element
 * http://dev.w3.org/html5/spec/Overview.html#the-button-element
 */
HTMLButtonElement = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
};
HTMLButtonElement.prototype = new HTMLTypeValueInputs();
__extend__(HTMLButtonElement.prototype, inputElements_status);
__extend__(HTMLButtonElement.prototype, {
    get dataFormatAs(){
        return this.getAttribute('dataFormatAs');
    },
    set dataFormatAs(value){
        this.setAttribute('dataFormatAs',value);
    },
    get type() {
        return this.getAttribute('type') || 'submit';
    },
    set type(value) {
        this.setAttribute('type', value);
    },
    get value() {
        return this.getAttribute('value') || '';
    },
    set value(value) {
        this.setAttribute('value', value);
    },
    toString: function() {
        return '[object HTMLButtonElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('BUTTON', 'name',
                                 __updateFormForNamedElement__);

/*
 * HTMLCanvasElement - DOM Level 2
 * HTML5: 4.8.11 The canvas element
 * http://dev.w3.org/html5/spec/Overview.html#the-canvas-element
 */


/*
 * This is a "non-Abstract Base Class". For an implmentation that actually
 * did something, all these methods would need to over-written
 */
CanvasRenderingContext2D = function() {
    // NOP
};

var nullfunction = function() {};

CanvasRenderingContext2D.prototype = {
    addColorStop: nullfunction,
    arc: nullfunction,
    beginPath: nullfunction,
    bezierCurveTo: nullfunction,
    clearRect: nullfunction,
    clip: nullfunction,
    closePath: nullfunction,
    createLinearGradient: nullfunction,
    createPattern: nullfunction,
    createRadialGradient: nullfunction,
    drawImage: nullfunction,
    fill: nullfunction,
    fillRect:  nullfunction,
    lineTo: nullfunction,
    moveTo: nullfunction,
    quadraticCurveTo: nullfunction,
    rect: nullfunction,
    restore: nullfunction,
    rotate: nullfunction,
    save: nullfunction,
    scale: nullfunction,
    setTranform: nullfunction,
    stroke: nullfunction,
    strokeRect: nullfunction,
    transform: nullfunction,
    translate: nullfunction,

    toString: function() {
        return '[object CanvasRenderingContext2D]';
    }
};

HTMLCanvasElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLCanvasElement.prototype = new HTMLElement();
__extend__(HTMLCanvasElement.prototype, {

    getContext: function(ctxtype) {
        if (ctxtype === '2d') {
            return new CanvasRenderingContext2D();
        }
        throw new Error("Unknown context type of '" + ctxtype + '"');
    },

    get height(){
        return Number(this.getAttribute('height')|| 150);
    },
    set height(value){
        this.setAttribute('height', value);
    },

    get width(){
        return Number(this.getAttribute('width')|| 300);
    },
    set width(value){
        this.setAttribute('width', value);
    },

    toString: function() {
        return '[object HTMLCanvasElement]';
    }

});


/*
* HTMLTableColElement - DOM Level 2
*
* HTML5: 4.9.3 The colgroup element
* http://dev.w3.org/html5/spec/Overview.html#the-colgroup-element
*/
HTMLTableColElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableColElement.prototype = new HTMLElement();
__extend__(HTMLTableColElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align', value);
    },
    get ch(){
        return this.getAttribute('ch');
    },
    set ch(value){
        this.setAttribute('ch', value);
    },
    get chOff(){
        return this.getAttribute('ch');
    },
    set chOff(value){
        this.setAttribute('ch', value);
    },
    get span(){
        return this.getAttribute('span');
    },
    set span(value){
        this.setAttribute('span', value);
    },
    get vAlign(){
        return this.getAttribute('valign');
    },
    set vAlign(value){
        this.setAttribute('valign', value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width', value);
    },
    toString: function() {
        return '[object HTMLTableColElement]';
    }
});


/*
 * HTMLModElement - DOM Level 2
 * http://dev.w3.org/html5/spec/Overview.html#htmlmodelement
 */
HTMLModElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLModElement.prototype = new HTMLElement();
__extend__(HTMLModElement.prototype, {
    get cite(){
        return this.getAttribute('cite');
    },
    set cite(value){
        this.setAttribute('cite', value);
    },
    get dateTime(){
        return this.getAttribute('datetime');
    },
    set dateTime(value){
        this.setAttribute('datetime', value);
    },
    toString: function() {
        return '[object HTMLModElement]';
    }
});

/*
 * HTMLDivElement - DOM Level 2
 * HTML5: 4.5.12 The Div Element
 * http://dev.w3.org/html5/spec/Overview.html#the-div-element
 */
HTMLDivElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLDivElement.prototype = new HTMLElement();
__extend__(HTMLDivElement.prototype, {
    get align(){
        return this.getAttribute('align') || 'left';
    },
    set align(value){
        this.setAttribute('align', value);
    },
    toString: function() {
        return '[object HTMLDivElement]';
    }
});


/*
 * HTMLDListElement
 * HTML5: 4.5.7 The dl Element
 * http://dev.w3.org/html5/spec/Overview.html#the-dl-element
 */
HTMLDListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLDListElement.prototype = new HTMLElement();
__extend__(HTMLDListElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLDListElement]';
    }
});


/**
 * HTMLLegendElement - DOM Level 2
 *
 * HTML5: 4.10.3 The legend element
 * http://dev.w3.org/html5/spec/Overview.html#the-legend-element
 */
HTMLLegendElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLegendElement.prototype = new HTMLInputCommon();
__extend__(HTMLLegendElement.prototype, {
    get align(){
        return this.getAttribute('align');
    },
    set align(value){
        this.setAttribute('align',value);
    }
});


/*
 * HTMLFieldSetElement - DOM Level 2
 *
 * HTML5: 4.10.2 The fieldset element
 * http://dev.w3.org/html5/spec/Overview.html#the-fieldset-element
 */
HTMLFieldSetElement = function(ownerDocument) {
    HTMLLegendElement.apply(this, arguments);
};
HTMLFieldSetElement.prototype = new HTMLLegendElement();
__extend__(HTMLFieldSetElement.prototype, {
    get margin(){
        return this.getAttribute('margin');
    },
    set margin(value){
        this.setAttribute('margin',value);
    },
    toString: function() {
        return '[object HTMLFieldSetElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('FIELDSET', 'name', __updateFormForNamedElement__);
/*
 * HTMLFormElement - DOM Level 2
 *
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-form-element
 */
HTMLFormElement = function(ownerDocument){
    HTMLElement.apply(this, arguments);

    //TODO: on __elementPopped__ from the parser
    //      we need to determine all the forms default
    //      values
};
HTMLFormElement.prototype = new HTMLElement();
__extend__(HTMLFormElement.prototype,{
    get acceptCharset(){
        return this.getAttribute('accept-charset');
    },
    set acceptCharset(acceptCharset) {
        this.setAttribute('accept-charset', acceptCharset);
    },
    get action() {
        return this.getAttribute('action');
    },
    set action(action){
        this.setAttribute('action', action);
    },

    get enctype() {
        return this.getAttribute('enctype');
    },
    set enctype(enctype) {
        this.setAttribute('enctype', enctype);
    },
    get method() {
        return this.getAttribute('method');
    },
    set method(method) {
        this.setAttribute('method', method);
    },
    get name() {
        return this.getAttribute("name");
    },
    set name(val) {
        return this.setAttribute("name",val);
    },
    get target() {
        return this.getAttribute("target");
    },
    set target(val) {
        return this.setAttribute("target",val);
    },

    /**
     * "Named Elements"
     *
     */
    /**
     * returns HTMLFormControlsCollection
     * http://dev.w3.org/html5/spec/Overview.html#dom-form-elements
     *
     * button fieldset input keygen object output select textarea
     */
    get elements() {
        var nodes = this.getElementsByTagName('*');
        var alist = [];
        var i, tmp;
        for (i = 0; i < nodes.length; ++i) {
            nodename = nodes[i].nodeName;
            // would like to replace switch with something else
            //  since it's redundant with the SetAttribute callbacks
            switch (nodes[i].nodeName) {
            case 'BUTTON':
            case 'FIELDSET':
            case 'INPUT':
            case 'KEYGEN':
            case 'OBJECT':
            case 'OUTPUT':
            case 'SELECT':
            case 'TEXTAREA':
                alist.push(nodes[i]);
                this[i] = nodes[i];
                tmp = nodes[i].name;
                if (tmp) {
                    this[tmp] = nodes[i];
                }
                tmp = nodes[i].id;
                if (tmp) {
                    this[tmp] = nodes[i];
                }
            }
        }
        return new HTMLCollection(alist);
    },
    _updateElements: function() {
        this.elements;
    },
    get length() {
        return this.elements.length;
    },
    item: function(idx) {
        return this.elements[idx];
    },
    namedItem: function(aname) {
        return this.elements.namedItem(aname);
    },
    toString: function() {
        return '[object HTMLFormElement]';
    },
    submit: function() {
        //TODO: this needs to perform the form inputs serialization
        //      and submission
        //  DONE: see xhr/form.js
        var event = __submit__(this);

    },
    reset: function() {
        //TODO: this needs to reset all values specified in the form
        //      to those which where set as defaults
        __reset__(this);

    },
    onsubmit: HTMLEvents.prototype.onsubmit,
    onreset: HTMLEvents.prototype.onreset
});

/**
 * HTMLFrameElement - DOM Level 2
 */
HTMLFrameElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
    // this is normally a getter but we need to be
    // able to set it to correctly emulate behavior
    this.contentDocument = null;
    this.contentWindow = null;
};
HTMLFrameElement.prototype = new HTMLElement();
__extend__(HTMLFrameElement.prototype, {

    get frameBorder(){
        return this.getAttribute('border')||"";
    },
    set frameBorder(value){
        this.setAttribute('border', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc')||"";
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get marginHeight(){
        return this.getAttribute('marginheight')||"";
    },
    set marginHeight(value){
        this.setAttribute('marginheight', value);
    },
    get marginWidth(){
        return this.getAttribute('marginwidth')||"";
    },
    set marginWidth(value){
        this.setAttribute('marginwidth', value);
    },
    get name(){
        return this.getAttribute('name')||"";
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get noResize(){
        return this.getAttribute('noresize')||false;
    },
    set noResize(value){
        this.setAttribute('noresize', value);
    },
    get scrolling(){
        return this.getAttribute('scrolling')||"";
    },
    set scrolling(value){
        this.setAttribute('scrolling', value);
    },
    get src(){
        return this.getAttribute('src')||"";
    },
    set src(value){
        this.setAttribute('src', value);
    },
    toString: function(){
        return '[object HTMLFrameElement]';
    },
    onload: HTMLEvents.prototype.onload
});

/**
 * HTMLFrameSetElement - DOM Level 2
 *
 * HTML5: 12.3.3 Frames
 * http://dev.w3.org/html5/spec/Overview.html#frameset
 */
HTMLFrameSetElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLFrameSetElement.prototype = new HTMLElement();
__extend__(HTMLFrameSetElement.prototype, {
    get cols(){
        return this.getAttribute('cols');
    },
    set cols(value){
        this.setAttribute('cols', value);
    },
    get rows(){
        return this.getAttribute('rows');
    },
    set rows(value){
        this.setAttribute('rows', value);
    },
    toString: function() {
        return '[object HTMLFrameSetElement]';
    }
});

/*
 * HTMLHeadingElement
 * HTML5: 4.4.6 The h1, h2, h3, h4, h5, and h6 elements
 * http://dev.w3.org/html5/spec/Overview.html#the-h1-h2-h3-h4-h5-and-h6-elements
 */
HTMLHeadingElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLHeadingElement.prototype = new HTMLElement();
__extend__(HTMLHeadingElement.prototype, {
    toString: function() {
        return '[object HTMLHeadingElement]';
    }
});

/**
 * HTMLHeadElement - DOM Level 2
 *
 * HTML5: 4.2.1 The head element
 * http://dev.w3.org/html5/spec/Overview.html#the-head-element-0
 */
HTMLHeadElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLHeadElement.prototype = new HTMLElement();
__extend__(HTMLHeadElement.prototype, {
    get profile(){
        return this.getAttribute('profile');
    },
    set profile(value){
        this.setAttribute('profile', value);
    },
    //we override this so we can apply browser behavior specific to head children
    //like loading scripts
    appendChild : function(newChild) {
        newChild = HTMLElement.prototype.appendChild.apply(this,[newChild]);
        //TODO: evaluate scripts which are appended to the head
        //__evalScript__(newChild);
        return newChild;
    },
    insertBefore : function(newChild, refChild) {
        newChild = HTMLElement.prototype.insertBefore.apply(this,[newChild]);
        //TODO: evaluate scripts which are appended to the head
        //__evalScript__(newChild);
        return newChild;
    },
    toString: function(){
        return '[object HTMLHeadElement]';
    }
});


/*
 * HTMLHRElement
 * HTML5: 4.5.2 The hr Element
 * http://dev.w3.org/html5/spec/Overview.html#the-hr-element
 */
HTMLHRElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLHRElement.prototype = new HTMLElement();
__extend__(HTMLHRElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLHRElement]';
    }
});


/*
 * HTMLHtmlElement
 * HTML5: 4.1.1 The Html Element
 * http://dev.w3.org/html5/spec/Overview.html#htmlhtmlelement
 */
HTMLHtmlElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLHtmlElement.prototype = new HTMLElement();
__extend__(HTMLHtmlElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLHtmlElement]';
    }
});


/*
 * HTMLIFrameElement - DOM Level 2
 *
 * HTML5: 4.8.3 The iframe element
 * http://dev.w3.org/html5/spec/Overview.html#the-iframe-element
 */
HTMLIFrameElement = function(ownerDocument) {
    HTMLFrameElement.apply(this, arguments);
};
HTMLIFrameElement.prototype = new HTMLFrameElement();
__extend__(HTMLIFrameElement.prototype, {
    get height() {
        return this.getAttribute("height") || "";
    },
    set height(val) {
        return this.setAttribute("height",val);
    },
    get width() {
        return this.getAttribute("width") || "";
    },
    set width(val) {
        return this.setAttribute("width",val);
    },
    toString: function(){
        return '[object HTMLIFrameElement]';
    }
});

/**
 * HTMLImageElement and Image
 */


HTMLImageElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLImageElement.prototype = new HTMLElement();
__extend__(HTMLImageElement.prototype, {
    get alt(){
        return this.getAttribute('alt');
    },
    set alt(value){
        this.setAttribute('alt', value);
    },
    get height(){
        return parseInt(this.getAttribute('height'), 10) || 0;
    },
    set height(value){
        this.setAttribute('height', value);
    },
    get isMap(){
        return this.hasAttribute('map');
    },
    set useMap(value){
        this.setAttribute('map', value);
    },
    get longDesc(){
        return this.getAttribute('longdesc');
    },
    set longDesc(value){
        this.setAttribute('longdesc', value);
    },
    get name(){
        return this.getAttribute('name');
    },
    set name(value){
        this.setAttribute('name', value);
    },
    get src(){
        return this.getAttribute('src') || '';
    },
    set src(value){
        this.setAttribute('src', value);
    },
    get width(){
        return parseInt(this.getAttribute('width'), 10) || 0;
    },
    set width(value){
        this.setAttribute('width', value);
    },
    toString: function(){
        return '[object HTMLImageElement]';
    }
});

/*
 * html5 4.8.1
 * http://dev.w3.org/html5/spec/Overview.html#the-img-element
 */
Image = function(width, height) {
    // Not sure if "[global].document" satifies this requirement:
    // "The element's document must be the active document of the
    // browsing context of the Window object on which the interface
    // object of the invoked constructor is found."

    HTMLElement.apply(this, [document]);
    // Note: firefox will throw an error if the width/height
    //   is not an integer.  Safari just converts to 0 on error.
    this.width = parseInt(width, 10) || 0;
    this.height = parseInt(height, 10) || 0;
    this.nodeName = 'IMG';
};
Image.prototype = new HTMLImageElement();


/*
 * Image.src attribute events.
 *
 * Not sure where this should live... in events/img.js? in parser/img.js?
 * Split out to make it easy to move.
 */

/**
 * HTMLImageElement && Image are a bit odd in that the 'src' attribute
 * is 'active' -- changing it triggers loading of the image from the
 * network.
 *
 * This can occur by
 *   - Directly setting the Image.src =
 *   - Using one of the Element.setAttributeXXX methods
 *   - Node.importNode an image
 *   - The initial creation and parsing of an <img> tag
 *
 * __onImageRequest__ is a function that handles eventing
 *  and dispatches to a user-callback.
 *
 */
__loadImage__ = function(node, value) {
    var event;
    if (value && (!Envjs.loadImage ||
                  (Envjs.loadImage &&
                   Envjs.loadImage(node, value)))) {
        // value has to be something (easy)
        // if the user-land API doesn't exist
        // Or if the API exists and it returns true, then ok:
        event = document.createEvent('Events');
        event.initEvent('load');
    } else {
        // oops
        event = document.createEvent('Events');
        event.initEvent('error');
    }
    node.dispatchEvent(event, false);
};

__extend__(HTMLImageElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload') || '', this);
    }
});


/*
 * Image Loading
 *
 * The difference between "owner.parsing" and "owner.fragment"
 *
 * If owner.parsing === true, then during the html5 parsing then,
 *  __elementPopped__ is called when a compete tag (with attrs and
 *  children) is full parsed and added the DOM.
 *
 *   For images, __elementPopped__ is called with everything the
 *    tag has.  which in turn looks for a "src" attr and calls
 *    __loadImage__
 *
 * If owner.parser === false (or non-existant), then we are not in
 * a parsing step.  For images, perhaps someone directly modified
 * a 'src' attribute of an existing image.
 *
 * 'innerHTML' is tricky since we first create a "fake document",
 *  parse it, then import the right parts.  This may call
 *  img.setAttributeNS twice.  once during the parse and once
 *  during the clone of the node.  We want event to trigger on the
 *  later and not during th fake doco.  "owner.fragment" is set by
 *  the fake doco parser to indicate that events should not be
 *  triggered on this.
 *
 * We coud make 'owner.parser' == [ 'none', 'full', 'fragment']
 * and just use one variable That was not done since the patch is
 * quite large as is.
 *
 * This same problem occurs with scripts.  innerHTML oddly does
 * not eval any <script> tags inside.
 */
HTMLElement.registerSetAttribute('IMG', 'src', function(node, value) {
    var owner = node.ownerDocument;
    if (!owner.parsing && !owner.fragment) {
        __loadImage__(node, value);
    }
});
/**
 * HTMLInputElement
 *
 * HTML5: 4.10.5 The input element
 * http://dev.w3.org/html5/spec/Overview.html#the-input-element
 */
HTMLInputElement = function(ownerDocument) {
    HTMLInputAreaCommon.apply(this, arguments);
    this._dirty = false;
    this._checked = null;
    this._value = null;
};
HTMLInputElement.prototype = new HTMLInputAreaCommon();
__extend__(HTMLInputElement.prototype, {
    get alt(){
        return this.getAttribute('alt') || '';
    },
    set alt(value){
        this.setAttribute('alt', value);
    },

    /**
     * 'checked' returns state, NOT the value of the attribute
     */
    get checked(){
        if (this._checked === null) {
            this._checked = this.defaultChecked;
        }
        return this._checked;
    },
    set checked(value){
        // force to boolean value
        this._checked = (value) ? true : false;
    },

    /**
     * 'defaultChecked' actually reflects if the 'checked' attribute
     * is present or not
     */
    get defaultChecked(){
        return this.hasAttribute('checked');
    },
    set defaultChecked(val){
        if (val) {
            this.setAttribute('checked', '');
        } else {
            if (this.defaultChecked) {
                this.removeAttribute('checked');
            }
        }
    },
    get defaultValue() {
        return this.getAttribute('value') || '';
    },
    set defaultValue(value) {
        this._dirty = true;
        this.setAttribute('value', value);
    },
    get value() {
        return (this._value === null) ? this.defaultValue : this._value;
    },
    set value(newvalue) {
        this._value = newvalue;
    },
    /**
     * Height is a string
     */
    get height(){
        // spec says it is a string
        return this.getAttribute('height') || '';
    },
    set height(value){
        this.setAttribute('height',value);
    },

    /**
     * MaxLength is a number
     */
    get maxLength(){
        return Number(this.getAttribute('maxlength')||'-1');
    },
    set maxLength(value){
        this.setAttribute('maxlength', value);
    },

    /**
     * Src is a URL string
     */
    get src(){
        return this.getAttribute('src') || '';
    },
    set src(value){
        // TODO: make absolute any relative URLS
        this.setAttribute('src', value);
    },

    get type() {
        return this.getAttribute('type') || 'text';
    },
    set type(value) {
        this.setAttribute('type', value);
    },

    get useMap(){
        return this.getAttribute('map') || '';
    },

    /**
     * Width: spec says it is a string
     */
    get width(){
        return this.getAttribute('width') || '';
    },
    set width(value){
        this.setAttribute('width',value);
    },
    click:function(){
        __click__(this);
    },
    toString: function() {
        return '[object HTMLInputElement]';
    }
});

//http://dev.w3.org/html5/spec/Overview.html#dom-input-value
// if someone directly modifies the value attribute, then the input's value
// also directly changes.
HTMLElement.registerSetAttribute('INPUT', 'value', function(node, value) {
    if (!node._dirty) {
        node._value = value;
        node._dirty = true;
    }
});

/*
 *The checked content attribute is a boolean attribute that gives the
 *default checkedness of the input element. When the checked content
 *attribute is added, if the control does not have dirty checkedness,
 *the user agent must set the checkedness of the element to true; when
 *the checked content attribute is removed, if the control does not
 *have dirty checkedness, the user agent must set the checkedness of
 *the element to false.
 */
// Named Element Support
HTMLElement.registerSetAttribute('INPUT', 'name',
                                 __updateFormForNamedElement__);

/**
 * HTMLLabelElement - DOM Level 2
 * HTML5 4.10.4 The label element
 * http://dev.w3.org/html5/spec/Overview.html#the-label-element
 */
HTMLLabelElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
};
HTMLLabelElement.prototype = new HTMLInputCommon();
__extend__(HTMLLabelElement.prototype, inputElements_dataProperties);
__extend__(HTMLLabelElement.prototype, {
    get htmlFor() {
        return this.getAttribute('for');
    },
    set htmlFor(value) {
        this.setAttribute('for',value);
    },
    get dataFormatAs() {
        return this.getAttribute('dataFormatAs');
    },
    set dataFormatAs(value) {
        this.setAttribute('dataFormatAs',value);
    },
    toString: function() {
        return '[object HTMLLabelElement]';
    }
});

/*
 * HTMLLIElement
 * HTML5: 4.5.8 The li Element
 * http://dev.w3.org/html5/spec/Overview.html#the-li-element
 */
HTMLLIElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLLIElement.prototype = new HTMLElement();
__extend__(HTMLLIElement.prototype, {

    // TODO: attribute long value;

    toString: function() {
        return '[object HTMLLIElement]';
    }
});


/*
 * HTMLLinkElement - DOM Level 2
 *
 * HTML5: 4.8.12 The map element
 * http://dev.w3.org/html5/spec/Overview.html#the-map-element
 */
HTMLLinkElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLLinkElement.prototype = new HTMLElement();
__extend__(HTMLLinkElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get href(){
        return this.getAttribute('href');
    },
    set href(value){
        this.setAttribute('href',value);
    },
    get hreflang(){
        return this.getAttribute('hreflang');
    },
    set hreflang(value){
        this.setAttribute('hreflang',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get rel(){
        return this.getAttribute('rel');
    },
    set rel(value){
        this.setAttribute('rel',value);
    },
    get rev(){
        return this.getAttribute('rev');
    },
    set rev(value){
        this.setAttribute('rev',value);
    },
    get target(){
        return this.getAttribute('target');
    },
    set target(value){
        this.setAttribute('target',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    toString: function() {
        return '[object HTMLLinkElement]';
    }
});

__loadLink__ = function(node, value) {
    var event;
    var owner = node.ownerDocument;

    if (owner.fragment) {
        /**
         * if we are in an innerHTML fragment parsing step
         * then ignore.  It will be handled once the fragment is
         * added to the real doco
         */
        return;
    }

    if (node.parentNode === null) {
        /*
         * if a <link> is parentless (normally by create a new link
         * via document.createElement('link'), then do *not* fire an
         * event, even if it has a valid 'href' attribute.
         */
        return;
    }
    if (value != '' && (!Envjs.loadLink ||
                        (Envjs.loadLink &&
                         Envjs.loadLink(node, value)))) {
        // value has to be something (easy)
        // if the user-land API doesn't exist
        // Or if the API exists and it returns true, then ok:
        event = document.createEvent('Events');
        event.initEvent('load');
    } else {
        // oops
        event = document.createEvent('Events');
        event.initEvent('error');
    }
    node.dispatchEvent(event, false);
};


HTMLElement.registerSetAttribute('LINK', 'href', function(node, value) {
    __loadLink__(node, value);
});

/**
 * Event stuff, not sure where it goes
 */
__extend__(HTMLLinkElement.prototype, {
    onload: function(event){
        __eval__(this.getAttribute('onload')||'', this);
    },
});

/**
 * HTMLMapElement
 *
 * 4.8.12 The map element
 * http://dev.w3.org/html5/spec/Overview.html#the-map-element
 */
HTMLMapElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLMapElement.prototype = new HTMLElement();
__extend__(HTMLMapElement.prototype, {
    get areas(){
        return this.getElementsByTagName('area');
    },
    get name(){
        return this.getAttribute('name') || '';
    },
    set name(value){
        this.setAttribute('name',value);
    },
    toString: function() {
        return '[object HTMLMapElement]';
    }
});

/**
 * HTMLMetaElement - DOM Level 2
 * HTML5: 4.2.5 The meta element
 * http://dev.w3.org/html5/spec/Overview.html#meta
 */
HTMLMetaElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLMetaElement.prototype = new HTMLElement();
__extend__(HTMLMetaElement.prototype, {
    get content() {
        return this.getAttribute('content') || '';
    },
    set content(value){
        this.setAttribute('content',value);
    },
    get httpEquiv(){
        return this.getAttribute('http-equiv') || '';
    },
    set httpEquiv(value){
        this.setAttribute('http-equiv',value);
    },
    get name(){
        return this.getAttribute('name') || '';
    },
    set name(value){
        this.setAttribute('name',value);
    },
    get scheme(){
        return this.getAttribute('scheme');
    },
    set scheme(value){
        this.setAttribute('scheme',value);
    },
    toString: function() {
        return '[object HTMLMetaElement]';
    }
});


/**
 * HTMLObjectElement - DOM Level 2
 * HTML5: 4.8.5 The object element
 * http://dev.w3.org/html5/spec/Overview.html#the-object-element
 */
HTMLObjectElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLObjectElement.prototype = new HTMLElement();
__extend__(HTMLObjectElement.prototype, {
    get code(){
        return this.getAttribute('code');
    },
    set code(value){
        this.setAttribute('code',value);
    },
    get archive(){
        return this.getAttribute('archive');
    },
    set archive(value){
        this.setAttribute('archive',value);
    },
    get codeBase(){
        return this.getAttribute('codebase');
    },
    set codeBase(value){
        this.setAttribute('codebase',value);
    },
    get codeType(){
        return this.getAttribute('codetype');
    },
    set codeType(value){
        this.setAttribute('codetype',value);
    },
    get data(){
        return this.getAttribute('data');
    },
    set data(value){
        this.setAttribute('data',value);
    },
    get declare(){
        return this.getAttribute('declare');
    },
    set declare(value){
        this.setAttribute('declare',value);
    },
    get height(){
        return this.getAttribute('height');
    },
    set height(value){
        this.setAttribute('height',value);
    },
    get standby(){
        return this.getAttribute('standby');
    },
    set standby(value){
        this.setAttribute('standby',value);
    },
    /*get tabIndex(){
      return this.getAttribute('tabindex');
      },
      set tabIndex(value){
      this.setAttribute('tabindex',value);
      },*/
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get useMap(){
        return this.getAttribute('usemap');
    },
    set useMap(value){
        this.setAttribute('usemap',value);
    },
    get width(){
        return this.getAttribute('width');
    },
    set width(value){
        this.setAttribute('width',value);
    },
    get contentDocument(){
        return this.ownerDocument;
    },
    toString: function() {
        return '[object HTMLObjectElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('OBJECT', 'name',
                                 __updateFormForNamedElement__);

/*
 * HTMLOListElement
 * HTML5: 4.5.6 The ol Element
 * http://dev.w3.org/html5/spec/Overview.html#the-ol-element
 */
HTMLOListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLOListElement.prototype = new HTMLElement();
__extend__(HTMLOListElement.prototype, {

    // TODO: attribute boolean reversed;
    // TODO:  attribute long start;

    toString: function() {
        return '[object HTMLOListElement]';
    }
});


/**
 * HTMLOptGroupElement - DOM Level 2
 * HTML 5: 4.10.9 The optgroup element
 * http://dev.w3.org/html5/spec/Overview.html#the-optgroup-element
 */
HTMLOptGroupElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLOptGroupElement.prototype = new HTMLElement();
__extend__(HTMLOptGroupElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get label(){
        return this.getAttribute('label');
    },
    set label(value){
        this.setAttribute('label',value);
    },
    appendChild: function(node){
        var i,
        length,
        selected = false;
        //make sure at least one is selected by default
        if(node.nodeType === Node.ELEMENT_NODE && node.tagName === 'OPTION'){
            length = this.childNodes.length;
            for(i=0;i<length;i++){
                if(this.childNodes[i].nodeType === Node.ELEMENT_NODE &&
                   this.childNodes[i].tagName === 'OPTION'){
                    //check if it is selected
                    if(this.selected){
                        selected = true;
                        break;
                    }
                }
            }
            if(!selected){
                node.selected = true;
                this.value = node.value?node.value:'';
            }
        }
        return HTMLElement.prototype.appendChild.apply(this, [node]);
    },
    toString: function() {
        return '[object HTMLOptGroupElement]';
    }
});

/**
 * HTMLOptionElement, Option
 * HTML5: 4.10.10 The option element
 * http://dev.w3.org/html5/spec/Overview.html#the-option-element
 */
HTMLOptionElement = function(ownerDocument) {
    HTMLInputCommon.apply(this, arguments);
    this._selected = null;
};
HTMLOptionElement.prototype = new HTMLInputCommon();
__extend__(HTMLOptionElement.prototype, {

    /**
     * defaultSelected actually reflects the presence of the
     * 'selected' attribute.
     */
    get defaultSelected() {
        return this.hasAttribute('selected');
    },
    set defaultSelected(value) {
        if (value) {
            this.setAttribute('selected','');
        } else {
            if (this.hasAttribute('selected')) {
                this.removeAttribute('selected');
            }
        }
    },

    /*
     * HTML5: The form IDL attribute's behavior depends on whether the
     * option element is in a select element or not. If the option has
     * a select element as its parent, or has a colgroup element as
     * its parent and that colgroup element has a select element as
     * its parent, then the form IDL attribute must return the same
     * value as the form IDL attribute on that select
     * element. Otherwise, it must return null.
     */
    _selectparent: function() {
        var parent = this.parentNode;
        if (!parent) {
            return null;
        }

        if (parent.tagName === 'SELECT') {
            return parent;
        }
        if (parent.tagName === 'COLGROUP') {
            parent = parent.parentNode;
            if (parent && parent.tagName === 'SELECT') {
                return parent;
            }
        }
    },
    _updateoptions: function() {
        var parent = this._selectparent();
        if (parent) {
            // has side effects and updates owner select's options
            parent.options;
        }
    },
    get form() {
        var parent = this._selectparent();
        return parent ? parent.form : null;
    },
    get index() {
        var options, i;

        if (! this.parentNode) {
            return -1;
        }
        options = this.parentNode.options;
        for (i=0; i < options.length; ++i) {
            if (this === options[i]) {
                return i;
            }
        }
        return 0;
    },
    get label() {
        return this.getAttribute('label');
    },
    set label(value) {
        this.setAttribute('label', value);
    },

    /*
     * This is not in the spec, but safari and firefox both
     * use this
     */
    get name() {
        return this.getAttribute('name');
    },
    set name(value) {
        this.setAttribute('name', value);
    },

    /**
     *
     */
    get selected() {
        // if disabled, return false, no matter what
        if (this.disabled) {
            return false;
        }
        if (this._selected === null) {
            return this.defaultSelected;
        }

        return this._selected;
    },
    set selected(value) {
        this._selected = (value) ? true : false;
    },

    get text() {
        var val = this.nodeValue;
        return (val === null || this.value === undefined) ?
            this.innerHTML :
            val;
    },
    get value() {
        var val = this.getAttribute('value');
        return (val === null || val === undefined) ?
            this.textContent :
            val;
    },
    set value(value) {
        this.setAttribute('value', value);
    },
    toString: function() {
        return '[object HTMLOptionElement]';
    }
});

Option = function(text, value, defaultSelected, selected) {

    // Not sure if this is correct:
    //
    // The element's document must be the active document of the
    // browsing context of the Window object on which the interface
    // object of the invoked constructor is found.
    HTMLOptionElement.apply(this, [document]);
    this.nodeName = 'OPTION';

    if (arguments.length >= 1) {
        this.appendChild(document.createTextNode('' + text));
    }
    if (arguments.length >= 2) {
        this.value = value;
    }
    if (arguments.length >= 3) {
        if (defaultSelected) {
            this.defaultSelected = '';
        }
    }
    if (arguments.length >= 4) {
        this.selected = (selected) ? true : false;
    }
};

Option.prototype = new HTMLOptionElement();

// Named Element Support

function updater(node, value) {
    node._updateoptions();
}
HTMLElement.registerSetAttribute('OPTION', 'name', updater);
HTMLElement.registerSetAttribute('OPTION', 'id', updater);

/*
* HTMLParagraphElement - DOM Level 2
*/
HTMLParagraphElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLParagraphElement.prototype = new HTMLElement();
__extend__(HTMLParagraphElement.prototype, {
    toString: function(){
        return '[object HTMLParagraphElement]';
    }
});


/**
 * HTMLParamElement
 *
 * HTML5: 4.8.6 The param element
 * http://dev.w3.org/html5/spec/Overview.html#the-param-element
 */
HTMLParamElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLParamElement.prototype = new HTMLElement();
__extend__(HTMLParamElement.prototype, {
    get name() {
        return this.getAttribute('name') || '';
    },
    set name(value) {
        this.setAttribute('name', value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    get value(){
        return this.getAttribute('value');
    },
    set value(value){
        this.setAttribute('value',value);
    },
    get valueType(){
        return this.getAttribute('valuetype');
    },
    set valueType(value){
        this.setAttribute('valuetype',value);
    },
    toString: function() {
        return '[object HTMLParamElement]';
    }
});


/*
 * HTMLPreElement
 * HTML5: 4.5.4 The pre Element
 * http://dev.w3.org/html5/spec/Overview.html#the-pre-element
 */
HTMLPreElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLPreElement.prototype = new HTMLElement();
__extend__(HTMLPreElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLPreElement]';
    }
});


/**
 * HTMLScriptElement - DOM Level 2
 *
 * HTML5: 4.3.1 The script element
 * http://dev.w3.org/html5/spec/Overview.html#script
 */
HTMLScriptElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLScriptElement.prototype = new HTMLElement();
__extend__(HTMLScriptElement.prototype, {

    /**
     * HTML5 spec @ http://dev.w3.org/html5/spec/Overview.html#script
     *
     * "The IDL attribute text must return a concatenation of the
     * contents of all the text nodes that are direct children of the
     * script element (ignoring any other nodes such as comments or
     * elements), in tree order. On setting, it must act the same way
     * as the textContent IDL attribute."
     *
     * AND... "The term text node refers to any Text node,
     * including CDATASection nodes; specifically, any Node with node
     * type TEXT_NODE (3) or CDATA_SECTION_NODE (4)"
     */
    get text() {
        var kids = this.childNodes;
        var kid;
        var s = '';
        var imax = kids.length;
        for (var i = 0; i < imax; ++i) {
            kid = kids[i];
            if (kid.nodeType === Node.TEXT_NODE ||
                kid.nodeType === Node.CDATA_SECTION_NODE) {
                s += kid.nodeValue;
            }
        }
        return s;
    },

    /**
     * HTML5 spec "Can be set, to replace the element's children with
     * the given value."
     */
    set text(value) {
        // this deletes all children, and make a new single text node
        // with value
        this.textContent = value;

        /* Currently we always execute, but this isn't quite right if
         * the node has *not* been inserted into the document, then it
         * should *not* fire.  The more detailed answer from the spec:
         *
         * When a script element that is neither marked as having
         * "already started" nor marked as being "parser-inserted"
         * experiences one of the events listed in the following list,
         * the user agent must synchronously run the script element:
         *
         *   * The script element gets inserted into a document.
         *   * The script element is in a Document and its child nodes
         *     are changed.
         *   * The script element is in a Document and has a src
         *     attribute set where previously the element had no such
         *     attribute.
         *
         * And no doubt there are other cases as well.
         */
        Envjs.loadInlineScript(this);
    },

    get htmlFor(){
        return this.getAttribute('for');
    },
    set htmlFor(value){
        this.setAttribute('for',value);
    },
    get event(){
        return this.getAttribute('event');
    },
    set event(value){
        this.setAttribute('event',value);
    },
    get charset(){
        return this.getAttribute('charset');
    },
    set charset(value){
        this.setAttribute('charset',value);
    },
    get defer(){
        return this.getAttribute('defer');
    },
    set defer(value){
        this.setAttribute('defer',value);
    },
    get src(){
        return this.getAttribute('src')||'';
    },
    set src(value){
        this.setAttribute('src',value);
    },
    get type(){
        return this.getAttribute('type')||'';
    },
    set type(value){
        this.setAttribute('type',value);
    },
    onload: HTMLEvents.prototype.onload,
    onerror: HTMLEvents.prototype.onerror,
    toString: function() {
        return '[object HTMLScriptElement]';
    }
});


/**
 * HTMLSelectElement
 * HTML5: http://dev.w3.org/html5/spec/Overview.html#the-select-element
 */
HTMLSelectElement = function(ownerDocument) {
    HTMLTypeValueInputs.apply(this, arguments);
    this._oldIndex = -1;
};

HTMLSelectElement.prototype = new HTMLTypeValueInputs();
__extend__(HTMLSelectElement.prototype, inputElements_dataProperties);
__extend__(HTMLButtonElement.prototype, inputElements_size);
__extend__(HTMLSelectElement.prototype, inputElements_onchange);
__extend__(HTMLSelectElement.prototype, inputElements_focusEvents);
__extend__(HTMLSelectElement.prototype, {

    get value() {
        var index = this.selectedIndex;
        return (index === -1) ? '' : this.options[index].value;
    },
    set value(newValue) {
        var options = this.options;
        var imax = options.length;
        for (var i=0; i< imax; ++i) {
            if (options[i].value == newValue) {
                this.setAttribute('value', newValue);
                this.selectedIndex = i;
                return;
            }
        }
    },
    get multiple() {
        return this.hasAttribute('multiple');
    },
    set multiple(value) {
        if (value) {
            this.setAttribute('multiple', '');
        } else {
            if (this.hasAttribute('multiple')) {
                this.removeAttribute('multiple');
            }
        }
    },
    // Returns HTMLOptionsCollection
    get options() {
        var nodes = this.getElementsByTagName('option');
        var alist = [];
        var i, tmp;
        for (i = 0; i < nodes.length; ++i) {
            alist.push(nodes[i]);
            this[i] = nodes[i];
            tmp = nodes[i].name;
            if (tmp) {
                this[tmp] = nodes[i];
            }
            tmp = nodes[i].id;
            if (tmp) {
                this[tmp] = nodes[i];
            }
        }
        return new HTMLCollection(alist);
    },
    get length() {
        return this.options.length;
    },
    item: function(idx) {
        return this.options[idx];
    },
    namedItem: function(aname) {
        return this.options[aname];
    },

    get selectedIndex() {
        var options = this.options;
        var imax = options.length;
        for (var i=0; i < imax; ++i) {
            if (options[i].selected) {
                //console.log('select get selectedIndex %s', i);
                return i;
            }
        }
        //console.log('select get selectedIndex %s', -1);
        return -1;
    },

    set selectedIndex(value) {
        var options = this.options;
        var num = Number(value);
        var imax = options.length;
        for (var i = 0; i < imax; ++i) {
            options[i].selected = (i === num);
        }
    },
    get type() {
        return this.multiple ? 'select-multiple' : 'select-one';
    },

    add: function(element, before) {
        this.appendChild(element);
        //__add__(this);
    },
    remove: function() {
        __remove__(this);
    },
    toString: function() {
        return '[object HTMLSelectElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('SELECT', 'name',
                                 __updateFormForNamedElement__);
/**
 * HTML 5: 4.6.22 The span element
 * http://dev.w3.org/html5/spec/Overview.html#the-span-element
 * 
 */
HTMLSpanElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLSpanElement.prototype = new HTMLElement();
__extend__(HTMLSpanElement.prototype, {
    toString: function(){
        return '[object HTMLSpanElement]';
    }
});


/**
 * HTMLStyleElement - DOM Level 2
 * HTML5 4.2.6 The style element
 * http://dev.w3.org/html5/spec/Overview.html#the-style-element
 */
HTMLStyleElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLStyleElement.prototype = new HTMLElement();
__extend__(HTMLStyleElement.prototype, {
    get disabled(){
        return this.getAttribute('disabled');
    },
    set disabled(value){
        this.setAttribute('disabled',value);
    },
    get media(){
        return this.getAttribute('media');
    },
    set media(value){
        this.setAttribute('media',value);
    },
    get type(){
        return this.getAttribute('type');
    },
    set type(value){
        this.setAttribute('type',value);
    },
    toString: function() {
        return '[object HTMLStyleElement]';
    }
});

/**
 * HTMLTableElement - DOM Level 2
 * Implementation Provided by Steven Wood
 *
 * HTML5: 4.9.1 The table element
 * http://dev.w3.org/html5/spec/Overview.html#the-table-element
 */
HTMLTableElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableElement.prototype = new HTMLElement();
__extend__(HTMLTableElement.prototype, {

    get tFoot() {
        //tFoot returns the table footer.
        return this.getElementsByTagName("tfoot")[0];
    },

    createTFoot : function () {
        var tFoot = this.tFoot;

        if (!tFoot) {
            tFoot = document.createElement("tfoot");
            this.appendChild(tFoot);
        }

        return tFoot;
    },

    deleteTFoot : function () {
        var foot = this.tFoot;
        if (foot) {
            foot.parentNode.removeChild(foot);
        }
    },

    get tHead() {
        //tHead returns the table head.
        return this.getElementsByTagName("thead")[0];
    },

    createTHead : function () {
        var tHead = this.tHead;

        if (!tHead) {
            tHead = document.createElement("thead");
            this.insertBefore(tHead, this.firstChild);
        }

        return tHead;
    },

    deleteTHead : function () {
        var head = this.tHead;
        if (head) {
            head.parentNode.removeChild(head);
        }
    },

    /*appendChild : function (child) {

      var tagName;
      if(child&&child.nodeType==Node.ELEMENT_NODE){
      tagName = child.tagName.toLowerCase();
      if (tagName === "tr") {
      // need an implcit <tbody> to contain this...
      if (!this.currentBody) {
      this.currentBody = document.createElement("tbody");

      Node.prototype.appendChild.apply(this, [this.currentBody]);
      }

      return this.currentBody.appendChild(child);

      } else if (tagName === "tbody" || tagName === "tfoot" && this.currentBody) {
      this.currentBody = child;
      return Node.prototype.appendChild.apply(this, arguments);

      } else {
      return Node.prototype.appendChild.apply(this, arguments);
      }
      }else{
      //tables can still have text node from white space
      return Node.prototype.appendChild.apply(this, arguments);
      }
      },*/

    get tBodies() {
        return new HTMLCollection(this.getElementsByTagName("tbody"));

    },

    get rows() {
        return new HTMLCollection(this.getElementsByTagName("tr"));
    },

    insertRow : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableElement.insertRow ");
        }

        var rows = this.rows,
            numRows = rows.length,
            node,
            inserted,
            lastRow;

        if (idx > numRows) {
            throw new Error("Index > rows.length in call to HTMLTableElement.insertRow");
        }

        inserted = document.createElement("tr");
        // If index is -1 or equal to the number of rows,
        // the row is appended as the last row. If index is omitted
        // or greater than the number of rows, an error will result
        if (idx === -1 || idx === numRows) {
            this.appendChild(inserted);
        } else {
            rows[idx].parentNode.insertBefore(inserted, rows[idx]);
        }

        return inserted;
    },

    deleteRow : function (idx) {
        var elem = this.rows[idx];
        elem.parentNode.removeChild(elem);
    },

    get summary() {
        return this.getAttribute("summary");
    },

    set summary(summary) {
        this.setAttribute("summary", summary);
    },

    get align() {
        return this.getAttribute("align");
    },

    set align(align) {
        this.setAttribute("align", align);
    },

    get bgColor() {
        return this.getAttribute("bgColor");
    },

    set bgColor(bgColor) {
        return this.setAttribute("bgColor", bgColor);
    },

    get cellPadding() {
        return this.getAttribute("cellPadding");
    },

    set cellPadding(cellPadding) {
        return this.setAttribute("cellPadding", cellPadding);
    },

    get cellSpacing() {
        return this.getAttribute("cellSpacing");
    },

    set cellSpacing(cellSpacing) {
        this.setAttribute("cellSpacing", cellSpacing);
    },

    get frame() {
        return this.getAttribute("frame");
    },

    set frame(frame) {
        this.setAttribute("frame", frame);
    },

    get rules() {
        return this.getAttribute("rules");
    },

    set rules(rules) {
        this.setAttribute("rules", rules);
    },

    get width() {
        return this.getAttribute("width");
    },

    set width(width) {
        this.setAttribute("width", width);
    },
    toString: function() {
        return '[object HTMLTableElement]';
    }
});

/*
 * HTMLxElement - DOM Level 2
 * - Contributed by Steven Wood
 *
 * HTML5: 4.9.5 The tbody element
 * http://dev.w3.org/html5/spec/Overview.html#the-tbody-element
 * http://dev.w3.org/html5/spec/Overview.html#htmltablesectionelement
 */
HTMLTableSectionElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableSectionElement.prototype = new HTMLElement();
__extend__(HTMLTableSectionElement.prototype, {

    /*appendChild : function (child) {

    // disallow nesting of these elements.
    if (child.tagName.match(/TBODY|TFOOT|THEAD/)) {
    return this.parentNode.appendChild(child);
    } else {
    return Node.prototype.appendChild.apply(this, arguments);
    }

    },*/

    get align() {
        return this.getAttribute("align");
    },

    get ch() {
        return this.getAttribute("ch");
    },

    set ch(ch) {
        this.setAttribute("ch", ch);
    },

    // ch gets or sets the alignment character for cells in a column.
    set chOff(chOff) {
        this.setAttribute("chOff", chOff);
    },

    get chOff() {
        return this.getAttribute("chOff");
    },

    get vAlign () {
        return this.getAttribute("vAlign");
    },

    get rows() {
        return new HTMLCollection(this.getElementsByTagName("tr"));
    },

    insertRow : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableSectionElement.insertRow ");
        }

        var numRows = this.rows.length,
        node = null;

        if (idx > numRows) {
            throw new Error("Index > rows.length in call to HTMLTableSectionElement.insertRow");
        }

        var row = document.createElement("tr");
        // If index is -1 or equal to the number of rows,
        // the row is appended as the last row. If index is omitted
        // or greater than the number of rows, an error will result
        if (idx === -1 || idx === numRows) {
            this.appendChild(row);
        } else {
            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }

        this.insertBefore(row, node);

        return row;
    },

    deleteRow : function (idx) {
        var elem = this.rows[idx];
        this.removeChild(elem);
    },

    toString: function() {
        return '[object HTMLTableSectionElement]';
    }
});

/**
 * HTMLTableCellElement
 * base interface for TD and TH
 *
 * HTML5: 4.9.11 Attributes common to td and th elements
 * http://dev.w3.org/html5/spec/Overview.html#htmltablecellelement
 */
HTMLTableCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableCellElement.prototype = new HTMLElement();
__extend__(HTMLTableCellElement.prototype, {


    // TOOD: attribute unsigned long  colSpan;
    // TODO: attribute unsigned long  rowSpan;
    // TODO: attribute DOMString      headers;
    // TODO: readonly attribute long  cellIndex;

    // Not really necessary but might be helpful in debugging
    toString: function() {
        return '[object HTMLTableCellElement]';
    }

});

/**
 * HTMLTableDataCellElement
 * HTML5: 4.9.9 The td Element
 * http://dev.w3.org/html5/spec/Overview.html#the-td-element
 */
HTMLTableDataCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableDataCellElement.prototype = new HTMLTableCellElement();
__extend__(HTMLTableDataCellElement.prototype, {

    // adds no new properties or methods

    toString: function() {
        return '[object HTMLTableDataCellElement]';
    }
});

/**
 * HTMLTableHeaderCellElement
 * HTML5: 4.9.10 The th Element
 * http://dev.w3.org/html5/spec/Overview.html#the-th-element
 */
HTMLTableHeaderCellElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableHeaderCellElement.prototype = new HTMLTableCellElement();
__extend__(HTMLTableHeaderCellElement.prototype, {

    // TODO:  attribute DOMString scope

    toString: function() {
        return '[object HTMLTableHeaderCellElement]';
    }
});


/**
 * HTMLTextAreaElement - DOM Level 2
 * HTML5: 4.10.11 The textarea element
 * http://dev.w3.org/html5/spec/Overview.html#the-textarea-element
 */
HTMLTextAreaElement = function(ownerDocument) {
    HTMLInputAreaCommon.apply(this, arguments);
    this._rawvalue = null;
};
HTMLTextAreaElement.prototype = new HTMLInputAreaCommon();
__extend__(HTMLTextAreaElement.prototype, {
    get cols(){
        return Number(this.getAttribute('cols')||'-1');
    },
    set cols(value){
        this.setAttribute('cols', value);
    },
    get rows(){
        return Number(this.getAttribute('rows')||'-1');
    },
    set rows(value){
        this.setAttribute('rows', value);
    },

    /*
     * read-only
     */
    get type() {
        return this.getAttribute('type') || 'textarea';
    },

    /**
     * This modifies the text node under the widget
     */
    get defaultValue() {
        return this.textContent;
    },
    set defaultValue(value) {
        this.textContent = value;
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#concept-textarea-raw-value
     */
    get value() {
        return (this._rawvalue === null) ? this.defaultValue : this._rawvalue;
    },
    set value(value) {
        this._rawvalue = value;
    },
    toString: function() {
        return '[object HTMLTextAreaElement]';
    }
});

// Named Element Support
HTMLElement.registerSetAttribute('TEXTAREA', 'name',
                                 __updateFormForNamedElement__);

/**
 * HTMLTitleElement - DOM Level 2
 *
 * HTML5: 4.2.2 The title element
 * http://dev.w3.org/html5/spec/Overview.html#the-title-element-0
 */
HTMLTitleElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTitleElement.prototype = new HTMLElement();
__extend__(HTMLTitleElement.prototype, {
    get text() {
        return this.innerText;
    },

    set text(titleStr) {
        this.textContent = titleStr;
    },
    toString: function() {
        return '[object HTMLTitleElement]';
    }
});



/**
 * HTMLRowElement - DOM Level 2
 * Implementation Provided by Steven Wood
 *
 * HTML5: 4.9.8 The tr element
 * http://dev.w3.org/html5/spec/Overview.html#the-tr-element
 */
HTMLTableRowElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLTableRowElement.prototype = new HTMLElement();
__extend__(HTMLTableRowElement.prototype, {

    /*appendChild : function (child) {

      var retVal = Node.prototype.appendChild.apply(this, arguments);
      retVal.cellIndex = this.cells.length -1;

      return retVal;
      },*/
    // align gets or sets the horizontal alignment of data within cells of the row.
    get align() {
        return this.getAttribute("align");
    },

    get bgColor() {
        return this.getAttribute("bgcolor");
    },

    get cells() {
        var nl = this.getElementsByTagName("td");
        return new HTMLCollection(nl);
    },

    get ch() {
        return this.getAttribute("ch");
    },

    set ch(ch) {
        this.setAttribute("ch", ch);
    },

    // ch gets or sets the alignment character for cells in a column.
    set chOff(chOff) {
        this.setAttribute("chOff", chOff);
    },

    get chOff() {
        return this.getAttribute("chOff");
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#dom-tr-rowindex
     */
    get rowIndex() {
        var nl = this.parentNode.childNodes;
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
        return -1;
    },

    /**
     * http://dev.w3.org/html5/spec/Overview.html#dom-tr-sectionrowindex
     */
    get sectionRowIndex() {
        var nl = this.parentNode.getElementsByTagName(this.tagName);
        for (var i=0; i<nl.length; i++) {
            if (nl[i] === this) {
                return i;
            }
        }
        return -1;
    },

    get vAlign () {
        return this.getAttribute("vAlign");
    },

    insertCell : function (idx) {
        if (idx === undefined) {
            throw new Error("Index omitted in call to HTMLTableRow.insertCell");
        }

        var numCells = this.cells.length,
        node = null;

        if (idx > numCells) {
            throw new Error("Index > rows.length in call to HTMLTableRow.insertCell");
        }

        var cell = document.createElement("td");

        if (idx === -1 || idx === numCells) {
            this.appendChild(cell);
        } else {


            node = this.firstChild;

            for (var i=0; i<idx; i++) {
                node = node.nextSibling;
            }
        }

        this.insertBefore(cell, node);
        cell.cellIndex = idx;

        return cell;
    },
    deleteCell : function (idx) {
        var elem = this.cells[idx];
        this.removeChild(elem);
    },
    toString: function() {
        return '[object HTMLTableRowElement]';
    }

});

/*
 * HTMLUListElement
 * HTML5: 4.5.7 The ul Element
 * http://dev.w3.org/html5/spec/Overview.html#htmlhtmlelement
 */
HTMLUListElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};

HTMLUListElement.prototype = new HTMLElement();
__extend__(HTMLUListElement.prototype, {

    // no additional properties or elements

    toString: function() {
        return '[object HTMLUListElement]';
    }
});


/**
 * HTMLUnknownElement DOM Level 2
 */
HTMLUnknownElement = function(ownerDocument) {
    HTMLElement.apply(this, arguments);
};
HTMLUnknownElement.prototype = new HTMLElement();
__extend__(HTMLUnknownElement.prototype,{
    toString: function(){
        return '[object HTMLUnknownElement]';
    }
});

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

/**
 * DOM Style Level 2
 */
/*var CSS2Properties,
    CSSRule,
    CSSStyleRule,
    CSSImportRule,
    CSSMediaRule,
    CSSFontFaceRule,
    CSSPageRule,
    CSSRuleList,
    CSSStyleSheet,
    StyleSheet,
    StyleSheetList;
;*/

/*
 * Envjs css.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}

/**
 * @author ariel flesler
 *    http://flesler.blogspot.com/2008/11/fast-trim-function-for-javascript.html
 * @param {Object} str
 */
function __trim__( str ){
    return (str || "").replace( /^\s+|\s+$/g, "" );
}

/*
 * Interface DocumentStyle (introduced in DOM Level 2)
 * http://www.w3.org/TR/2000/REC-DOM-Level-2-Style-20001113/stylesheets.html#StyleSheets-StyleSheet-DocumentStyle
 *
 * interface DocumentStyle {
 *   readonly attribute StyleSheetList   styleSheets;
 * };
 *
 */
__extend__(Document.prototype, {
    get styleSheets() {
        if (! this._styleSheets) {
            this._styleSheets = new StyleSheetList();
        }
        return this._styleSheets;
    }
});
/*
 * CSS2Properties - DOM Level 2 CSS
 * Renamed to CSSStyleDeclaration??
 */

var __toCamelCase__ = function(name) {
    if (name) {
        return name.replace(/\-(\w)/g, function(all, letter) {
            return letter.toUpperCase();
        });
    }
    return name;
};

var __toDashed__ = function(camelCaseName) {
    if (camelCaseName) {
        return camelCaseName.replace(/[A-Z]/g, function(all) {
            return '-' + all.toLowerCase();
        });
    }
    return camelCaseName;
};

CSS2Properties = function(element){
    //console.log('css2properties %s', __cssproperties__++);
    this.styleIndex = __supportedStyles__;//non-standard
    this.type = element.tagName;//non-standard
    __setArray__(this, []);
    __cssTextToStyles__(this, element.cssText || '');
};
__extend__(CSS2Properties.prototype, {
    get cssText() {
        var i, css = [];
        for (i = 0; i < this.length; ++i) {
            css.push(this[i] + ': ' + this.getPropertyValue(this[i]) + ';');
        }
        return css.join(' ');
    },
    set cssText(cssText) {
        __cssTextToStyles__(this, cssText);
    },
    getPropertyCSSValue: function(name) {
        //?
    },
    getPropertyPriority: function() {

    },
    getPropertyValue: function(name) {
        var index, cname = __toCamelCase__(name);
        if (cname in this.styleIndex) {
            return this[cname];
        } else {
            index = Array.prototype.indexOf.apply(this, [name]);
            if (index > -1) {
                return this[index];
            }
        }
        return null;
    },
    item: function(index) {
        return this[index];
    },
    removeProperty: function(name) {
        this.styleIndex[name] = null;
        name = __toDashed__(name);
        var index = Array.prototype.indexOf.apply(this, [name]);
        if (index > -1) {
            Array.prototype.splice.apply(this, [1,index]);
        }
    },
    setProperty: function(name, value, priority) {
        var nval;
        name = __toCamelCase__(name);
        if (value !== undefined && name in this.styleIndex) {
            // NOTE:  parseFloat('300px') ==> 300  no
            // NOTE:  Number('300px') ==> Nan      yes
            nval = Number(value);
            this.styleIndex[name] = isNaN(nval) ? value : nval;
            name = __toDashed__(name);
            if (Array.prototype.indexOf.apply(this, [name]) === -1 ){
                Array.prototype.push.apply(this,[name]);
            }
        }
    },
    toString: function() {
        return '[object CSS2Properties]';
    }
});



var __cssTextToStyles__ = function(css2props, cssText) {
    //console.log('__cssTextToStyles__ %s %s', css2props, cssText);
    //var styleArray=[];
    var i, style, styles = cssText.split(';');
    for (i = 0; i < styles.length; ++i) {
        style = styles[i].split(':');
        if (style.length === 2) {
            css2props.setProperty(style[0].replace(' ', '', 'g'),
                                  style[1].replace(' ', '', 'g'));
        }
    }
};

//Obviously these arent all supported but by commenting out various
//sections this provides a single location to configure what is
//exposed as supported.
var __supportedStyles__ = {
    azimuth:                null,
    background:             null,
    backgroundAttachment:   null,
    backgroundColor:        'rgb(0,0,0)',
    backgroundImage:        null,
    backgroundPosition:     null,
    backgroundRepeat:       null,
    border:                 null,
    borderBottom:           null,
    borderBottomColor:      null,
    borderBottomStyle:      null,
    borderBottomWidth:      null,
    borderCollapse:         null,
    borderColor:            null,
    borderLeft:             null,
    borderLeftColor:        null,
    borderLeftStyle:        null,
    borderLeftWidth:        null,
    borderRight:            null,
    borderRightColor:       null,
    borderRightStyle:       null,
    borderRightWidth:       null,
    borderSpacing:          null,
    borderStyle:            null,
    borderTop:              null,
    borderTopColor:         null,
    borderTopStyle:         null,
    borderTopWidth:         null,
    borderWidth:            null,
    bottom:                 null,
    captionSide:            null,
    clear:                  null,
    clip:                   null,
    color:                  null,
    content:                null,
    counterIncrement:       null,
    counterReset:           null,
    cssFloat:               null,
    cue:                    null,
    cueAfter:               null,
    cueBefore:              null,
    cursor:                 null,
    direction:              'ltr',
    display:                null,
    elevation:              null,
    emptyCells:             null,
    font:                   null,
    fontFamily:             null,
    fontSize:               '1em',
    fontSizeAdjust:         null,
    fontStretch:            null,
    fontStyle:              null,
    fontVariant:            null,
    fontWeight:             null,
    height:                 '',
    left:                   null,
    letterSpacing:          null,
    lineHeight:             null,
    listStyle:              null,
    listStyleImage:         null,
    listStylePosition:      null,
    listStyleType:          null,
    margin:                 null,
    marginBottom:           '0px',
    marginLeft:             '0px',
    marginRight:            '0px',
    marginTop:              '0px',
    markerOffset:           null,
    marks:                  null,
    maxHeight:              null,
    maxWidth:               null,
    minHeight:              null,
    minWidth:               null,
    opacity:                1,
    orphans:                null,
    outline:                null,
    outlineColor:           null,
    outlineOffset:          null,
    outlineStyle:           null,
    outlineWidth:           null,
    overflow:               null,
    overflowX:              null,
    overflowY:              null,
    padding:                null,
    paddingBottom:          '0px',
    paddingLeft:            '0px',
    paddingRight:           '0px',
    paddingTop:             '0px',
    page:                   null,
    pageBreakAfter:         null,
    pageBreakBefore:        null,
    pageBreakInside:        null,
    pause:                  null,
    pauseAfter:             null,
    pauseBefore:            null,
    pitch:                  null,
    pitchRange:             null,
    position:               null,
    quotes:                 null,
    richness:               null,
    right:                  null,
    size:                   null,
    speak:                  null,
    speakHeader:            null,
    speakNumeral:           null,
    speakPunctuation:       null,
    speechRate:             null,
    stress:                 null,
    tableLayout:            null,
    textAlign:              null,
    textDecoration:         null,
    textIndent:             null,
    textShadow:             null,
    textTransform:          null,
    top:                    null,
    unicodeBidi:            null,
    verticalAlign:          null,
    visibility:             '',
    voiceFamily:            null,
    volume:                 null,
    whiteSpace:             null,
    widows:                 null,
    width:                  '1px',
    wordSpacing:            null,
    zIndex:                 1
};

var __displayMap__ = {
    DIV      : 'block',
    P        : 'block',
    A        : 'inline',
    CODE     : 'inline',
    PRE      : 'block',
    SPAN     : 'inline',
    TABLE    : 'table',
    THEAD    : 'table-header-group',
    TBODY    : 'table-row-group',
    TR       : 'table-row',
    TH       : 'table-cell',
    TD       : 'table-cell',
    UL       : 'block',
    LI       : 'list-item'
};

for (var style in __supportedStyles__) {
    if (__supportedStyles__.hasOwnProperty(style)) {
        (function(name) {
            if (name === 'width' || name === 'height') {
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    if (this.display === 'none'){
                        return '0px';
                    }
                    return this.styleIndex[name];
                });
            } else if (name === 'display') {
                //display will be set to a tagName specific value if ''
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    var val = this.styleIndex[name];
                    val = val ? val :__displayMap__[this.type];
                    return val;
                });
            } else {
                CSS2Properties.prototype.__defineGetter__(name, function() {
                    return this.styleIndex[name];
                });
            }
            CSS2Properties.prototype.__defineSetter__(name, function(value) {
                this.setProperty(name, value);
            });
        }(style));
    }
}

/*
 * CSSRule - DOM Level 2
 */
CSSRule = function(options) {



    var $style,
    $selectorText = options.selectorText ? options.selectorText : '';
    $style = new CSS2Properties({
        cssText: options.cssText ? options.cssText : null
    });

    return __extend__(this, {
        get style(){
            return $style;
        },
        get selectorText(){
            return $selectorText;
        },
        set selectorText(selectorText){
            $selectorText = selectorText;
        },
        toString : function(){
            return "[object CSSRule]";
        }
    });
};
CSSRule.STYLE_RULE     =  1;
CSSRule.IMPORT_RULE    =  3;
CSSRule.MEDIA_RULE     =  4;
CSSRule.FONT_FACE_RULE =  5;
CSSRule.PAGE_RULE      =  6;
//CSSRule.NAMESPACE_RULE = 10;


CSSStyleRule = function() {

};

CSSImportRule = function() {

};

CSSMediaRule = function() {

};

CSSFontFaceRule = function() {

};

CSSPageRule = function() {

};


CSSRuleList = function(data) {
    this.length = 0;
    __setArray__(this, data);
};

__extend__(CSSRuleList.prototype, {
    item : function(index) {
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            return this[index];
        }
        return null;
    },
    toString: function() {
        return '[object CSSRuleList]';
    }
});

/**
 * StyleSheet
 * http://dev.w3.org/csswg/cssom/#stylesheet
 *
 * interface StyleSheet {
 *   readonly attribute DOMString type;
 *   readonly attribute DOMString href;
 *   readonly attribute Node ownerNode;
 *   readonly attribute StyleSheet parentStyleSheet;
 *   readonly attribute DOMString title;
 *   [PutForwards=mediaText] readonly attribute MediaList media;
 *          attribute boolean disabled;
 * };
 */
StyleSheet = function() {
}

/*
 * CSSStyleSheet
 * http://dev.w3.org/csswg/cssom/#cssstylesheet
 *
 * interface CSSStyleSheet : StyleSheet {
 *   readonly attribute CSSRule ownerRule;
 *   readonly attribute CSSRuleList cssRules;
 *   unsigned long insertRule(DOMString rule, unsigned long index);
 *   void deleteRule(unsigned long index);
 * };
 */
CSSStyleSheet = function(options){
    var $cssRules,
        $disabled = options.disabled ? options.disabled : false,
        $href = options.href ? options.href : null,
        $parentStyleSheet = options.parentStyleSheet ? options.parentStyleSheet : null,
        $title = options.title ? options.title : "",
        $type = "text/css";

    function parseStyleSheet(text){
        //$debug("parsing css");
        //this is pretty ugly, but text is the entire text of a stylesheet
        var cssRules = [];
        if (!text) {
            text = '';
        }
        text = __trim__(text.replace(/\/\*(\r|\n|.)*\*\//g,""));
        // TODO: @import
        var blocks = text.split("}");
        blocks.pop();
        var i, j, len = blocks.length;
        var definition_block, properties, selectors;
        for (i=0; i<len; i++) {
            definition_block = blocks[i].split("{");
            if (definition_block.length === 2) {
                selectors = definition_block[0].split(",");
                for (j=0; j<selectors.length; j++) {
                    cssRules.push(new CSSRule({
                        selectorText : __trim__(selectors[j]),
                        cssText      : definition_block[1]
                    }));
                }
            }
        }
        return cssRules;
    }

    $cssRules = new CSSRuleList(parseStyleSheet(options.textContent));

    return __extend__(this, {
        get cssRules(){
            return $cssRules;
        },
        get rule(){
            return $cssRules;
        },//IE - may be deprecated
        get href(){
            return $href;
        },
        get parentStyleSheet(){
            return $parentStyleSheet;
        },
        get title(){
            return $title;
        },
        get type(){
            return $type;
        },
        addRule: function(selector, style, index){/*TODO*/},
        deleteRule: function(index){/*TODO*/},
        insertRule: function(rule, index){/*TODO*/},
        //IE - may be deprecated
        removeRule: function(index){
            this.deleteRule(index);
        }
    });
};

StyleSheetList = function() {
}
StyleSheetList.prototype = new Array();
__extend__(StyleSheetList.prototype, {
    item : function(index) {
        if ((index >= 0) && (index < this.length)) {
            // bounds check
            return this[index];
        }
        return null;
    },
    toString: function() {
        return '[object StyleSheetList]';
    }
});
/**
 * This extends HTMLElement to handle CSS-specific interfaces.
 *
 * More work / research would be needed to extend just (DOM) Element
 * for xml use and additional changes for just HTMLElement.
 */


/**
 * Replace or add  the getter for 'style'
 *
 * This could be wrapped in a closure
 */
var $css2properties = [{}];

__extend__(HTMLElement.prototype, {
    get style(){
        if ( !this.css2uuid ) {
            this.css2uuid = $css2properties.length;
            $css2properties[this.css2uuid] = new CSS2Properties(this);
        }
        return $css2properties[this.css2uuid];
    }
});

/**
 * Change for how 'setAttribute("style", ...)' works
 *
 * We are truly adding functionality to HtmlElement.setAttribute, not
 * replacing it.  So we need to save the old one first, call it, then
 * do our stuff.  If we need to do more hacks like this, HTMLElement
 * (or regular Element) needs to have a hooks array or dispatch table
 * for global changes.
 *
 * This could be wrapped in a closure if desired.
 */
var updateCss2Props = function(elem, values) {
    //console.log('__updateCss2Props__ %s %s', elem, values);
    if ( !elem.css2uuid ) {
        elem.css2uuid = $css2properties.length;
        $css2properties[elem.css2uuid] = new CSS2Properties(elem);
    }
    __cssTextToStyles__($css2properties[elem.css2uuid], values);
};

var origSetAttribute =  HTMLElement.prototype.setAttribute;

HTMLElement.prototype.setAttribute = function(name, value) {
    //console.log("CSS set attribute: " + name + ", " + value);
    origSetAttribute.apply(this, arguments);
    if (name === "style") {
        updateCss2Props(this, value);
    }
};

var origGetAttribute =  HTMLElement.prototype.getAttribute;

HTMLElement.prototype.getAttribute = function(name) {
    //console.log("CSS set attribute: " + name + ", " + value);
	var style;
    if (name === "style") {
        style = this.style.cssText;
		return style===""?null:style;
    }else{
	    return origGetAttribute.apply(this, arguments);
	}
};

/**
 * @author john resig & the envjs team
 * @uri http://www.envjs.com/
 * @copyright 2008-2010
 * @license MIT
 */
//CLOSURE_END
}());

//these are both non-standard globals that
//provide static namespaces and functions
//to support the html 5 parser from nu.
XMLParser = {};
HTMLParser = {};
    
/*
 * Envjs parser.1.2.35 
 * Pure JavaScript Browser Environment
 * By John Resig <http://ejohn.org/> and the Envjs Team
 * Copyright 2008-2010 John Resig, under the MIT License
 */

//CLOSURE_START
(function(){





/**
 * @author john resig
 */
// Helper method for extending one object with another.
function __extend__(a,b) {
    for ( var i in b ) {
        var g = b.__lookupGetter__(i), s = b.__lookupSetter__(i);
        if ( g || s ) {
            if ( g ) { a.__defineGetter__(i, g); }
            if ( s ) { a.__defineSetter__(i, s); }
        } else {
            a[i] = b[i];
        }
    } return a;
}

/**
 * @author john resig
 */
//from jQuery
function __setArray__( target, array ) {
    // Resetting the length to 0, then using the native Array push
    // is a super-fast way to populate an object with array-like properties
    target.length = 0;
    Array.prototype.push.apply( target, array );
}
var $_window = this;var __defineParser__ = function(){};(function () {var $gwt_version = "2.0.3";var $wnd = $_window;var $doc = $wnd.document;var $moduleName, $moduleBase;var $stats = $wnd.__gwtStatsEvent ? function(a) {$wnd.__gwtStatsEvent(a)} : null;var $strongName = '30CDE3211C153B9ED1F6B0000BE9890D';var _, N8000000000000000_longLit = [0, -9223372036854775808], P1000000_longLit = [16777216, 0], P7fffffffffffffff_longLit = [4294967295, 9223372032559808512];
function nullMethod(){
}

function equals(other){
  return this === (other == null?null:other);
}

function getClass_0(){
  return Ljava_lang_Object_2_classLit;
}

function hashCode_0(){
  return this.$H || (this.$H = ++sNextHashId);
}

function toString_0(){
  return (this.typeMarker$ == nullMethod || this.typeId$ == 2?this.getClass$():Lcom_google_gwt_core_client_JavaScriptObject_2_classLit).typeName + '@' + toPowerOfTwoString(this.typeMarker$ == nullMethod || this.typeId$ == 2?this.hashCode$():this.$H || (this.$H = ++sNextHashId), 4);
}

function Object_0(){
}

_ = Object_0.prototype = {};
_.equals$ = equals;
_.getClass$ = getClass_0;
_.hashCode$ = hashCode_0;
_.toString$ = toString_0;
_.toString = function(){
  return this.toString$();
}
;
_.typeMarker$ = nullMethod;
_.typeId$ = 1;
function $setStackTrace(stackTrace){
  var c, copy, i;
  copy = initDim(_3Ljava_lang_StackTraceElement_2_classLit, 55, 9, stackTrace.length, 0);
  for (i = 0 , c = stackTrace.length; i < c; ++i) {
    if (!stackTrace[i]) {
      throw $NullPointerException(new NullPointerException);
    }
    copy[i] = stackTrace[i];
  }
}

function $toString(this$static){
  var className, msg;
  className = this$static.getClass$().typeName;
  msg = this$static.getMessage();
  if (msg != null) {
    return className + ': ' + msg;
  }
   else {
    return className;
  }
}

function getClass_1(){
  return Ljava_lang_Throwable_2_classLit;
}

function getMessage(){
  return this.detailMessage;
}

function toString_1(){
  return $toString(this);
}

function Throwable(){
}

_ = Throwable.prototype = new Object_0;
_.getClass$ = getClass_1;
_.getMessage = getMessage;
_.toString$ = toString_1;
_.typeId$ = 3;
_.detailMessage = null;
function getClass_2(){
  return Ljava_lang_Exception_2_classLit;
}

function Exception(){
}

_ = Exception.prototype = new Throwable;
_.getClass$ = getClass_2;
_.typeId$ = 4;
function $RuntimeException(this$static, message){
  $fillInStackTrace();
  this$static.detailMessage = message;
  return this$static;
}

function getClass_3(){
  return Ljava_lang_RuntimeException_2_classLit;
}

function RuntimeException(){
}

_ = RuntimeException.prototype = new Exception;
_.getClass$ = getClass_3;
_.typeId$ = 5;
function $JavaScriptException(this$static, e){
  $fillInStackTrace();
  this$static.e = e;
  $createStackTrace(this$static);
  return this$static;
}

function $getMessage_0(this$static){
  this$static.message_0 == null && (this$static.name_0 = getName(this$static.e) , this$static.description = getDescription(this$static.e) , this$static.message_0 = '(' + this$static.name_0 + '): ' + this$static.description + getProperties(this$static.e) , undefined);
  return this$static.message_0;
}

function getClass_4(){
  return Lcom_google_gwt_core_client_JavaScriptException_2_classLit;
}

function getDescription(e){
  if (e != null && e.typeMarker$ != nullMethod && e.typeId$ != 2) {
    return getDescription0(dynamicCastJso(e));
  }
   else {
    return e + '';
  }
}

function getDescription0(e){
  return e == null?null:e.message;
}

function getMessage_0(){
  return $getMessage_0(this);
}

function getName(e){
  if (e == null) {
    return 'null';
  }
   else if (e != null && e.typeMarker$ != nullMethod && e.typeId$ != 2) {
    return getName0(dynamicCastJso(e));
  }
   else if (e != null && canCast(e.typeId$, 1)) {
    return 'String';
  }
   else {
    return (e.typeMarker$ == nullMethod || e.typeId$ == 2?e.getClass$():Lcom_google_gwt_core_client_JavaScriptObject_2_classLit).typeName;
  }
}

function getName0(e){
  return e == null?null:e.name;
}

function getProperties(e){
  return e != null && e.typeMarker$ != nullMethod && e.typeId$ != 2?getProperties0(dynamicCastJso(e)):'';
}

function getProperties0(e){
  var result = '';
  try {
    for (prop in e) {
      if (prop != 'name' && prop != 'message' && prop != 'toString') {
        try {
          result += '\n ' + prop + ': ' + e[prop];
        }
         catch (ignored) {
        }
      }
    }
  }
   catch (ignored) {
  }
  return result;
}

function JavaScriptException(){
}

_ = JavaScriptException.prototype = new RuntimeException;
_.getClass$ = getClass_4;
_.getMessage = getMessage_0;
_.typeId$ = 6;
_.description = null;
_.e = null;
_.message_0 = null;
_.name_0 = null;
function createFunction(){
  return function(){
  }
  ;
}

function equals__devirtual$(this$static, other){
  return this$static.typeMarker$ == nullMethod || this$static.typeId$ == 2?this$static.equals$(other):(this$static == null?null:this$static) === (other == null?null:other);
}

function hashCode__devirtual$(this$static){
  return this$static.typeMarker$ == nullMethod || this$static.typeId$ == 2?this$static.hashCode$():this$static.$H || (this$static.$H = ++sNextHashId);
}

function getClass_6(){
  return Lcom_google_gwt_core_client_Scheduler_2_classLit;
}

function Scheduler(){
}

_ = Scheduler.prototype = new Object_0;
_.getClass$ = getClass_6;
_.typeId$ = 0;
function entry_0(jsFunction){
  return function(){
    return entry0(jsFunction, this, arguments);
  }
  ;
}

function entry0(jsFunction, thisObj, arguments_0){
  var initialEntry;
  initialEntry = entryDepth++ == 0;
  try {
    return jsFunction.apply(thisObj, arguments_0);
  }
   finally {
    initialEntry && $flushFinallyCommands(($clinit_12() , INSTANCE));
    --entryDepth;
  }
}

var entryDepth = 0, sNextHashId = 0;
function $clinit_12(){
  $clinit_12 = nullMethod;
  INSTANCE = $SchedulerImpl(new SchedulerImpl);
}

function $SchedulerImpl(this$static){
  $clinit_12();
  this$static.flusher = $SchedulerImpl$1(new SchedulerImpl$1, this$static);
  $SchedulerImpl$2(new SchedulerImpl$2, this$static);
  this$static.deferredCommands = [];
  this$static.incrementalCommands = [];
  this$static.finallyCommands = [];
  return this$static;
}

function $flushFinallyCommands(this$static){
  var oldFinally;
  oldFinally = this$static.finallyCommands;
  this$static.finallyCommands = [];
  runScheduledTasks(oldFinally, this$static.finallyCommands);
}

function $flushPostEventPumpCommands(this$static){
  var oldDeferred;
  oldDeferred = this$static.deferredCommands;
  this$static.deferredCommands = [];
  runScheduledTasks(oldDeferred, this$static.incrementalCommands);
  this$static.incrementalCommands = runRepeatingTasks(this$static.incrementalCommands);
}

function $isWorkQueued(this$static){
  return this$static.deferredCommands.length > 0 || this$static.incrementalCommands.length > 0;
}

function execute(cmd){
  return cmd.execute();
}

function getClass_7(){
  return Lcom_google_gwt_core_client_impl_SchedulerImpl_2_classLit;
}

function runRepeatingTasks(tasks){
  var canceledSomeTasks, i, length_0, newTasks, start, t;
  canceledSomeTasks = false;
  length_0 = tasks.length;
  start = (new Date).getTime();
  while ((new Date).getTime() - start < 100) {
    for (i = 0; i < length_0; ++i) {
      t = tasks[i];
      if (!t) {
        continue;
      }
      if (!t[0].execute()) {
        tasks[i] = null;
        canceledSomeTasks = true;
      }
    }
  }
  if (canceledSomeTasks) {
    newTasks = [];
    for (i = 0; i < length_0; ++i) {
      if (!tasks[i]) {
        continue;
      }
      newTasks[newTasks.length] = tasks[i];
    }
    return newTasks;
  }
   else {
    return tasks;
  }
}

function runScheduledTasks(tasks, rescheduled){
  var $e0, i, j, t;
  for (i = 0 , j = tasks.length; i < j; ++i) {
    t = tasks[i];
    try {
      t[1]?t[0].execute() && (rescheduled[rescheduled.length] = t , undefined):t[0].nullMethod();
    }
     catch ($e0) {
      $e0 = caught($e0);
      if (!instanceOf($e0, 2))
        throw $e0;
    }
  }
}

function scheduleFixedDelayImpl(cmd, delayMs){
  $clinit_12();
  $wnd.setTimeout(function(){
    var ret = $entry(execute)(cmd);
    ret && $wnd.setTimeout(arguments.callee, delayMs);
  }
  , delayMs);
}

function SchedulerImpl(){
}

_ = SchedulerImpl.prototype = new Scheduler;
_.getClass$ = getClass_7;
_.typeId$ = 0;
_.flushRunning = false;
_.shouldBeRunning = false;
var INSTANCE;
function $SchedulerImpl$1(this$static, this$0){
  this$static.this$0 = this$0;
  return this$static;
}

function execute_0(){
  this.this$0.flushRunning = true;
  $flushPostEventPumpCommands(this.this$0);
  this.this$0.flushRunning = false;
  return this.this$0.shouldBeRunning = $isWorkQueued(this.this$0);
}

function getClass_8(){
  return Lcom_google_gwt_core_client_impl_SchedulerImpl$1_2_classLit;
}

function SchedulerImpl$1(){
}

_ = SchedulerImpl$1.prototype = new Object_0;
_.execute = execute_0;
_.getClass$ = getClass_8;
_.typeId$ = 0;
_.this$0 = null;
function $SchedulerImpl$2(this$static, this$0){
  this$static.this$0 = this$0;
  return this$static;
}

function execute_1(){
  this.this$0.flushRunning && scheduleFixedDelayImpl(this.this$0.flusher, 1);
  return this.this$0.shouldBeRunning;
}

function getClass_9(){
  return Lcom_google_gwt_core_client_impl_SchedulerImpl$2_2_classLit;
}

function SchedulerImpl$2(){
}

_ = SchedulerImpl$2.prototype = new Object_0;
_.execute = execute_1;
_.getClass$ = getClass_9;
_.typeId$ = 0;
_.this$0 = null;
function extractNameFromToString(fnToString){
  var index, start, toReturn;
  toReturn = '';
  fnToString = $trim(fnToString);
  index = fnToString.indexOf('(');
  if (index != -1) {
    start = fnToString.indexOf('function') == 0?8:0;
    toReturn = $trim(fnToString.substr(start, index - start));
  }
  return toReturn.length > 0?toReturn:'anonymous';
}

function splice(arr, length_0){
  arr.length >= length_0 && arr.splice(0, length_0);
  return arr;
}

function $createStackTrace(e){
  var i, j, stack, stackTrace;
  stack = $inferFrom(instanceOfJso(e.e)?dynamicCastJso(e.e):null);
  stackTrace = initDim(_3Ljava_lang_StackTraceElement_2_classLit, 55, 9, stack.length, 0);
  for (i = 0 , j = stackTrace.length; i < j; ++i) {
    stackTrace[i] = $StackTraceElement(new StackTraceElement, 'Unknown', stack[i], 'Unknown source', 0);
  }
  $setStackTrace(stackTrace);
}

function $fillInStackTrace(){
  var i, j, stack, stackTrace;
  stack = splice($inferFrom($makeException()), 2);
  stackTrace = initDim(_3Ljava_lang_StackTraceElement_2_classLit, 55, 9, stack.length, 0);
  for (i = 0 , j = stackTrace.length; i < j; ++i) {
    stackTrace[i] = $StackTraceElement(new StackTraceElement, 'Unknown', stack[i], 'Unknown source', 0);
  }
  $setStackTrace(stackTrace);
}

function $makeException(){
  try {
    null.a();
  }
   catch (e) {
    return e;
  }
}

function $inferFrom(e){
  var i, j, stack;
  stack = e && e.stack?e.stack.split('\n'):[];
  for (i = 0 , j = stack.length; i < j; ++i) {
    stack[i] = extractNameFromToString(stack[i]);
  }
  return stack;
}

function getClass_10(){
  return Lcom_google_gwt_core_client_impl_StringBufferImpl_2_classLit;
}

function StringBufferImpl(){
}

_ = StringBufferImpl.prototype = new Object_0;
_.getClass$ = getClass_10;
_.typeId$ = 0;
function $replace(this$static, start, end, toInsert){
  this$static.string = this$static.string.substr(0, start - 0) + toInsert + $substring(this$static.string, end);
}

function getClass_11(){
  return Lcom_google_gwt_core_client_impl_StringBufferImplAppend_2_classLit;
}

function StringBufferImplAppend(){
}

_ = StringBufferImplAppend.prototype = new StringBufferImpl;
_.getClass$ = getClass_11;
_.typeId$ = 0;
_.string = '';
function getClass_12(){
  return Lcom_google_gwt_event_shared_GwtEvent_2_classLit;
}

function toString_3(){
  return 'An event type';
}

function GwtEvent(){
}

_ = GwtEvent.prototype = new Object_0;
_.getClass$ = getClass_12;
_.toString$ = toString_3;
_.typeId$ = 0;
_.dead = false;
_.source = null;
function dispatch(p0){
  $onClose();
}

function fire(source){
  var event_0;
  if (TYPE) {
    event_0 = new CloseEvent;
    $fireEvent(source, event_0);
  }
}

function getAssociatedType(){
  return TYPE;
}

function getClass_13(){
  return Lcom_google_gwt_event_logical_shared_CloseEvent_2_classLit;
}

function CloseEvent(){
}

_ = CloseEvent.prototype = new GwtEvent;
_.dispatch = dispatch;
_.getAssociatedType = getAssociatedType;
_.getClass$ = getClass_13;
_.typeId$ = 0;
var TYPE = null;
function getClass_14(){
  return Lcom_google_gwt_event_shared_DefaultHandlerRegistration_2_classLit;
}

function DefaultHandlerRegistration(){
}

_ = DefaultHandlerRegistration.prototype = new Object_0;
_.getClass$ = getClass_14;
_.typeId$ = 0;
function $GwtEvent$Type(this$static){
  this$static.index = ++nextHashCode;
  return this$static;
}

function getClass_15(){
  return Lcom_google_gwt_event_shared_GwtEvent$Type_2_classLit;
}

function hashCode_2(){
  return this.index;
}

function toString_4(){
  return 'Event type';
}

function GwtEvent$Type(){
}

_ = GwtEvent$Type.prototype = new Object_0;
_.getClass$ = getClass_15;
_.hashCode$ = hashCode_2;
_.toString$ = toString_4;
_.typeId$ = 0;
_.index = 0;
var nextHashCode = 0;
function $addHandler(this$static, type, handler){
  this$static.firingDepth > 0?$defer(this$static, $HandlerManager$1(new HandlerManager$1, this$static, type, handler)):$addHandler_0(this$static.registry, type, handler);
  return new DefaultHandlerRegistration;
}

function $defer(this$static, command){
  !this$static.deferredDeltas && (this$static.deferredDeltas = $ArrayList(new ArrayList));
  $add(this$static.deferredDeltas, command);
}

function $fireEvent(this$static, event_0){
  var oldSource;
  if (event_0.dead) {
    event_0.dead = false;
    event_0.source = null;
  }
  oldSource = event_0.source;
  event_0.source = this$static.source;
  try {
    ++this$static.firingDepth;
    $fireEvent_0(this$static.registry, event_0, this$static.isReverseOrder);
  }
   finally {
    --this$static.firingDepth;
    this$static.firingDepth == 0 && $handleQueuedAddsAndRemoves(this$static);
  }
  if (oldSource == null) {
    event_0.dead = true;
    event_0.source = null;
  }
   else {
    event_0.source = oldSource;
  }
}

function $handleQueuedAddsAndRemoves(this$static){
  var c, c$iterator;
  if (this$static.deferredDeltas) {
    try {
      for (c$iterator = $AbstractList$IteratorImpl(new AbstractList$IteratorImpl, this$static.deferredDeltas); c$iterator.i < c$iterator.this$0.size_0();) {
        c = dynamicCast($next_0(c$iterator), 3);
        $addHandler_0(c.this$0.registry, c.val$type, c.val$handler);
      }
    }
     finally {
      this$static.deferredDeltas = null;
    }
  }
}

function getClass_16(){
  return Lcom_google_gwt_event_shared_HandlerManager_2_classLit;
}

function HandlerManager(){
}

_ = HandlerManager.prototype = new Object_0;
_.getClass$ = getClass_16;
_.typeId$ = 0;
_.deferredDeltas = null;
_.firingDepth = 0;
_.isReverseOrder = false;
_.registry = null;
_.source = null;
function $HandlerManager$1(this$static, this$0, val$type, val$handler){
  this$static.this$0 = this$0;
  this$static.val$type = val$type;
  this$static.val$handler = val$handler;
  return this$static;
}

function getClass_17(){
  return Lcom_google_gwt_event_shared_HandlerManager$1_2_classLit;
}

function HandlerManager$1(){
}

_ = HandlerManager$1.prototype = new Object_0;
_.getClass$ = getClass_17;
_.typeId$ = 7;
_.this$0 = null;
_.val$handler = null;
_.val$type = null;
function $HandlerManager$HandlerRegistry(this$static){
  this$static.map = $HashMap(new HashMap);
  return this$static;
}

function $addHandler_0(this$static, type, handler){
  var l;
  l = dynamicCast($get_1(this$static.map, type), 4);
  if (!l) {
    l = $ArrayList(new ArrayList);
    $put(this$static.map, type, l);
  }
  setCheck(l.array, l.size++, handler);
}

function $fireEvent_0(this$static, event_0, isReverseOrder){
  var count, handler, i, type, l, l_0, l_1;
  type = event_0.getAssociatedType();
  count = (l = dynamicCast($get_1(this$static.map, type), 4) , !l?0:l.size);
  if (isReverseOrder) {
    for (i = count - 1; i >= 0; --i) {
      handler = (l_0 = dynamicCast($get_1(this$static.map, type), 4) , dynamicCast((checkIndex(i, l_0.size) , l_0.array[i]), 20));
      event_0.dispatch(handler);
    }
  }
   else {
    for (i = 0; i < count; ++i) {
      handler = (l_1 = dynamicCast($get_1(this$static.map, type), 4) , dynamicCast((checkIndex(i, l_1.size) , l_1.array[i]), 20));
      event_0.dispatch(handler);
    }
  }
}

function getClass_18(){
  return Lcom_google_gwt_event_shared_HandlerManager$HandlerRegistry_2_classLit;
}

function HandlerManager$HandlerRegistry(){
}

_ = HandlerManager$HandlerRegistry.prototype = new Object_0;
_.getClass$ = getClass_18;
_.typeId$ = 0;
function createFromSeed(seedType, length_0){
  var array = new Array(length_0);
  if (seedType > 0) {
    var value = [null, 0, false, [0, 0]][seedType];
    for (var i = 0; i < length_0; ++i) {
      array[i] = value;
    }
  }
  return array;
}

function getClass_19(){
  return this.arrayClass$;
}

function initDim(arrayClass, typeId, queryId, length_0, seedType){
  var result;
  result = createFromSeed(seedType, length_0);
  $clinit_37();
  wrapArray(result, expandoNames_0, expandoValues_0);
  result.arrayClass$ = arrayClass;
  result.typeId$ = typeId;
  result.queryId$ = queryId;
  return result;
}

function initValues(arrayClass, typeId, queryId, array){
  $clinit_37();
  wrapArray(array, expandoNames_0, expandoValues_0);
  array.arrayClass$ = arrayClass;
  array.typeId$ = typeId;
  array.queryId$ = queryId;
  return array;
}

function setCheck(array, index, value){
  if (value != null) {
    if (array.queryId$ > 0 && !canCastUnsafe(value.typeId$, array.queryId$)) {
      throw $ArrayStoreException(new ArrayStoreException);
    }
    if (array.queryId$ < 0 && (value.typeMarker$ == nullMethod || value.typeId$ == 2)) {
      throw $ArrayStoreException(new ArrayStoreException);
    }
  }
  return array[index] = value;
}

function Array_0(){
}

_ = Array_0.prototype = new Object_0;
_.getClass$ = getClass_19;
_.typeId$ = 0;
_.arrayClass$ = null;
_.length = 0;
_.queryId$ = 0;
function $clinit_37(){
  $clinit_37 = nullMethod;
  expandoNames_0 = [];
  expandoValues_0 = [];
  initExpandos(new Array_0, expandoNames_0, expandoValues_0);
}

function initExpandos(protoType, expandoNames, expandoValues){
  var i = 0, value;
  for (var name_0 in protoType) {
    if (value = protoType[name_0]) {
      expandoNames[i] = name_0;
      expandoValues[i] = value;
      ++i;
    }
  }
}

function wrapArray(array, expandoNames, expandoValues){
  $clinit_37();
  for (var i = 0, c = expandoNames.length; i < c; ++i) {
    array[expandoNames[i]] = expandoValues[i];
  }
}

var expandoNames_0, expandoValues_0;
function canCast(srcId, dstId){
  return srcId && !!typeIdArray[srcId][dstId];
}

function canCastUnsafe(srcId, dstId){
  return srcId && typeIdArray[srcId][dstId];
}

function dynamicCast(src, dstId){
  if (src != null && !canCastUnsafe(src.typeId$, dstId)) {
    throw $ClassCastException(new ClassCastException);
  }
  return src;
}

function dynamicCastJso(src){
  if (src != null && (src.typeMarker$ == nullMethod || src.typeId$ == 2)) {
    throw $ClassCastException(new ClassCastException);
  }
  return src;
}

function instanceOf(src, dstId){
  return src != null && canCast(src.typeId$, dstId);
}

function instanceOfJso(src){
  return src != null && src.typeMarker$ != nullMethod && src.typeId$ != 2;
}

function throwClassCastExceptionUnlessNull(o){
  if (o != null) {
    throw $ClassCastException(new ClassCastException);
  }
  return o;
}

var typeIdArray = [{}, {}, {1:1, 5:1, 6:1, 7:1}, {5:1, 21:1}, {5:1, 21:1}, {2:1, 5:1, 21:1}, {2:1, 5:1, 21:1, 29:1}, {3:1}, {20:1}, {2:1, 5:1, 21:1}, {2:1, 5:1, 21:1}, {5:1, 21:1}, {5:1, 21:1}, {2:1, 5:1, 21:1}, {5:1, 7:1, 8:1}, {2:1, 5:1, 21:1}, {2:1, 5:1, 21:1}, {2:1, 5:1, 21:1}, {5:1, 9:1}, {6:1}, {6:1}, {2:1, 5:1, 21:1}, {2:1, 5:1, 21:1}, {28:1}, {24:1}, {24:1}, {24:1}, {25:1}, {25:1}, {4:1, 5:1, 25:1}, {5:1, 26:1}, {5:1, 25:1}, {24:1}, {2:1, 5:1, 21:1, 27:1}, {5:1, 7:1, 8:1, 10:1}, {5:1, 7:1, 8:1, 11:1}, {5:1, 7:1, 8:1, 12:1}, {30:1}, {22:1}, {13:1}, {14:1}, {15:1}, {32:1}, {5:1, 21:1, 31:1}, {5:1, 21:1, 31:1}, {5:1}, {5:1, 16:1}, {5:1, 17:1}, {5:1, 18:1}, {5:1, 19:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}, {5:1, 23:1}];
function init(){
  !!$stats && $stats({moduleName:$moduleName, sessionId:$sessionId, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'onModuleLoadStart', className:'nu.validator.htmlparser.gwt.HtmlParserModule'});
  Envjs.parseHtmlDocument = parseHtmlDocument;
}

function caught(e){
  if (e != null && canCast(e.typeId$, 21)) {
    return e;
  }
  return $JavaScriptException(new JavaScriptException, e);
}

function create(valueLow, valueHigh){
  var diffHigh, diffLow;
  valueHigh %= 1.8446744073709552E19;
  valueLow %= 1.8446744073709552E19;
  diffHigh = valueHigh % 4294967296;
  diffLow = Math.floor(valueLow / 4294967296) * 4294967296;
  valueHigh = valueHigh - diffHigh + diffLow;
  valueLow = valueLow - diffLow + diffHigh;
  while (valueLow < 0) {
    valueLow += 4294967296;
    valueHigh -= 4294967296;
  }
  while (valueLow > 4294967295) {
    valueLow -= 4294967296;
    valueHigh += 4294967296;
  }
  valueHigh = valueHigh % 1.8446744073709552E19;
  while (valueHigh > 9223372032559808512) {
    valueHigh -= 1.8446744073709552E19;
  }
  while (valueHigh < -9223372036854775808) {
    valueHigh += 1.8446744073709552E19;
  }
  return [valueLow, valueHigh];
}

function fromDouble(value){
  if (isNaN(value)) {
    return $clinit_44() , ZERO;
  }
  if (value < -9223372036854775808) {
    return $clinit_44() , MIN_VALUE;
  }
  if (value >= 9223372036854775807) {
    return $clinit_44() , MAX_VALUE;
  }
  if (value > 0) {
    return create(Math.floor(value), 0);
  }
   else {
    return create(Math.ceil(value), 0);
  }
}

function fromInt(value){
  var rebase, result;
  if (value > -129 && value < 128) {
    rebase = value + 128;
    result = ($clinit_43() , boxedValues)[rebase];
    result == null && (result = boxedValues[rebase] = internalFromInt(value));
    return result;
  }
  return internalFromInt(value);
}

function internalFromInt(value){
  if (value >= 0) {
    return [value, 0];
  }
   else {
    return [value + 4294967296, -4294967296];
  }
}

function $clinit_43(){
  $clinit_43 = nullMethod;
  boxedValues = initDim(_3_3D_classLit, 65, 18, 256, 0);
}

var boxedValues;
function $clinit_44(){
  $clinit_44 = nullMethod;
  Math.log(2);
  MAX_VALUE = P7fffffffffffffff_longLit;
  MIN_VALUE = N8000000000000000_longLit;
  fromInt(-1);
  fromInt(1);
  fromInt(2);
  ZERO = fromInt(0);
}

var MAX_VALUE, MIN_VALUE, ZERO;
function $clinit_47(){
  $clinit_47 = nullMethod;
  timers = $ArrayList(new ArrayList);
  addCloseHandler(new Timer$1);
}

function $cancel(this$static){
  this$static.isRepeating?($wnd.clearInterval(this$static.timerId) , undefined):($wnd.clearTimeout(this$static.timerId) , undefined);
  $remove_0(timers, this$static);
}

function $schedule(this$static, delayMillis){
  if (delayMillis <= 0) {
    throw $IllegalArgumentException(new IllegalArgumentException, 'must be positive');
  }
  $cancel(this$static);
  this$static.isRepeating = false;
  this$static.timerId = createTimeout(this$static, delayMillis);
  $add(timers, this$static);
}

function createTimeout(timer, delay){
  return $wnd.setTimeout($entry(function(){
    timer.fire();
  }
  ), delay);
}

function fire_0(){
  !this.isRepeating && $remove_0(timers, this);
  $run(this);
}

function getClass_20(){
  return Lcom_google_gwt_user_client_Timer_2_classLit;
}

function Timer(){
}

_ = Timer.prototype = new Object_0;
_.fire = fire_0;
_.getClass$ = getClass_20;
_.typeId$ = 0;
_.isRepeating = false;
_.timerId = 0;
var timers;
function $onClose(){
  while (($clinit_47() , timers).size > 0) {
    $cancel(dynamicCast($get_2(timers, 0), 22));
  }
}

function getClass_21(){
  return Lcom_google_gwt_user_client_Timer$1_2_classLit;
}

function Timer$1(){
}

_ = Timer$1.prototype = new Object_0;
_.getClass$ = getClass_21;
_.typeId$ = 8;
function addCloseHandler(handler){
  maybeInitializeCloseHandlers();
  return addHandler(TYPE?TYPE:(TYPE = $GwtEvent$Type(new GwtEvent$Type)), handler);
}

function addHandler(type, handler){
  return $addHandler(getHandlers(), type, handler);
}

function getHandlers(){
  !handlers && (handlers = $Window$WindowHandlers(new Window$WindowHandlers));
  return handlers;
}

function maybeInitializeCloseHandlers(){
  if (!closeHandlersInitialized) {
    $initWindowCloseHandler();
    closeHandlersInitialized = true;
  }
}

function onClosing(){
  var event_0;
  if (closeHandlersInitialized) {
    event_0 = ($clinit_50() , new Window$ClosingEvent);
    !!handlers && $fireEvent(handlers, event_0);
    return null;
  }
  return null;
}

var closeHandlersInitialized = false, handlers = null;
function $clinit_50(){
  $clinit_50 = nullMethod;
  TYPE_0 = $GwtEvent$Type(new GwtEvent$Type);
}

function dispatch_0(p0){
  throwClassCastExceptionUnlessNull(p0);
  null.nullMethod();
}

function getAssociatedType_0(){
  return TYPE_0;
}

function getClass_22(){
  return Lcom_google_gwt_user_client_Window$ClosingEvent_2_classLit;
}

function Window$ClosingEvent(){
}

_ = Window$ClosingEvent.prototype = new GwtEvent;
_.dispatch = dispatch_0;
_.getAssociatedType = getAssociatedType_0;
_.getClass$ = getClass_22;
_.typeId$ = 0;
var TYPE_0;
function $Window$WindowHandlers(this$static){
  this$static.registry = $HandlerManager$HandlerRegistry(new HandlerManager$HandlerRegistry);
  this$static.source = null;
  this$static.isReverseOrder = false;
  return this$static;
}

function getClass_23(){
  return Lcom_google_gwt_user_client_Window$WindowHandlers_2_classLit;
}

function Window$WindowHandlers(){
}

_ = Window$WindowHandlers.prototype = new HandlerManager;
_.getClass$ = getClass_23;
_.typeId$ = 0;
function $initWindowCloseHandler(){
  var oldOnBeforeUnload = $wnd.onbeforeunload;
  var oldOnUnload = $wnd.onunload;
  $wnd.onbeforeunload = function(evt){
    var ret, oldRet;
    try {
      ret = $entry(onClosing)();
    }
     finally {
      oldRet = oldOnBeforeUnload && oldOnBeforeUnload(evt);
    }
    if (ret != null) {
      return ret;
    }
    if (oldRet != null) {
      return oldRet;
    }
  }
  ;
  $wnd.onunload = $entry(function(evt){
    try {
      closeHandlersInitialized && fire(getHandlers());
    }
     finally {
      oldOnUnload && oldOnUnload(evt);
      $wnd.onresize = null;
      $wnd.onscroll = null;
      $wnd.onbeforeunload = null;
      $wnd.onunload = null;
    }
  }
  );
}

function $ArrayStoreException(this$static){
  $fillInStackTrace();
  return this$static;
}

function $ArrayStoreException_0(this$static, message){
  $fillInStackTrace();
  this$static.detailMessage = message;
  return this$static;
}

function getClass_24(){
  return Ljava_lang_ArrayStoreException_2_classLit;
}

function ArrayStoreException(){
}

_ = ArrayStoreException.prototype = new RuntimeException;
_.getClass$ = getClass_24;
_.typeId$ = 10;
function createForArray(packageName, className, componentType){
  var clazz;
  clazz = new Class;
  clazz.typeName = packageName + className;
  clazz.modifiers = 4;
  clazz.componentType = componentType;
  return clazz;
}

function createForClass(packageName, className){
  var clazz;
  clazz = new Class;
  clazz.typeName = packageName + className;
  return clazz;
}

function createForEnum(packageName, className, enumConstantsFunc){
  var clazz;
  clazz = new Class;
  clazz.typeName = packageName + className;
  clazz.modifiers = enumConstantsFunc?8:0;
  return clazz;
}

function createForPrimitive(packageName, className){
  var clazz;
  clazz = new Class;
  clazz.typeName = packageName + className;
  clazz.modifiers = 1;
  return clazz;
}

function getClass_25(){
  return Ljava_lang_Class_2_classLit;
}

function toString_5(){
  return ((this.modifiers & 2) != 0?'interface ':(this.modifiers & 1) != 0?'':'class ') + this.typeName;
}

function Class(){
}

_ = Class.prototype = new Object_0;
_.getClass$ = getClass_25;
_.toString$ = toString_5;
_.typeId$ = 0;
_.componentType = null;
_.modifiers = 0;
_.typeName = null;
function $ClassCastException(this$static){
  $fillInStackTrace();
  return this$static;
}

function getClass_26(){
  return Ljava_lang_ClassCastException_2_classLit;
}

function ClassCastException(){
}

_ = ClassCastException.prototype = new RuntimeException;
_.getClass$ = getClass_26;
_.typeId$ = 13;
function equals_1(other){
  return this === (other == null?null:other);
}

function getClass_27(){
  return Ljava_lang_Enum_2_classLit;
}

function hashCode_3(){
  return this.$H || (this.$H = ++sNextHashId);
}

function toString_6(){
  return this.name_0;
}

function Enum(){
}

_ = Enum.prototype = new Object_0;
_.equals$ = equals_1;
_.getClass$ = getClass_27;
_.hashCode$ = hashCode_3;
_.toString$ = toString_6;
_.typeId$ = 14;
_.name_0 = null;
_.ordinal = 0;
function $IllegalArgumentException(this$static, message){
  $fillInStackTrace();
  this$static.detailMessage = message;
  return this$static;
}

function getClass_28(){
  return Ljava_lang_IllegalArgumentException_2_classLit;
}

function IllegalArgumentException(){
}

_ = IllegalArgumentException.prototype = new RuntimeException;
_.getClass$ = getClass_28;
_.typeId$ = 15;
function $IndexOutOfBoundsException(this$static){
  $fillInStackTrace();
  return this$static;
}

function $IndexOutOfBoundsException_0(this$static, message){
  $fillInStackTrace();
  this$static.detailMessage = message;
  return this$static;
}

function getClass_29(){
  return Ljava_lang_IndexOutOfBoundsException_2_classLit;
}

function IndexOutOfBoundsException(){
}

_ = IndexOutOfBoundsException.prototype = new RuntimeException;
_.getClass$ = getClass_29;
_.typeId$ = 16;
function toPowerOfTwoString(value, shift){
  var bitMask, buf, bufSize, digits, pos;
  bufSize = ~~(32 / shift);
  bitMask = (1 << shift) - 1;
  buf = initDim(_3C_classLit, 47, -1, bufSize, 1);
  digits = ($clinit_70() , digits_0);
  pos = bufSize - 1;
  if (value >= 0) {
    while (value > bitMask) {
      buf[pos--] = digits[value & bitMask];
      value >>= shift;
    }
  }
   else {
    while (pos > 0) {
      buf[pos--] = digits[value & bitMask];
      value >>= shift;
    }
  }
  buf[pos] = digits[value & bitMask];
  return __valueOf(buf, pos, bufSize);
}

function $NullPointerException(this$static){
  $fillInStackTrace();
  return this$static;
}

function getClass_30(){
  return Ljava_lang_NullPointerException_2_classLit;
}

function NullPointerException(){
}

_ = NullPointerException.prototype = new RuntimeException;
_.getClass$ = getClass_30;
_.typeId$ = 17;
function $clinit_70(){
  $clinit_70 = nullMethod;
  digits_0 = initValues(_3C_classLit, 47, -1, [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122]);
}

var digits_0;
function $StackTraceElement(this$static, className, methodName, fileName, lineNumber){
  this$static.className = className;
  this$static.methodName = methodName;
  this$static.fileName = fileName;
  this$static.lineNumber = lineNumber;
  return this$static;
}

function getClass_31(){
  return Ljava_lang_StackTraceElement_2_classLit;
}

function toString_7(){
  return this.className + '.' + this.methodName + '(' + this.fileName + ':' + this.lineNumber + ')';
}

function StackTraceElement(){
}

_ = StackTraceElement.prototype = new Object_0;
_.getClass$ = getClass_31;
_.toString$ = toString_7;
_.typeId$ = 18;
_.className = null;
_.fileName = null;
_.lineNumber = 0;
_.methodName = null;
function $equals_1(this$static, other){
  if (!(other != null && canCast(other.typeId$, 1))) {
    return false;
  }
  return String(this$static) == other;
}

function $getChars(this$static, srcBegin, srcEnd, dst, dstBegin){
  var srcIdx;
  for (srcIdx = srcBegin; srcIdx < srcEnd; ++srcIdx) {
    dst[dstBegin++] = this$static.charCodeAt(srcIdx);
  }
}

function $substring(this$static, beginIndex){
  return this$static.substr(beginIndex, this$static.length - beginIndex);
}

function $toCharArray(this$static){
  var charArr, n;
  n = this$static.length;
  charArr = initDim(_3C_classLit, 47, -1, n, 1);
  $getChars(this$static, 0, n, charArr, 0);
  return charArr;
}

function $trim(this$static){
  if (this$static.length == 0 || this$static[0] > ' ' && this$static[this$static.length - 1] > ' ') {
    return this$static;
  }
  var r1 = this$static.replace(/^(\s*)/, '');
  var r2 = r1.replace(/\s*$/, '');
  return r2;
}

function __checkBounds(legalCount, start, end){
  if (start < 0) {
    throw $StringIndexOutOfBoundsException(new StringIndexOutOfBoundsException, start);
  }
  if (end < start) {
    throw $StringIndexOutOfBoundsException(new StringIndexOutOfBoundsException, end - start);
  }
  if (end > legalCount) {
    throw $StringIndexOutOfBoundsException(new StringIndexOutOfBoundsException, end);
  }
}

function __valueOf(x, start, end){
  x = x.slice(start, end);
  return String.fromCharCode.apply(null, x);
}

function compareTo(thisStr, otherStr){
  thisStr = String(thisStr);
  if (thisStr == otherStr) {
    return 0;
  }
  return thisStr < otherStr?-1:1;
}

function equals_2(other){
  return $equals_1(this, other);
}

function getClass_32(){
  return Ljava_lang_String_2_classLit;
}

function hashCode_4(){
  return getHashCode_0(this);
}

function toString_8(){
  return this;
}

function valueOf_0(x, offset, count){
  var end;
  end = offset + count;
  __checkBounds(x.length, offset, end);
  return __valueOf(x, offset, end);
}

_ = String.prototype;
_.equals$ = equals_2;
_.getClass$ = getClass_32;
_.hashCode$ = hashCode_4;
_.toString$ = toString_8;
_.typeId$ = 2;
function $clinit_73(){
  $clinit_73 = nullMethod;
  back = {};
  front = {};
}

function compute(str){
  var hashCode, i, n, nBatch;
  hashCode = 0;
  n = str.length;
  nBatch = n - 4;
  i = 0;
  while (i < nBatch) {
    hashCode = str.charCodeAt(i + 3) + 31 * (str.charCodeAt(i + 2) + 31 * (str.charCodeAt(i + 1) + 31 * (str.charCodeAt(i) + 31 * hashCode))) | 0;
    i += 4;
  }
  while (i < n) {
    hashCode = hashCode * 31 + str.charCodeAt(i++);
  }
  return hashCode | 0;
}

function getHashCode_0(str){
  $clinit_73();
  var key = ':' + str;
  var result = front[key];
  if (result != null) {
    return result;
  }
  result = back[key];
  result == null && (result = compute(str));
  increment();
  return front[key] = result;
}

function increment(){
  if (count_0 == 256) {
    back = front;
    front = {};
    count_0 = 0;
  }
  ++count_0;
}

var back, count_0 = 0, front;
function $StringBuffer(this$static){
  this$static.impl = new StringBufferImplAppend;
  return this$static;
}

function $append_0(this$static, x){
  this$static.impl.string += x;
  return this$static;
}

function getClass_33(){
  return Ljava_lang_StringBuffer_2_classLit;
}

function toString_9(){
  return this.impl.string;
}

function StringBuffer(){
}

_ = StringBuffer.prototype = new Object_0;
_.getClass$ = getClass_33;
_.toString$ = toString_9;
_.typeId$ = 19;
function $StringBuilder(this$static){
  this$static.impl = new StringBufferImplAppend;
  return this$static;
}

function $append_1(this$static, x){
  this$static.impl.string += String.fromCharCode(x);
  return this$static;
}

function $append_2(this$static, x){
  this$static.impl.string += String.fromCharCode.apply(null, x);
  return this$static;
}

function $getChars_0(this$static, srcStart, srcEnd, dst, dstStart){
  var s;
  __checkBounds(this$static.impl.string.length, srcStart, srcEnd);
  __checkBounds(dst.length, dstStart, dstStart + (srcEnd - srcStart));
  s = this$static.impl.string;
  while (srcStart < srcEnd) {
    dst[dstStart++] = s.charCodeAt(srcStart++);
  }
}

function $setLength(this$static, newLength){
  var oldLength;
  oldLength = this$static.impl.string.length;
  newLength < oldLength?$replace(this$static.impl, newLength, oldLength, ''):newLength > oldLength && $append_2(this$static, initDim(_3C_classLit, 47, -1, newLength - oldLength, 1));
}

function getClass_34(){
  return Ljava_lang_StringBuilder_2_classLit;
}

function toString_10(){
  return this.impl.string;
}

function StringBuilder(){
}

_ = StringBuilder.prototype = new Object_0;
_.getClass$ = getClass_34;
_.toString$ = toString_10;
_.typeId$ = 20;
function $StringIndexOutOfBoundsException(this$static, index){
  $fillInStackTrace();
  this$static.detailMessage = 'String index out of range: ' + index;
  return this$static;
}

function getClass_35(){
  return Ljava_lang_StringIndexOutOfBoundsException_2_classLit;
}

function StringIndexOutOfBoundsException(){
}

_ = StringIndexOutOfBoundsException.prototype = new IndexOutOfBoundsException;
_.getClass$ = getClass_35;
_.typeId$ = 21;
function arrayTypeMatch(srcComp, destComp){
  if ((srcComp.modifiers & 1) != 0) {
    return srcComp == destComp;
  }
   else {
    return (destComp.modifiers & 1) == 0;
  }
}

function arraycopy(src, srcOfs, dest, destOfs, len){
  var destArray, destComp, destEnd, destType, destlen, srcArray, srcComp, srcType, srclen;
  if (src == null || dest == null) {
    throw $NullPointerException(new NullPointerException);
  }
  srcType = src.typeMarker$ == nullMethod || src.typeId$ == 2?src.getClass$():Lcom_google_gwt_core_client_JavaScriptObject_2_classLit;
  destType = dest.typeMarker$ == nullMethod || dest.typeId$ == 2?dest.getClass$():Lcom_google_gwt_core_client_JavaScriptObject_2_classLit;
  if ((srcType.modifiers & 4) == 0 || (destType.modifiers & 4) == 0) {
    throw $ArrayStoreException_0(new ArrayStoreException, 'Must be array types');
  }
  srcComp = srcType.componentType;
  destComp = destType.componentType;
  if (!arrayTypeMatch(srcComp, destComp)) {
    throw $ArrayStoreException_0(new ArrayStoreException, 'Array types must match');
  }
  srclen = src.length;
  destlen = dest.length;
  if (srcOfs < 0 || destOfs < 0 || len < 0 || srcOfs + len > srclen || destOfs + len > destlen) {
    throw $IndexOutOfBoundsException(new IndexOutOfBoundsException);
  }
  if (((srcComp.modifiers & 1) == 0 || (srcComp.modifiers & 4) != 0) && srcType != destType) {
    srcArray = dynamicCast(src, 23);
    destArray = dynamicCast(dest, 23);
    if ((src == null?null:src) === (dest == null?null:dest) && srcOfs < destOfs) {
      srcOfs += len;
      for (destEnd = destOfs + len; destEnd-- > destOfs;) {
        setCheck(destArray, destEnd, srcArray[--srcOfs]);
      }
    }
     else {
      for (destEnd = destOfs + len; destOfs < destEnd;) {
        setCheck(destArray, destOfs++, srcArray[srcOfs++]);
      }
    }
  }
   else {
    Array.prototype.splice.apply(dest, [destOfs, len].concat(src.slice(srcOfs, srcOfs + len)));
  }
}

function $UnsupportedOperationException(this$static, message){
  $fillInStackTrace();
  this$static.detailMessage = message;
  return this$static;
}

function getClass_36(){
  return Ljava_lang_UnsupportedOperationException_2_classLit;
}

function UnsupportedOperationException(){
}

_ = UnsupportedOperationException.prototype = new RuntimeException;
_.getClass$ = getClass_36;
_.typeId$ = 22;
function $advanceToFind(iter, o){
  var t;
  while (iter.hasNext()) {
    t = iter.next_0();
    if (o == null?t == null:equals__devirtual$(o, t)) {
      return iter;
    }
  }
  return null;
}

function add(o){
  throw $UnsupportedOperationException(new UnsupportedOperationException, 'Add not supported on this collection');
}

function contains(o){
  var iter;
  iter = $advanceToFind(this.iterator(), o);
  return !!iter;
}

function getClass_37(){
  return Ljava_util_AbstractCollection_2_classLit;
}

function toString_11(){
  var comma, iter, sb;
  sb = $StringBuffer(new StringBuffer);
  comma = null;
  sb.impl.string += '[';
  iter = this.iterator();
  while (iter.hasNext()) {
    comma != null?(sb.impl.string += comma , undefined):(comma = ', ');
    $append_0(sb, '' + iter.next_0());
  }
  sb.impl.string += ']';
  return sb.impl.string;
}

function AbstractCollection(){
}

_ = AbstractCollection.prototype = new Object_0;
_.add_0 = add;
_.contains = contains;
_.getClass$ = getClass_37;
_.toString$ = toString_11;
_.typeId$ = 0;
function equals_3(obj){
  var entry, entry$iterator, otherKey, otherMap, otherValue;
  if ((obj == null?null:obj) === this) {
    return true;
  }
  if (!(obj != null && canCast(obj.typeId$, 26))) {
    return false;
  }
  otherMap = dynamicCast(obj, 26);
  if (dynamicCast(this, 26).size != otherMap.size) {
    return false;
  }
  for (entry$iterator = $AbstractHashMap$EntrySetIterator(new AbstractHashMap$EntrySetIterator, $AbstractHashMap$EntrySet(new AbstractHashMap$EntrySet, otherMap).this$0); $hasNext_0(entry$iterator.iter);) {
    entry = dynamicCast($next_0(entry$iterator.iter), 24);
    otherKey = entry.getKey();
    otherValue = entry.getValue();
    if (!(otherKey == null?dynamicCast(this, 26).nullSlotLive:otherKey != null && canCast(otherKey.typeId$, 1)?$hasStringValue(dynamicCast(this, 26), dynamicCast(otherKey, 1)):$hasHashValue(dynamicCast(this, 26), otherKey, ~~hashCode__devirtual$(otherKey)))) {
      return false;
    }
    if (!equalsWithNullCheck(otherValue, otherKey == null?dynamicCast(this, 26).nullSlot:otherKey != null && canCast(otherKey.typeId$, 1)?dynamicCast(this, 26).stringMap[':' + dynamicCast(otherKey, 1)]:$getHashValue(dynamicCast(this, 26), otherKey, ~~hashCode__devirtual$(otherKey)))) {
      return false;
    }
  }
  return true;
}

function getClass_38(){
  return Ljava_util_AbstractMap_2_classLit;
}

function hashCode_5(){
  var entry, entry$iterator, hashCode;
  hashCode = 0;
  for (entry$iterator = $AbstractHashMap$EntrySetIterator(new AbstractHashMap$EntrySetIterator, $AbstractHashMap$EntrySet(new AbstractHashMap$EntrySet, dynamicCast(this, 26)).this$0); $hasNext_0(entry$iterator.iter);) {
    entry = dynamicCast($next_0(entry$iterator.iter), 24);
    hashCode += entry.hashCode$();
    hashCode = ~~hashCode;
  }
  return hashCode;
}

function toString_12(){
  var comma, entry, iter, s;
  s = '{';
  comma = false;
  for (iter = $AbstractHashMap$EntrySetIterator(new AbstractHashMap$EntrySetIterator, $AbstractHashMap$EntrySet(new AbstractHashMap$EntrySet, dynamicCast(this, 26)).this$0); $hasNext_0(iter.iter);) {
    entry = dynamicCast($next_0(iter.iter), 24);
    comma?(s += ', '):(comma = true);
    s += '' + entry.getKey();
    s += '=';
    s += '' + entry.getValue();
  }
  return s + '}';
}

function AbstractMap(){
}

_ = AbstractMap.prototype = new Object_0;
_.equals$ = equals_3;
_.getClass$ = getClass_38;
_.hashCode$ = hashCode_5;
_.toString$ = toString_12;
_.typeId$ = 0;
function $addAllHashEntries(this$static, dest){
  var hashCodeMap = this$static.hashCodeMap;
  for (var hashCode in hashCodeMap) {
    if (hashCode == parseInt(hashCode)) {
      var array = hashCodeMap[hashCode];
      for (var i = 0, c = array.length; i < c; ++i) {
        dest.add_0(array[i]);
      }
    }
  }
}

function $addAllStringEntries(this$static, dest){
  var stringMap = this$static.stringMap;
  for (var key in stringMap) {
    if (key.charCodeAt(0) == 58) {
      var entry = new_$(this$static, key.substring(1));
      dest.add_0(entry);
    }
  }
}

function $clearImpl(this$static){
  this$static.hashCodeMap = [];
  this$static.stringMap = {};
  this$static.nullSlotLive = false;
  this$static.nullSlot = null;
  this$static.size = 0;
}

function $containsKey(this$static, key){
  return key == null?this$static.nullSlotLive:key != null && canCast(key.typeId$, 1)?$hasStringValue(this$static, dynamicCast(key, 1)):$hasHashValue(this$static, key, ~~hashCode__devirtual$(key));
}

function $get_1(this$static, key){
  return key == null?this$static.nullSlot:key != null && canCast(key.typeId$, 1)?this$static.stringMap[':' + dynamicCast(key, 1)]:$getHashValue(this$static, key, ~~hashCode__devirtual$(key));
}

function $getHashValue(this$static, key, hashCode){
  var array = this$static.hashCodeMap[hashCode];
  if (array) {
    for (var i = 0, c = array.length; i < c; ++i) {
      var entry = array[i];
      var entryKey = entry.getKey();
      if (this$static.equalsBridge(key, entryKey)) {
        return entry.getValue();
      }
    }
  }
  return null;
}

function $hasHashValue(this$static, key, hashCode){
  var array = this$static.hashCodeMap[hashCode];
  if (array) {
    for (var i = 0, c = array.length; i < c; ++i) {
      var entry = array[i];
      var entryKey = entry.getKey();
      if (this$static.equalsBridge(key, entryKey)) {
        return true;
      }
    }
  }
  return false;
}

function $hasStringValue(this$static, key){
  return ':' + key in this$static.stringMap;
}

function $put(this$static, key, value){
  return !key?$putNullSlot(this$static, value):$putHashValue(this$static, key, value, ~~key.index);
}

function $putHashValue(this$static, key, value, hashCode){
  var array = this$static.hashCodeMap[hashCode];
  if (array) {
    for (var i = 0, c = array.length; i < c; ++i) {
      var entry = array[i];
      var entryKey = entry.getKey();
      if (this$static.equalsBridge(key, entryKey)) {
        var previous = entry.getValue();
        entry.setValue(value);
        return previous;
      }
    }
  }
   else {
    array = this$static.hashCodeMap[hashCode] = [];
  }
  var entry = $MapEntryImpl(new MapEntryImpl, key, value);
  array.push(entry);
  ++this$static.size;
  return null;
}

function $putNullSlot(this$static, value){
  var result;
  result = this$static.nullSlot;
  this$static.nullSlot = value;
  if (!this$static.nullSlotLive) {
    this$static.nullSlotLive = true;
    ++this$static.size;
  }
  return result;
}

function $putStringValue(this$static, key, value){
  var result, stringMap = this$static.stringMap;
  key = ':' + key;
  key in stringMap?(result = stringMap[key]):++this$static.size;
  stringMap[key] = value;
  return result;
}

function equalsBridge(value1, value2){
  return (value1 == null?null:value1) === (value2 == null?null:value2) || value1 != null && equals__devirtual$(value1, value2);
}

function getClass_39(){
  return Ljava_util_AbstractHashMap_2_classLit;
}

function AbstractHashMap(){
}

_ = AbstractHashMap.prototype = new AbstractMap;
_.equalsBridge = equalsBridge;
_.getClass$ = getClass_39;
_.typeId$ = 0;
_.hashCodeMap = null;
_.nullSlot = null;
_.nullSlotLive = false;
_.size = 0;
_.stringMap = null;
function equals_4(o){
  var iter, other, otherItem;
  if ((o == null?null:o) === this) {
    return true;
  }
  if (!(o != null && canCast(o.typeId$, 28))) {
    return false;
  }
  other = dynamicCast(o, 28);
  if (other.this$0.size != this.size_0()) {
    return false;
  }
  for (iter = $AbstractHashMap$EntrySetIterator(new AbstractHashMap$EntrySetIterator, other.this$0); $hasNext_0(iter.iter);) {
    otherItem = dynamicCast($next_0(iter.iter), 24);
    if (!this.contains(otherItem)) {
      return false;
    }
  }
  return true;
}

function getClass_40(){
  return Ljava_util_AbstractSet_2_classLit;
}

function hashCode_6(){
  var hashCode, iter, next;
  hashCode = 0;
  for (iter = this.iterator(); iter.hasNext();) {
    next = iter.next_0();
    if (next != null) {
      hashCode += hashCode__devirtual$(next);
      hashCode = ~~hashCode;
    }
  }
  return hashCode;
}

function AbstractSet(){
}

_ = AbstractSet.prototype = new AbstractCollection;
_.equals$ = equals_4;
_.getClass$ = getClass_40;
_.hashCode$ = hashCode_6;
_.typeId$ = 0;
function $AbstractHashMap$EntrySet(this$static, this$0){
  this$static.this$0 = this$0;
  return this$static;
}

function contains_0(o){
  var entry, key, value;
  if (o != null && canCast(o.typeId$, 24)) {
    entry = dynamicCast(o, 24);
    key = entry.getKey();
    if ($containsKey(this.this$0, key)) {
      value = $get_1(this.this$0, key);
      return $equals_2(entry.getValue(), value);
    }
  }
  return false;
}

function getClass_41(){
  return Ljava_util_AbstractHashMap$EntrySet_2_classLit;
}

function iterator(){
  return $AbstractHashMap$EntrySetIterator(new AbstractHashMap$EntrySetIterator, this.this$0);
}

function size_0(){
  return this.this$0.size;
}

function AbstractHashMap$EntrySet(){
}

_ = AbstractHashMap$EntrySet.prototype = new AbstractSet;
_.contains = contains_0;
_.getClass$ = getClass_41;
_.iterator = iterator;
_.size_0 = size_0;
_.typeId$ = 23;
_.this$0 = null;
function $AbstractHashMap$EntrySetIterator(this$static, this$0){
  var list;
  this$static.this$0 = this$0;
  list = $ArrayList(new ArrayList);
  this$static.this$0.nullSlotLive && $add(list, $AbstractHashMap$MapEntryNull(new AbstractHashMap$MapEntryNull, this$static.this$0));
  $addAllStringEntries(this$static.this$0, list);
  $addAllHashEntries(this$static.this$0, list);
  this$static.iter = $AbstractList$IteratorImpl(new AbstractList$IteratorImpl, list);
  return this$static;
}

function getClass_42(){
  return Ljava_util_AbstractHashMap$EntrySetIterator_2_classLit;
}

function hasNext(){
  return $hasNext_0(this.iter);
}

function next_0(){
  return dynamicCast($next_0(this.iter), 24);
}

function AbstractHashMap$EntrySetIterator(){
}

_ = AbstractHashMap$EntrySetIterator.prototype = new Object_0;
_.getClass$ = getClass_42;
_.hasNext = hasNext;
_.next_0 = next_0;
_.typeId$ = 0;
_.iter = null;
_.this$0 = null;
function equals_5(other){
  var entry;
  if (other != null && canCast(other.typeId$, 24)) {
    entry = dynamicCast(other, 24);
    if (equalsWithNullCheck(this.getKey(), entry.getKey()) && equalsWithNullCheck(this.getValue(), entry.getValue())) {
      return true;
    }
  }
  return false;
}

function getClass_43(){
  return Ljava_util_AbstractMapEntry_2_classLit;
}

function hashCode_7(){
  var keyHash, valueHash;
  keyHash = 0;
  valueHash = 0;
  this.getKey() != null && (keyHash = hashCode__devirtual$(this.getKey()));
  this.getValue() != null && (valueHash = hashCode__devirtual$(this.getValue()));
  return keyHash ^ valueHash;
}

function toString_13(){
  return this.getKey() + '=' + this.getValue();
}

function AbstractMapEntry(){
}

_ = AbstractMapEntry.prototype = new Object_0;
_.equals$ = equals_5;
_.getClass$ = getClass_43;
_.hashCode$ = hashCode_7;
_.toString$ = toString_13;
_.typeId$ = 24;
function $AbstractHashMap$MapEntryNull(this$static, this$0){
  this$static.this$0 = this$0;
  return this$static;
}

function getClass_44(){
  return Ljava_util_AbstractHashMap$MapEntryNull_2_classLit;
}

function getKey(){
  return null;
}

function getValue(){
  return this.this$0.nullSlot;
}

function setValue(object){
  return $putNullSlot(this.this$0, object);
}

function AbstractHashMap$MapEntryNull(){
}

_ = AbstractHashMap$MapEntryNull.prototype = new AbstractMapEntry;
_.getClass$ = getClass_44;
_.getKey = getKey;
_.getValue = getValue;
_.setValue = setValue;
_.typeId$ = 25;
_.this$0 = null;
function $AbstractHashMap$MapEntryString(this$static, key, this$0){
  this$static.this$0 = this$0;
  this$static.key = key;
  return this$static;
}

function getClass_45(){
  return Ljava_util_AbstractHashMap$MapEntryString_2_classLit;
}

function getKey_0(){
  return this.key;
}

function getValue_0(){
  return this.this$0.stringMap[':' + this.key];
}

function new_$(this$outer, key){
  return $AbstractHashMap$MapEntryString(new AbstractHashMap$MapEntryString, key, this$outer);
}

function setValue_0(object){
  return $putStringValue(this.this$0, this.key, object);
}

function AbstractHashMap$MapEntryString(){
}

_ = AbstractHashMap$MapEntryString.prototype = new AbstractMapEntry;
_.getClass$ = getClass_45;
_.getKey = getKey_0;
_.getValue = getValue_0;
_.setValue = setValue_0;
_.typeId$ = 26;
_.key = null;
_.this$0 = null;
function add_0(obj){
  this.add_1(this.size_0(), obj);
  return true;
}

function add_1(index, element){
  throw $UnsupportedOperationException(new UnsupportedOperationException, 'Add not supported on this list');
}

function checkIndex(index, size){
  (index < 0 || index >= size) && indexOutOfBounds(index, size);
}

function equals_6(o){
  var elem, elemOther, iter, iterOther, other;
  if ((o == null?null:o) === this) {
    return true;
  }
  if (!(o != null && canCast(o.typeId$, 25))) {
    return false;
  }
  other = dynamicCast(o, 25);
  if (this.size_0() != other.size_0()) {
    return false;
  }
  iter = this.iterator();
  iterOther = other.iterator();
  while (iter.hasNext()) {
    elem = iter.next_0();
    elemOther = iterOther.next_0();
    if (!(elem == null?elemOther == null:equals__devirtual$(elem, elemOther))) {
      return false;
    }
  }
  return true;
}

function getClass_46(){
  return Ljava_util_AbstractList_2_classLit;
}

function hashCode_8(){
  var iter, k, obj;
  k = 1;
  iter = this.iterator();
  while (iter.hasNext()) {
    obj = iter.next_0();
    k = 31 * k + (obj == null?0:hashCode__devirtual$(obj));
    k = ~~k;
  }
  return k;
}

function indexOutOfBounds(index, size){
  throw $IndexOutOfBoundsException_0(new IndexOutOfBoundsException, 'Index: ' + index + ', Size: ' + size);
}

function iterator_0(){
  return $AbstractList$IteratorImpl(new AbstractList$IteratorImpl, this);
}

function AbstractList(){
}

_ = AbstractList.prototype = new AbstractCollection;
_.add_0 = add_0;
_.add_1 = add_1;
_.equals$ = equals_6;
_.getClass$ = getClass_46;
_.hashCode$ = hashCode_8;
_.iterator = iterator_0;
_.typeId$ = 27;
function $AbstractList$IteratorImpl(this$static, this$0){
  this$static.this$0 = this$0;
  return this$static;
}

function $hasNext_0(this$static){
  return this$static.i < this$static.this$0.size_0();
}

function $next_0(this$static){
  if (this$static.i >= this$static.this$0.size_0()) {
    throw $NoSuchElementException(new NoSuchElementException);
  }
  return this$static.this$0.get(this$static.i++);
}

function getClass_47(){
  return Ljava_util_AbstractList$IteratorImpl_2_classLit;
}

function hasNext_0(){
  return this.i < this.this$0.size_0();
}

function next_1(){
  return $next_0(this);
}

function AbstractList$IteratorImpl(){
}

_ = AbstractList$IteratorImpl.prototype = new Object_0;
_.getClass$ = getClass_47;
_.hasNext = hasNext_0;
_.next_0 = next_1;
_.typeId$ = 0;
_.i = 0;
_.this$0 = null;
function add_2(index, element){
  var iter;
  iter = $listIterator(this, index);
  $addBefore(iter.this$0, element, iter.currentNode);
  ++iter.currentIndex;
  iter.lastNode = null;
}

function get(index){
  var $e0, iter;
  iter = $listIterator(this, index);
  try {
    return $next_1(iter);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 27)) {
      throw $IndexOutOfBoundsException_0(new IndexOutOfBoundsException, "Can't get element " + index);
    }
     else 
      throw $e0;
  }
}

function getClass_48(){
  return Ljava_util_AbstractSequentialList_2_classLit;
}

function iterator_1(){
  return $listIterator(this, 0);
}

function AbstractSequentialList(){
}

_ = AbstractSequentialList.prototype = new AbstractList;
_.add_1 = add_2;
_.get = get;
_.getClass$ = getClass_48;
_.iterator = iterator_1;
_.typeId$ = 28;
function $ArrayList(this$static){
  this$static.array = initDim(_3Ljava_lang_Object_2_classLit, 54, 0, 0, 0);
  return this$static;
}

function $add(this$static, o){
  setCheck(this$static.array, this$static.size++, o);
  return true;
}

function $get_2(this$static, index){
  checkIndex(index, this$static.size);
  return this$static.array[index];
}

function $indexOf_0(this$static, o, index){
  for (; index < this$static.size; ++index) {
    if (equalsWithNullCheck(o, this$static.array[index])) {
      return index;
    }
  }
  return -1;
}

function $remove_0(this$static, o){
  var i, previous;
  i = $indexOf_0(this$static, o, 0);
  if (i == -1) {
    return false;
  }
  previous = (checkIndex(i, this$static.size) , this$static.array[i]);
  this$static.array.splice(i, 1);
  --this$static.size;
  return true;
}

function add_3(o){
  return setCheck(this.array, this.size++, o) , true;
}

function add_4(index, o){
  (index < 0 || index > this.size) && indexOutOfBounds(index, this.size);
  this.array.splice(index, 0, o);
  ++this.size;
}

function contains_1(o){
  return $indexOf_0(this, o, 0) != -1;
}

function get_0(index){
  return checkIndex(index, this.size) , this.array[index];
}

function getClass_49(){
  return Ljava_util_ArrayList_2_classLit;
}

function size_1(){
  return this.size;
}

function ArrayList(){
}

_ = ArrayList.prototype = new AbstractList;
_.add_0 = add_3;
_.add_1 = add_4;
_.contains = contains_1;
_.get = get_0;
_.getClass$ = getClass_49;
_.size_0 = size_1;
_.typeId$ = 29;
_.size = 0;
function binarySearch(sortedArray, key){
  var high, low, mid, midVal;
  low = 0;
  high = sortedArray.length - 1;
  while (low <= high) {
    mid = low + (high - low >> 1);
    midVal = sortedArray[mid];
    if (midVal < key) {
      low = mid + 1;
    }
     else if (midVal > key) {
      high = mid - 1;
    }
     else {
      return mid;
    }
  }
  return -low - 1;
}

function binarySearch_0(sortedArray, key, comparator){
  var compareResult, high, low, mid, midVal;
  !comparator && (comparator = ($clinit_95() , $clinit_95() , NATURAL));
  low = 0;
  high = sortedArray.length - 1;
  while (low <= high) {
    mid = low + (high - low >> 1);
    midVal = sortedArray[mid];
    compareResult = compareTo(midVal, key);
    if (compareResult < 0) {
      low = mid + 1;
    }
     else if (compareResult > 0) {
      high = mid - 1;
    }
     else {
      return mid;
    }
  }
  return -low - 1;
}

function $clinit_95(){
  $clinit_95 = nullMethod;
  NATURAL = new Comparators$1;
}

var NATURAL;
function getClass_50(){
  return Ljava_util_Comparators$1_2_classLit;
}

function Comparators$1(){
}

_ = Comparators$1.prototype = new Object_0;
_.getClass$ = getClass_50;
_.typeId$ = 0;
function $HashMap(this$static){
  $clearImpl(this$static);
  return this$static;
}

function $equals_2(value1, value2){
  return (value1 == null?null:value1) === (value2 == null?null:value2) || value1 != null && equals__devirtual$(value1, value2);
}

function getClass_51(){
  return Ljava_util_HashMap_2_classLit;
}

function HashMap(){
}

_ = HashMap.prototype = new AbstractHashMap;
_.getClass$ = getClass_51;
_.typeId$ = 30;
function $LinkedList(this$static){
  this$static.header = $LinkedList$Node(new LinkedList$Node);
  this$static.size = 0;
  return this$static;
}

function $addBefore(this$static, o, target){
  $LinkedList$Node_0(new LinkedList$Node, o, target);
  ++this$static.size;
}

function $addLast(this$static, o){
  $LinkedList$Node_0(new LinkedList$Node, o, this$static.header);
  ++this$static.size;
}

function $clear(this$static){
  this$static.header = $LinkedList$Node(new LinkedList$Node);
  this$static.size = 0;
}

function $getLast(this$static){
  $throwEmptyException(this$static);
  return this$static.header.prev.value;
}

function $listIterator(this$static, index){
  var i, node;
  (index < 0 || index > this$static.size) && indexOutOfBounds(index, this$static.size);
  if (index >= this$static.size >> 1) {
    node = this$static.header;
    for (i = this$static.size; i > index; --i) {
      node = node.prev;
    }
  }
   else {
    node = this$static.header.next;
    for (i = 0; i < index; ++i) {
      node = node.next;
    }
  }
  return $LinkedList$ListIteratorImpl(new LinkedList$ListIteratorImpl, index, node, this$static);
}

function $removeLast(this$static){
  var node;
  $throwEmptyException(this$static);
  --this$static.size;
  node = this$static.header.prev;
  node.next.prev = node.prev;
  node.prev.next = node.next;
  node.next = node.prev = node;
  return node.value;
}

function $throwEmptyException(this$static){
  if (this$static.size == 0) {
    throw $NoSuchElementException(new NoSuchElementException);
  }
}

function add_5(o){
  $LinkedList$Node_0(new LinkedList$Node, o, this.header);
  ++this.size;
  return true;
}

function getClass_52(){
  return Ljava_util_LinkedList_2_classLit;
}

function size_2(){
  return this.size;
}

function LinkedList(){
}

_ = LinkedList.prototype = new AbstractSequentialList;
_.add_0 = add_5;
_.getClass$ = getClass_52;
_.size_0 = size_2;
_.typeId$ = 31;
_.header = null;
_.size = 0;
function $LinkedList$ListIteratorImpl(this$static, index, startNode, this$0){
  this$static.this$0 = this$0;
  this$static.currentNode = startNode;
  this$static.currentIndex = index;
  return this$static;
}

function $next_1(this$static){
  if (this$static.currentNode == this$static.this$0.header) {
    throw $NoSuchElementException(new NoSuchElementException);
  }
  this$static.lastNode = this$static.currentNode;
  this$static.currentNode = this$static.currentNode.next;
  ++this$static.currentIndex;
  return this$static.lastNode.value;
}

function getClass_53(){
  return Ljava_util_LinkedList$ListIteratorImpl_2_classLit;
}

function hasNext_1(){
  return this.currentNode != this.this$0.header;
}

function next_2(){
  return $next_1(this);
}

function LinkedList$ListIteratorImpl(){
}

_ = LinkedList$ListIteratorImpl.prototype = new Object_0;
_.getClass$ = getClass_53;
_.hasNext = hasNext_1;
_.next_0 = next_2;
_.typeId$ = 0;
_.currentIndex = 0;
_.currentNode = null;
_.lastNode = null;
_.this$0 = null;
function $LinkedList$Node(this$static){
  this$static.next = this$static.prev = this$static;
  return this$static;
}

function $LinkedList$Node_0(this$static, value, nextNode){
  this$static.value = value;
  this$static.next = nextNode;
  this$static.prev = nextNode.prev;
  nextNode.prev.next = this$static;
  nextNode.prev = this$static;
  return this$static;
}

function getClass_54(){
  return Ljava_util_LinkedList$Node_2_classLit;
}

function LinkedList$Node(){
}

_ = LinkedList$Node.prototype = new Object_0;
_.getClass$ = getClass_54;
_.typeId$ = 0;
_.next = null;
_.prev = null;
_.value = null;
function $MapEntryImpl(this$static, key, value){
  this$static.key = key;
  this$static.value = value;
  return this$static;
}

function getClass_55(){
  return Ljava_util_MapEntryImpl_2_classLit;
}

function getKey_1(){
  return this.key;
}

function getValue_1(){
  return this.value;
}

function setValue_1(value){
  var old;
  old = this.value;
  this.value = value;
  return old;
}

function MapEntryImpl(){
}

_ = MapEntryImpl.prototype = new AbstractMapEntry;
_.getClass$ = getClass_55;
_.getKey = getKey_1;
_.getValue = getValue_1;
_.setValue = setValue_1;
_.typeId$ = 32;
_.key = null;
_.value = null;
function $NoSuchElementException(this$static){
  $fillInStackTrace();
  return this$static;
}

function getClass_56(){
  return Ljava_util_NoSuchElementException_2_classLit;
}

function NoSuchElementException(){
}

_ = NoSuchElementException.prototype = new RuntimeException;
_.getClass$ = getClass_56;
_.typeId$ = 33;
function equalsWithNullCheck(a, b){
  return (a == null?null:a) === (b == null?null:b) || a != null && equals__devirtual$(a, b);
}

function $clinit_112(){
  $clinit_112 = nullMethod;
  HTML = $DoctypeExpectation(new DoctypeExpectation, 'HTML', 0);
  HTML401_TRANSITIONAL = $DoctypeExpectation(new DoctypeExpectation, 'HTML401_TRANSITIONAL', 1);
  HTML401_STRICT = $DoctypeExpectation(new DoctypeExpectation, 'HTML401_STRICT', 2);
  AUTO = $DoctypeExpectation(new DoctypeExpectation, 'AUTO', 3);
  NO_DOCTYPE_ERRORS = $DoctypeExpectation(new DoctypeExpectation, 'NO_DOCTYPE_ERRORS', 4);
}

function $DoctypeExpectation(this$static, enum$name, enum$ordinal){
  $clinit_112();
  this$static.name_0 = enum$name;
  this$static.ordinal = enum$ordinal;
  return this$static;
}

function getClass_57(){
  return Lnu_validator_htmlparser_common_DoctypeExpectation_2_classLit;
}

function values_0(){
  $clinit_112();
  return initValues(_3Lnu_validator_htmlparser_common_DoctypeExpectation_2_classLit, 57, 10, [HTML, HTML401_TRANSITIONAL, HTML401_STRICT, AUTO, NO_DOCTYPE_ERRORS]);
}

function DoctypeExpectation(){
}

_ = DoctypeExpectation.prototype = new Enum;
_.getClass$ = getClass_57;
_.typeId$ = 34;
var AUTO, HTML, HTML401_STRICT, HTML401_TRANSITIONAL, NO_DOCTYPE_ERRORS;
function $clinit_113(){
  $clinit_113 = nullMethod;
  STANDARDS_MODE = $DocumentMode(new DocumentMode, 'STANDARDS_MODE', 0);
  ALMOST_STANDARDS_MODE = $DocumentMode(new DocumentMode, 'ALMOST_STANDARDS_MODE', 1);
  QUIRKS_MODE = $DocumentMode(new DocumentMode, 'QUIRKS_MODE', 2);
}

function $DocumentMode(this$static, enum$name, enum$ordinal){
  $clinit_113();
  this$static.name_0 = enum$name;
  this$static.ordinal = enum$ordinal;
  return this$static;
}

function getClass_58(){
  return Lnu_validator_htmlparser_common_DocumentMode_2_classLit;
}

function values_1(){
  $clinit_113();
  return initValues(_3Lnu_validator_htmlparser_common_DocumentMode_2_classLit, 58, 11, [STANDARDS_MODE, ALMOST_STANDARDS_MODE, QUIRKS_MODE]);
}

function DocumentMode(){
}

_ = DocumentMode.prototype = new Enum;
_.getClass$ = getClass_58;
_.typeId$ = 35;
var ALMOST_STANDARDS_MODE, QUIRKS_MODE, STANDARDS_MODE;
function $clinit_115(){
  $clinit_115 = nullMethod;
  ALLOW = $XmlViolationPolicy(new XmlViolationPolicy, 'ALLOW', 0);
  FATAL = $XmlViolationPolicy(new XmlViolationPolicy, 'FATAL', 1);
  ALTER_INFOSET = $XmlViolationPolicy(new XmlViolationPolicy, 'ALTER_INFOSET', 2);
}

function $XmlViolationPolicy(this$static, enum$name, enum$ordinal){
  $clinit_115();
  this$static.name_0 = enum$name;
  this$static.ordinal = enum$ordinal;
  return this$static;
}

function getClass_59(){
  return Lnu_validator_htmlparser_common_XmlViolationPolicy_2_classLit;
}

function values_2(){
  $clinit_115();
  return initValues(_3Lnu_validator_htmlparser_common_XmlViolationPolicy_2_classLit, 59, 12, [ALLOW, FATAL, ALTER_INFOSET]);
}

function XmlViolationPolicy(){
}

_ = XmlViolationPolicy.prototype = new Enum;
_.getClass$ = getClass_59;
_.typeId$ = 36;
var ALLOW, ALTER_INFOSET, FATAL;
function $clinit_116(){
  $clinit_116 = nullMethod;
  REPLACEMENT_CHARACTER = initValues(_3C_classLit, 47, -1, [65533]);
  HTML4_PUBLIC_IDS = initValues(_3Ljava_lang_String_2_classLit, 56, 1, ['-//W3C//DTD HTML 4.0 Frameset//EN', '-//W3C//DTD HTML 4.0 Transitional//EN', '-//W3C//DTD HTML 4.0//EN', '-//W3C//DTD HTML 4.01 Frameset//EN', '-//W3C//DTD HTML 4.01 Transitional//EN', '-//W3C//DTD HTML 4.01//EN']);
  QUIRKY_PUBLIC_IDS = initValues(_3Ljava_lang_String_2_classLit, 56, 1, ['+//silmaril//dtd html pro v0r11 19970101//', '-//advasoft ltd//dtd html 3.0 aswedit + extensions//', '-//as//dtd html 3.0 aswedit + extensions//', '-//ietf//dtd html 2.0 level 1//', '-//ietf//dtd html 2.0 level 2//', '-//ietf//dtd html 2.0 strict level 1//', '-//ietf//dtd html 2.0 strict level 2//', '-//ietf//dtd html 2.0 strict//', '-//ietf//dtd html 2.0//', '-//ietf//dtd html 2.1e//', '-//ietf//dtd html 3.0//', '-//ietf//dtd html 3.2 final//', '-//ietf//dtd html 3.2//', '-//ietf//dtd html 3//', '-//ietf//dtd html level 0//', '-//ietf//dtd html level 1//', '-//ietf//dtd html level 2//', '-//ietf//dtd html level 3//', '-//ietf//dtd html strict level 0//', '-//ietf//dtd html strict level 1//', '-//ietf//dtd html strict level 2//', '-//ietf//dtd html strict level 3//', '-//ietf//dtd html strict//', '-//ietf//dtd html//', '-//metrius//dtd metrius presentational//', '-//microsoft//dtd internet explorer 2.0 html strict//', '-//microsoft//dtd internet explorer 2.0 html//', '-//microsoft//dtd internet explorer 2.0 tables//', '-//microsoft//dtd internet explorer 3.0 html strict//', '-//microsoft//dtd internet explorer 3.0 html//', '-//microsoft//dtd internet explorer 3.0 tables//', '-//netscape comm. corp.//dtd html//', '-//netscape comm. corp.//dtd strict html//', "-//o'reilly and associates//dtd html 2.0//", "-//o'reilly and associates//dtd html extended 1.0//", "-//o'reilly and associates//dtd html extended relaxed 1.0//", '-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//', '-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//', '-//spyglass//dtd html 2.0 extended//', '-//sq//dtd html 2.0 hotmetal + extensions//', '-//sun microsystems corp.//dtd hotjava html//', '-//sun microsystems corp.//dtd hotjava strict html//', '-//w3c//dtd html 3 1995-03-24//', '-//w3c//dtd html 3.2 draft//', '-//w3c//dtd html 3.2 final//', '-//w3c//dtd html 3.2//', '-//w3c//dtd html 3.2s draft//', '-//w3c//dtd html 4.0 frameset//', '-//w3c//dtd html 4.0 transitional//', '-//w3c//dtd html experimental 19960712//', '-//w3c//dtd html experimental 970421//', '-//w3c//dtd w3 html//', '-//w3o//dtd w3 html 3.0//', '-//webtechs//dtd mozilla html 2.0//', '-//webtechs//dtd mozilla html//']);
}

function $accumulateCharacter(this$static, c){
  var newBuf, newLen;
  newLen = this$static.charBufferLen + 1;
  if (newLen > this$static.charBuffer.length) {
    newBuf = initDim(_3C_classLit, 47, -1, newLen, 1);
    arraycopy(this$static.charBuffer, 0, newBuf, 0, this$static.charBufferLen);
    this$static.charBuffer = newBuf;
  }
  this$static.charBuffer[this$static.charBufferLen] = c;
  this$static.charBufferLen = newLen;
}

function $addAttributesToBody(this$static, attributes){
  var body;
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  if (this$static.currentPtr >= 1) {
    body = this$static.stack_0[1];
    if (body.group == 3) {
      $addAttributesToElement(this$static, body.node, attributes);
      return true;
    }
  }
  return false;
}

function $adoptionAgencyEndTag(this$static, name_0){
  var bookmark, clone, commonAncestor, formattingClone, formattingElt, formattingEltListPos, formattingEltStackPos, furthestBlock, furthestBlockPos, inScope, lastNode, listNode, newNode, node, nodeListPos, nodePos;
  $flushCharacters(this$static);
  for (;;) {
    formattingEltListPos = this$static.listPtr;
    while (formattingEltListPos > -1) {
      listNode = this$static.listOfActiveFormattingElements[formattingEltListPos];
      if (!listNode) {
        formattingEltListPos = -1;
        break;
      }
       else if (listNode.name_0 == name_0) {
        break;
      }
      --formattingEltListPos;
    }
    if (formattingEltListPos == -1) {
      return;
    }
    formattingElt = this$static.listOfActiveFormattingElements[formattingEltListPos];
    formattingEltStackPos = this$static.currentPtr;
    inScope = true;
    while (formattingEltStackPos > -1) {
      node = this$static.stack_0[formattingEltStackPos];
      if (node == formattingElt) {
        break;
      }
       else 
        node.scoping && (inScope = false);
      --formattingEltStackPos;
    }
    if (formattingEltStackPos == -1) {
      $removeFromListOfActiveFormattingElements(this$static, formattingEltListPos);
      return;
    }
    if (!inScope) {
      return;
    }
    furthestBlockPos = formattingEltStackPos + 1;
    while (furthestBlockPos <= this$static.currentPtr) {
      node = this$static.stack_0[furthestBlockPos];
      if (node.scoping || node.special) {
        break;
      }
      ++furthestBlockPos;
    }
    if (furthestBlockPos > this$static.currentPtr) {
      while (this$static.currentPtr >= formattingEltStackPos) {
        $pop(this$static);
      }
      $removeFromListOfActiveFormattingElements(this$static, formattingEltListPos);
      return;
    }
    commonAncestor = this$static.stack_0[formattingEltStackPos - 1];
    furthestBlock = this$static.stack_0[furthestBlockPos];
    bookmark = formattingEltListPos;
    nodePos = furthestBlockPos;
    lastNode = furthestBlock;
    for (;;) {
      --nodePos;
      node = this$static.stack_0[nodePos];
      nodeListPos = $findInListOfActiveFormattingElements(this$static, node);
      if (nodeListPos == -1) {
        $removeFromStack(this$static, nodePos);
        --furthestBlockPos;
        continue;
      }
      if (nodePos == formattingEltStackPos) {
        break;
      }
      nodePos == furthestBlockPos && (bookmark = nodeListPos + 1);
      clone = $createElement(this$static, 'http://www.w3.org/1999/xhtml', node.name_0, $cloneAttributes(node.attributes));
      newNode = $StackNode(new StackNode, node.group, node.ns, node.name_0, clone, node.scoping, node.special, node.fosterParenting, node.popName, node.attributes);
      node.attributes = null;
      this$static.stack_0[nodePos] = newNode;
      ++newNode.refcount;
      this$static.listOfActiveFormattingElements[nodeListPos] = newNode;
      --node.refcount;
      --node.refcount;
      node = newNode;
      $detachFromParent(this$static, lastNode.node);
      $appendElement(this$static, lastNode.node, node.node);
      lastNode = node;
    }
    if (commonAncestor.fosterParenting) {
      $detachFromParent(this$static, lastNode.node);
      $insertIntoFosterParent(this$static, lastNode.node);
    }
     else {
      $detachFromParent(this$static, lastNode.node);
      $appendElement(this$static, lastNode.node, commonAncestor.node);
    }
    clone = $createElement(this$static, 'http://www.w3.org/1999/xhtml', formattingElt.name_0, $cloneAttributes(formattingElt.attributes));
    formattingClone = $StackNode(new StackNode, formattingElt.group, formattingElt.ns, formattingElt.name_0, clone, formattingElt.scoping, formattingElt.special, formattingElt.fosterParenting, formattingElt.popName, formattingElt.attributes);
    formattingElt.attributes = null;
    $appendChildrenToNewParent(this$static, furthestBlock.node, clone);
    $appendElement(this$static, clone, furthestBlock.node);
    $removeFromListOfActiveFormattingElements(this$static, formattingEltListPos);
    ++formattingClone.refcount;
    bookmark <= this$static.listPtr && arraycopy(this$static.listOfActiveFormattingElements, bookmark, this$static.listOfActiveFormattingElements, bookmark + 1, this$static.listPtr - bookmark + 1);
    ++this$static.listPtr;
    this$static.listOfActiveFormattingElements[bookmark] = formattingClone;
    $removeFromStack(this$static, formattingEltStackPos);
    $insertIntoStack(this$static, formattingClone, furthestBlockPos);
  }
}

function $append_3(this$static, node){
  var newList;
  ++this$static.listPtr;
  if (this$static.listPtr == this$static.listOfActiveFormattingElements.length) {
    newList = initDim(_3Lnu_validator_htmlparser_impl_StackNode_2_classLit, 62, 15, this$static.listOfActiveFormattingElements.length + 64, 0);
    arraycopy(this$static.listOfActiveFormattingElements, 0, newList, 0, this$static.listOfActiveFormattingElements.length);
    this$static.listOfActiveFormattingElements = newList;
  }
  this$static.listOfActiveFormattingElements[this$static.listPtr] = node;
}

function $appendHtmlElementToDocumentAndPush(this$static, attributes){
  var elt, node;
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elt = $createHtmlElementSetAsRoot(this$static, attributes);
  node = $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HTML_0), elt);
  $push_0(this$static, node);
}

function $appendToCurrentNodeAndPushElement(this$static, ns, elementName, attributes){
  var elt, node;
  $flushCharacters(this$static);
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elt = $createElement(this$static, ns, elementName.name_0, attributes);
  $appendElement(this$static, elt, this$static.stack_0[this$static.currentPtr].node);
  node = $StackNode_0(new StackNode, ns, elementName, elt);
  $push_0(this$static, node);
}

function $appendToCurrentNodeAndPushElementMayFoster(this$static, ns, elementName, attributes){
  var current, elt, node, popName;
  $flushCharacters(this$static);
  popName = elementName.name_0;
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elementName.custom && (popName = $checkPopName(this$static, popName));
  elt = $createElement(this$static, ns, popName, attributes);
  current = this$static.stack_0[this$static.currentPtr];
  current.fosterParenting?$insertIntoFosterParent(this$static, elt):$appendElement(this$static, elt, current.node);
  node = $StackNode_2(new StackNode, ns, elementName, elt, popName);
  $push_0(this$static, node);
}

function $appendToCurrentNodeAndPushElementMayFoster_0(this$static, ns, elementName, attributes){
  var current, elt, node;
  $flushCharacters(this$static);
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elt = $createElement_0(this$static, ns, elementName.name_0, attributes);
  current = this$static.stack_0[this$static.currentPtr];
  if (current) {
  current.fosterParenting?$insertIntoFosterParent(this$static, elt):$appendElement(this$static, elt, current.node);
  }
  node = $StackNode_0(new StackNode, ns, elementName, elt);
  $push_0(this$static, node);
}

function $appendToCurrentNodeAndPushFormElementMayFoster(this$static, attributes){
  var current, elt, node;
  $flushCharacters(this$static);
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elt = $createElement(this$static, 'http://www.w3.org/1999/xhtml', 'form', attributes);
  this$static.formPointer = elt;
  current = this$static.stack_0[this$static.currentPtr];
  current.fosterParenting?$insertIntoFosterParent(this$static, elt):$appendElement(this$static, elt, current.node);
  node = $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , FORM_0), elt);
  $push_0(this$static, node);
}

function $appendToCurrentNodeAndPushFormattingElementMayFoster(this$static, ns, elementName, attributes){
  var current, elt, node;
  $flushCharacters(this$static);
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elt = $createElement(this$static, ns, elementName.name_0, attributes);
  current = this$static.stack_0[this$static.currentPtr];
  current.fosterParenting?$insertIntoFosterParent(this$static, elt):$appendElement(this$static, elt, current.node);
  node = $StackNode_1(new StackNode, ns, elementName, elt, $cloneAttributes(attributes));
  $push_0(this$static, node);
  $append_3(this$static, node);
  ++node.refcount;
}

function $appendToCurrentNodeAndPushHeadElement(this$static, attributes){
  var elt, node;
  $flushCharacters(this$static);
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elt = $createElement(this$static, 'http://www.w3.org/1999/xhtml', 'head', attributes);
  $appendElement(this$static, elt, this$static.stack_0[this$static.currentPtr].node);
  this$static.headPointer = elt;
  node = $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HEAD), elt);
  $push_0(this$static, node);
}

function $appendVoidElementToCurrentMayFoster(this$static, ns, name_0, attributes){
  var current, elt;
  $flushCharacters(this$static);
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elt = $createElement_0(this$static, ns, name_0, attributes);
  current = this$static.stack_0[this$static.currentPtr];
  current.fosterParenting?$insertIntoFosterParent(this$static, elt):$appendElement(this$static, elt, current.node);
  $elementPopped(this$static, ns, name_0, elt);
}

function $appendVoidElementToCurrentMayFoster_0(this$static, ns, elementName, attributes){
  var current, elt, popName;
  $flushCharacters(this$static);
  popName = elementName.name_0;
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elementName.custom && (popName = $checkPopName(this$static, popName));
  elt = $createElement(this$static, ns, popName, attributes);
  current = this$static.stack_0[this$static.currentPtr];
  current.fosterParenting?$insertIntoFosterParent(this$static, elt):$appendElement(this$static, elt, current.node);
  $elementPopped(this$static, ns, popName, elt);
}

function $appendVoidElementToCurrentMayFosterCamelCase(this$static, ns, elementName, attributes){
  var current, elt, popName;
  $flushCharacters(this$static);
  popName = elementName.camelCaseName;
  $processNonNcNames(attributes, this$static, this$static.namePolicy);
  elementName.custom && (popName = $checkPopName(this$static, popName));
  elt = $createElement(this$static, ns, popName, attributes);
  current = this$static.stack_0[this$static.currentPtr];
  current.fosterParenting?$insertIntoFosterParent(this$static, elt):$appendElement(this$static, elt, current.node);
  $elementPopped(this$static, ns, popName, elt);
}

function $charBufferContainsNonWhitespace(this$static){
  var i;
  for (i = 0; i < this$static.charBufferLen; ++i) {
    switch (this$static.charBuffer[i]) {
      case 32:
      case 9:
      case 10:
      case 13:
      case 12:
        continue;
      default:return true;
    }
  }
  return false;
}

function $characters(this$static, buf, start, length_0){
  var end, i;
  if (this$static.needToDropLF) {
    if (buf[start] == 10) {
      ++start;
      --length_0;
      if (length_0 == 0) {
        return;
      }
    }
    this$static.needToDropLF = false;
  }
  if (this$static.inForeign) {
    $accumulateCharacters(this$static, buf, start, length_0);
    return;
  }
  switch (this$static.mode) {
    case 6:
    case 12:
    case 8:
      $reconstructTheActiveFormattingElements(this$static);
    case 20:
      $accumulateCharacters(this$static, buf, start, length_0);
      return;
    default:end = start + length_0;
      charactersloop: for (i = start; i < end; ++i) {
        switch (buf[i]) {
          case 32:
          case 9:
          case 10:
          case 13:
          case 12:
            switch (this$static.mode) {
              case 0:
              case 1:
              case 2:
                start = i + 1;
                continue;
              case 21:
              case 3:
              case 4:
              case 5:
              case 9:
              case 16:
              case 17:
                continue;
              case 6:
              case 12:
              case 8:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $reconstructTheActiveFormattingElements(this$static);
                break charactersloop;
              case 13:
              case 14:
                break charactersloop;
              case 7:
              case 10:
              case 11:
                $reconstructTheActiveFormattingElements(this$static);
                $accumulateCharacter(this$static, buf[i]);
                start = i + 1;
                continue;
              case 15:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $reconstructTheActiveFormattingElements(this$static);
                continue;
              case 18:
              case 19:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $reconstructTheActiveFormattingElements(this$static);
                continue;
            }

          default:switch (this$static.mode) {
              case 0:
                $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
                this$static.mode = 1;
                --i;
                continue;
              case 1:
                $appendHtmlElementToDocumentAndPush(this$static, $emptyAttributes(this$static.tokenizer));
                this$static.mode = 2;
                --i;
                continue;
              case 2:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $appendToCurrentNodeAndPushHeadElement(this$static, ($clinit_128() , EMPTY_ATTRIBUTES));
                this$static.mode = 3;
                --i;
                continue;
              case 3:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $pop(this$static);
                this$static.mode = 5;
                --i;
                continue;
              case 4:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $pop(this$static);
                this$static.mode = 3;
                --i;
                continue;
              case 5:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , BODY), $emptyAttributes(this$static.tokenizer));
                this$static.mode = 21;
                --i;
                continue;
              case 21:
                this$static.framesetOk = false;
                this$static.mode = 6;
                --i;
                continue;
              case 6:
              case 12:
              case 8:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                $reconstructTheActiveFormattingElements(this$static);
                break charactersloop;
              case 7:
              case 10:
              case 11:
                $reconstructTheActiveFormattingElements(this$static);
                $accumulateCharacter(this$static, buf[i]);
                start = i + 1;
                continue;
              case 9:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                if (this$static.currentPtr == 0) {
                  start = i + 1;
                  continue;
                }

                $pop(this$static);
                this$static.mode = 7;
                --i;
                continue;
              case 13:
              case 14:
                break charactersloop;
              case 15:
                this$static.mode = this$static.framesetOk?21:6;
                --i;
                continue;
              case 16:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                start = i + 1;
                continue;
              case 17:
                if (start < i) {
                  $accumulateCharacters(this$static, buf, start, i - start);
                  start = i;
                }

                start = i + 1;
                continue;
              case 18:
                this$static.mode = this$static.framesetOk?21:6;
                --i;
                continue;
              case 19:
                this$static.mode = 16;
                --i;
                continue;
            }

        }
      }

      start < end && $accumulateCharacters(this$static, buf, start, end - start);
  }
}

function $checkMetaCharset(this$static, attributes){
  var content, internalCharsetHtml5, internalCharsetLegacy;
  content = $getValue_1(attributes, ($clinit_124() , CONTENT));
  internalCharsetLegacy = null;
  content != null && (internalCharsetLegacy = extractCharsetFromContent(content));
  if (internalCharsetLegacy == null) {
    internalCharsetHtml5 = $getValue_1(attributes, CHARSET);
    internalCharsetHtml5 != null && (this$static.tokenizer.shouldSuspend = true);
  }
   else {
    this$static.tokenizer.shouldSuspend = true;
  }
}

function $checkPopName(this$static, name_0){
  if (isNCName(name_0)) {
    return name_0;
  }
   else {
    switch (this$static.namePolicy.ordinal) {
      case 0:
        return name_0;
      case 2:
        return escapeName(name_0);
      case 1:
        $fatal_0(this$static, 'Element name \u201C' + name_0 + '\u201D cannot be represented as XML 1.0.');
    }
  }
  return null;
}

function $clearStackBackTo(this$static, eltPos){
  while (this$static.currentPtr > eltPos) {
    $pop(this$static);
  }
}

function $clearTheListOfActiveFormattingElementsUpToTheLastMarker(this$static){
  while (this$static.listPtr > -1) {
    if (!this$static.listOfActiveFormattingElements[this$static.listPtr]) {
      --this$static.listPtr;
      return;
    }
    --this$static.listOfActiveFormattingElements[this$static.listPtr].refcount;
    --this$static.listPtr;
  }
}

function $closeTheCell(this$static, eltPos){
  $generateImpliedEndTags(this$static);
  while (this$static.currentPtr >= eltPos) {
    $pop(this$static);
  }
  $clearTheListOfActiveFormattingElementsUpToTheLastMarker(this$static);
  this$static.mode = 11;
  return;
}

function $comment(this$static, buf, start, length_0){
  var end, end_0, end_1;
  this$static.needToDropLF = false;
  if (!this$static.wantingComments) {
    return;
  }
  if (!this$static.inForeign) {
    switch (this$static.mode) {
      case 0:
      case 1:
      case 18:
      case 19:
        $appendCommentToDocument(this$static, (end = start + length_0 , __checkBounds(buf.length, start, end) , __valueOf(buf, start, end)));
        return;
      case 15:
        $flushCharacters(this$static);
        $appendComment(this$static, this$static.stack_0[0].node, (end_0 = start + length_0 , __checkBounds(buf.length, start, end_0) , __valueOf(buf, start, end_0)));
        return;
    }
  }
  $flushCharacters(this$static);
  $appendComment(this$static, this$static.stack_0[this$static.currentPtr].node, (end_1 = start + length_0 , __checkBounds(buf.length, start, end_1) , __valueOf(buf, start, end_1)));
  return;
}

function $doctype(this$static, name_0, publicIdentifier, systemIdentifier, forceQuirks){
  this$static.needToDropLF = false;
  if (!this$static.inForeign) {
    switch (this$static.mode) {
      case 0:
        switch (this$static.doctypeExpectation.ordinal) {
          case 0:
            if ($isQuirky(name_0, publicIdentifier, systemIdentifier, forceQuirks)) {
              $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
            }
             else if ($isAlmostStandards(publicIdentifier, systemIdentifier)) {
              $documentModeInternal(this$static, ($clinit_113() , ALMOST_STANDARDS_MODE));
            }
             else {
              $equals_1('-//W3C//DTD HTML 4.0//EN', publicIdentifier) && (systemIdentifier == null || $equals_1('http://www.w3.org/TR/REC-html40/strict.dtd', systemIdentifier)) || $equals_1('-//W3C//DTD HTML 4.01//EN', publicIdentifier) && (systemIdentifier == null || $equals_1('http://www.w3.org/TR/html4/strict.dtd', systemIdentifier)) || $equals_1('-//W3C//DTD XHTML 1.0 Strict//EN', publicIdentifier) && $equals_1('http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd', systemIdentifier) || $equals_1('-//W3C//DTD XHTML 1.1//EN', publicIdentifier) && $equals_1('http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd', systemIdentifier) || !((systemIdentifier == null || $equals_1('about:legacy-compat', systemIdentifier)) && publicIdentifier == null);
              $documentModeInternal(this$static, ($clinit_113() , STANDARDS_MODE));
            }

            break;
          case 2:
            this$static.html4 = true;
            this$static.tokenizer.html4 = true;
            if ($isQuirky(name_0, publicIdentifier, systemIdentifier, forceQuirks)) {
              $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
            }
             else if ($isAlmostStandards(publicIdentifier, systemIdentifier)) {
              $documentModeInternal(this$static, ($clinit_113() , ALMOST_STANDARDS_MODE));
            }
             else {
              $equals_1('-//W3C//DTD HTML 4.01//EN', publicIdentifier) && !$equals_1('http://www.w3.org/TR/html4/strict.dtd', systemIdentifier);
              $documentModeInternal(this$static, ($clinit_113() , STANDARDS_MODE));
            }

            break;
          case 1:
            this$static.html4 = true;
            this$static.tokenizer.html4 = true;
            if ($isQuirky(name_0, publicIdentifier, systemIdentifier, forceQuirks)) {
              $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
            }
             else if ($isAlmostStandards(publicIdentifier, systemIdentifier)) {
              $equals_1('-//W3C//DTD HTML 4.01 Transitional//EN', publicIdentifier) && systemIdentifier != null && !$equals_1('http://www.w3.org/TR/html4/loose.dtd', systemIdentifier);
              $documentModeInternal(this$static, ($clinit_113() , ALMOST_STANDARDS_MODE));
            }
             else {
              $documentModeInternal(this$static, ($clinit_113() , STANDARDS_MODE));
            }

            break;
          case 3:
            this$static.html4 = $isHtml4Doctype(publicIdentifier);
            this$static.html4 && (this$static.tokenizer.html4 = true);
            if ($isQuirky(name_0, publicIdentifier, systemIdentifier, forceQuirks)) {
              $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
            }
             else if ($isAlmostStandards(publicIdentifier, systemIdentifier)) {
              $equals_1('-//W3C//DTD HTML 4.01 Transitional//EN', publicIdentifier) && !$equals_1('http://www.w3.org/TR/html4/loose.dtd', systemIdentifier);
              $documentModeInternal(this$static, ($clinit_113() , ALMOST_STANDARDS_MODE));
            }
             else {
              $equals_1('-//W3C//DTD HTML 4.01//EN', publicIdentifier) && !$equals_1('http://www.w3.org/TR/html4/strict.dtd', systemIdentifier);
              $documentModeInternal(this$static, ($clinit_113() , STANDARDS_MODE));
            }

            break;
          case 4:
            $isQuirky(name_0, publicIdentifier, systemIdentifier, forceQuirks)?$documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE)):$isAlmostStandards(publicIdentifier, systemIdentifier)?$documentModeInternal(this$static, ($clinit_113() , ALMOST_STANDARDS_MODE)):$documentModeInternal(this$static, ($clinit_113() , STANDARDS_MODE));
        }

        this$static.mode = 1;
        return;
    }
  }
  return;
}

function $documentModeInternal(this$static, m){
  this$static.quirks = m == ($clinit_113() , QUIRKS_MODE);
}

function $endTag(this$static, elementName){
  var eltPos, group, name_0, node, node_33;
  this$static.needToDropLF = false;
  group = elementName.group;
  name_0 = elementName.name_0;
  endtagloop: for (;;) {
    if (this$static.inForeign && this$static.stack_0[this$static.currentPtr].ns != 'http://www.w3.org/1999/xhtml') {
      eltPos = this$static.currentPtr;
      for (;;) {
        if (this$static.stack_0[eltPos].name_0 == name_0) {
          while (this$static.currentPtr >= eltPos) {
            $pop(this$static);
          }
          return;
        }
        if (this$static.stack_0[--eltPos].ns == 'http://www.w3.org/1999/xhtml') {
          break;
        }
      }
    }
    switch (this$static.mode) {
      case 11:
        switch (group) {
          case 37:
            eltPos = $findLastOrRoot_0(this$static, 37);
            if (eltPos == 0) {
              break endtagloop;
            }

            $clearStackBackTo(this$static, eltPos);
            $pop(this$static);
            this$static.mode = 10;
            break endtagloop;
          case 34:
            eltPos = $findLastOrRoot_0(this$static, 37);
            if (eltPos == 0) {
              break endtagloop;
            }

            $clearStackBackTo(this$static, eltPos);
            $pop(this$static);
            this$static.mode = 10;
            continue;
          case 39:
            if ($findLastInTableScope(this$static, name_0) == 2147483647) {
              break endtagloop;
            }

            eltPos = $findLastOrRoot_0(this$static, 37);
            if (eltPos == 0) {
              break endtagloop;
            }

            $clearStackBackTo(this$static, eltPos);
            $pop(this$static);
            this$static.mode = 10;
            continue;
          case 3:
          case 6:
          case 7:
          case 8:
          case 23:
          case 40:
            break endtagloop;
        }

      case 10:
        switch (group) {
          case 39:
            eltPos = $findLastOrRoot(this$static, name_0);
            if (eltPos == 0) {
              break endtagloop;
            }

            $clearStackBackTo(this$static, eltPos);
            $pop(this$static);
            this$static.mode = 7;
            break endtagloop;
          case 34:
            eltPos = $findLastInTableScopeOrRootTbodyTheadTfoot(this$static);
            if (eltPos == 0) {
              break endtagloop;
            }

            $clearStackBackTo(this$static, eltPos);
            $pop(this$static);
            this$static.mode = 7;
            continue;
          case 3:
          case 6:
          case 7:
          case 8:
          case 23:
          case 40:
          case 37:
            break endtagloop;
        }

      case 7:
        switch (group) {
          case 34:
            eltPos = $findLast(this$static, 'table');
            if (eltPos == 2147483647) {
              break endtagloop;
            }

            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $resetTheInsertionMode(this$static);
            break endtagloop;
          case 3:
          case 6:
          case 7:
          case 8:
          case 23:
          case 39:
          case 40:
          case 37:
            break endtagloop;
        }

      case 8:
        switch (group) {
          case 6:
            eltPos = $findLastInTableScope(this$static, 'caption');
            if (eltPos == 2147483647) {
              break endtagloop;
            }

            $generateImpliedEndTags(this$static);
            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $clearTheListOfActiveFormattingElementsUpToTheLastMarker(this$static);
            this$static.mode = 7;
            break endtagloop;
          case 34:
            eltPos = $findLastInTableScope(this$static, 'caption');
            if (eltPos == 2147483647) {
              break endtagloop;
            }

            $generateImpliedEndTags(this$static);
            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $clearTheListOfActiveFormattingElementsUpToTheLastMarker(this$static);
            this$static.mode = 7;
            continue;
          case 3:
          case 7:
          case 8:
          case 23:
          case 39:
          case 40:
          case 37:
            break endtagloop;
        }

      case 12:
        switch (group) {
          case 40:
            eltPos = $findLastInTableScope(this$static, name_0);
            if (eltPos == 2147483647) {
              break endtagloop;
            }

            $generateImpliedEndTags(this$static);
            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $clearTheListOfActiveFormattingElementsUpToTheLastMarker(this$static);
            this$static.mode = 11;
            break endtagloop;
          case 34:
          case 39:
          case 37:
            if ($findLastInTableScope(this$static, name_0) == 2147483647) {
              break endtagloop;
            }

            $closeTheCell(this$static, $findLastInTableScopeTdTh(this$static));
            continue;
          case 3:
          case 6:
          case 7:
          case 8:
          case 23:
            break endtagloop;
        }

      case 21:
      case 6:
        switch (group) {
          case 3:
            if (!(this$static.currentPtr >= 1 && this$static.stack_0[1].group == 3)) {
              break endtagloop;
            }

            this$static.mode = 15;
            break endtagloop;
          case 23:
            if (!(this$static.currentPtr >= 1 && this$static.stack_0[1].group == 3)) {
              break endtagloop;
            }

            this$static.mode = 15;
            continue;
          case 50:
          case 46:
          case 44:
          case 61:
          case 5:
          case 51:
            eltPos = $findLastInScope(this$static, name_0);
            if (!(eltPos == 2147483647)) {
              $generateImpliedEndTags(this$static);
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }
            }

            break endtagloop;
          case 9:
            if (!this$static.formPointer) {
              break endtagloop;
            }

            this$static.formPointer = null;
            eltPos = $findLastInScope(this$static, name_0);
            if (eltPos == 2147483647) {
              break endtagloop;
            }

            $generateImpliedEndTags(this$static);
            $removeFromStack(this$static, eltPos);
            break endtagloop;
          case 29:
            eltPos = $findLastInScope(this$static, 'p');
            if (eltPos == 2147483647) {
              if (this$static.inForeign) {
                while (this$static.stack_0[this$static.currentPtr].ns != 'http://www.w3.org/1999/xhtml') {
                  $pop(this$static);
                }
                this$static.inForeign = false;
              }
              $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, ($clinit_128() , EMPTY_ATTRIBUTES));
              break endtagloop;
            }

            $generateImpliedEndTagsExceptFor(this$static, 'p');
            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            break endtagloop;
          case 15:
            eltPos = $findLastInListScope(this$static, name_0);
            if (!(eltPos == 2147483647)) {
              $generateImpliedEndTagsExceptFor(this$static, name_0);
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }
            }

            break endtagloop;
          case 41:
            eltPos = $findLastInScope(this$static, name_0);
            if (!(eltPos == 2147483647)) {
              $generateImpliedEndTagsExceptFor(this$static, name_0);
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }
            }

            break endtagloop;
          case 42:
            eltPos = $findLastInScopeHn(this$static);
            if (!(eltPos == 2147483647)) {
              $generateImpliedEndTags(this$static);
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }
            }

            break endtagloop;
          case 1:
          case 45:
          case 64:
          case 24:
            $adoptionAgencyEndTag(this$static, name_0);
            break endtagloop;
          case 63:
          case 43:
            eltPos = $findLastInScope(this$static, name_0);
            if (!(eltPos == 2147483647)) {
              $generateImpliedEndTags(this$static);
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }
              $clearTheListOfActiveFormattingElementsUpToTheLastMarker(this$static);
            }

            break endtagloop;
          case 4:
            if (this$static.inForeign) {
              while (this$static.stack_0[this$static.currentPtr].ns != 'http://www.w3.org/1999/xhtml') {
                $pop(this$static);
              }
              this$static.inForeign = false;
            }

            $reconstructTheActiveFormattingElements(this$static);
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, ($clinit_128() , EMPTY_ATTRIBUTES));
            break endtagloop;
          case 49:
          case 55:
          case 48:
          case 12:
          case 13:
          case 65:
          case 22:
          case 14:
          case 47:
          case 60:
          case 25:
          case 32:
          case 34:
          case 35:
            break endtagloop;
          case 26:
          default:if (name_0 == this$static.stack_0[this$static.currentPtr].name_0) {
              $pop(this$static);
              break endtagloop;
            }

            eltPos = this$static.currentPtr;
            for (;;) {
              node = this$static.stack_0[eltPos];
              if (node.name_0 == name_0) {
                $generateImpliedEndTags(this$static);
                while (this$static.currentPtr >= eltPos) {
                  $pop(this$static);
                }
                break endtagloop;
              }
               else if (node.scoping || node.special) {
                break endtagloop;
              }
              --eltPos;
            }

        }

      case 9:
        switch (group) {
          case 8:
            if (this$static.currentPtr == 0) {
              break endtagloop;
            }

            $pop(this$static);
            this$static.mode = 7;
            break endtagloop;
          case 7:
            break endtagloop;
          default:if (this$static.currentPtr == 0) {
              break endtagloop;
            }

            $pop(this$static);
            this$static.mode = 7;
            continue;
        }

      case 14:
        switch (group) {
          case 6:
          case 34:
          case 39:
          case 37:
          case 40:
            if ($findLastInTableScope(this$static, name_0) != 2147483647) {
              eltPos = $findLastInTableScope(this$static, 'select');
              if (eltPos == 2147483647) {
                break endtagloop;
              }
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }
              $resetTheInsertionMode(this$static);
              continue;
            }
             else {
              break endtagloop;
            }

        }

      case 13:
        switch (group) {
          case 28:
            if ('option' == this$static.stack_0[this$static.currentPtr].name_0) {
              $pop(this$static);
              break endtagloop;
            }
             else {
              break endtagloop;
            }

          case 27:
            'option' == this$static.stack_0[this$static.currentPtr].name_0 && 'optgroup' == this$static.stack_0[this$static.currentPtr - 1].name_0 && $pop(this$static);
            'optgroup' == this$static.stack_0[this$static.currentPtr].name_0 && $pop(this$static);
            break endtagloop;
          case 32:
            eltPos = $findLastInTableScope(this$static, 'select');
            if (eltPos == 2147483647) {
              break endtagloop;
            }

            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $resetTheInsertionMode(this$static);
            break endtagloop;
          default:break endtagloop;
        }

      case 15:
        switch (group) {
          case 23:
            if (this$static.fragment) {
              break endtagloop;
            }
             else {
              this$static.mode = 18;
              break endtagloop;
            }

          default:this$static.mode = this$static.framesetOk?21:6;
            continue;
        }

      case 16:
        switch (group) {
          case 11:
            if (this$static.currentPtr == 0) {
              break endtagloop;
            }

            $pop(this$static);
            !this$static.fragment && 'frameset' != this$static.stack_0[this$static.currentPtr].name_0 && (this$static.mode = 17);
            break endtagloop;
          default:break endtagloop;
        }

      case 17:
        switch (group) {
          case 23:
            this$static.mode = 19;
            break endtagloop;
          default:break endtagloop;
        }

      case 0:
        $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
        this$static.mode = 1;
        continue;
      case 1:
        switch (group) {
          case 20:
          case 4:
          case 23:
          case 3:
            $appendHtmlElementToDocumentAndPush(this$static, $emptyAttributes(this$static.tokenizer));
            this$static.mode = 2;
            continue;
          default:break endtagloop;
        }

      case 2:
        switch (group) {
          case 20:
          case 4:
          case 23:
          case 3:
            $appendToCurrentNodeAndPushHeadElement(this$static, ($clinit_128() , EMPTY_ATTRIBUTES));
            this$static.mode = 3;
            continue;
          default:break endtagloop;
        }

      case 3:
        switch (group) {
          case 20:
            $pop(this$static);
            this$static.mode = 5;
            break endtagloop;
          case 4:
          case 23:
          case 3:
            $pop(this$static);
            this$static.mode = 5;
            continue;
          default:break endtagloop;
        }

      case 4:
        switch (group) {
          case 26:
            $pop(this$static);
            this$static.mode = 3;
            break endtagloop;
          case 4:
            $pop(this$static);
            this$static.mode = 3;
            continue;
          default:break endtagloop;
        }

      case 5:
        switch (group) {
          case 23:
          case 3:
          case 4:
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , BODY), $emptyAttributes(this$static.tokenizer));
            this$static.mode = 21;
            continue;
          default:break endtagloop;
        }

      case 18:
        this$static.mode = this$static.framesetOk?21:6;
        continue;
      case 19:
        this$static.mode = 16;
        continue;
      case 20:
        $pop(this$static);
        this$static.originalMode == 5 && ($flushCharacters(this$static) , node_33 = this$static.stack_0[this$static.currentPtr] , --this$static.currentPtr , --node_33.refcount , undefined);
        this$static.mode = this$static.originalMode;
        break endtagloop;
    }
  }
  this$static.inForeign && !$hasForeignInScope(this$static) && (this$static.inForeign = false);
}

function $endTokenization(this$static){
  this$static.formPointer = null;
  this$static.headPointer = null;
  if (this$static.stack_0 != null) {
    while (this$static.currentPtr > -1) {
      --this$static.stack_0[this$static.currentPtr].refcount;
      --this$static.currentPtr;
    }
    this$static.stack_0 = null;
  }
  if (this$static.listOfActiveFormattingElements != null) {
    while (this$static.listPtr > -1) {
      !!this$static.listOfActiveFormattingElements[this$static.listPtr] && --this$static.listOfActiveFormattingElements[this$static.listPtr].refcount;
      --this$static.listPtr;
    }
    this$static.listOfActiveFormattingElements = null;
  }
  $clearImpl(this$static.idLocations);
  this$static.charBuffer != null && (this$static.charBuffer = null);
}

function $eof(this$static){
  var group, i;
  $flushCharacters(this$static);
  if (this$static.inForeign) {
    while (this$static.stack_0[this$static.currentPtr].ns != 'http://www.w3.org/1999/xhtml') {
      $popOnEof(this$static);
    }
    this$static.inForeign = false;
  }
  eofloop: for (;;) {
    switch (this$static.mode) {
      case 0:
        $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
        this$static.mode = 1;
        continue;
      case 1:
        $appendHtmlElementToDocumentAndPush(this$static, $emptyAttributes(this$static.tokenizer));
        this$static.mode = 2;
        continue;
      case 2:
        $appendToCurrentNodeAndPushHeadElement(this$static, ($clinit_128() , EMPTY_ATTRIBUTES));
        this$static.mode = 3;
        continue;
      case 3:
        while (this$static.currentPtr > 0) {
          $popOnEof(this$static);
        }

        this$static.mode = 5;
        continue;
      case 4:
        while (this$static.currentPtr > 1) {
          $popOnEof(this$static);
        }

        this$static.mode = 3;
        continue;
      case 5:
        $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , BODY), $emptyAttributes(this$static.tokenizer));
        this$static.mode = 6;
        continue;
      case 9:
        if (this$static.currentPtr == 0) {
          break eofloop;
        }
         else {
          $popOnEof(this$static);
          this$static.mode = 7;
          continue;
        }

      case 21:
      case 8:
      case 12:
      case 6:
        openelementloop: for (i = this$static.currentPtr; i >= 0; --i) {
          group = this$static.stack_0[i].group;
          switch (group) {
            case 41:
            case 15:
            case 29:
            case 39:
            case 40:
            case 3:
            case 23:
              break;
            default:break openelementloop;
          }
        }

        break eofloop;
      case 20:
        this$static.originalMode == 5 && $popOnEof(this$static);
        $popOnEof(this$static);
        this$static.mode = this$static.originalMode;
        continue;
      case 10:
      case 11:
      case 7:
      case 13:
      case 14:
      case 16:
        break eofloop;
      case 15:
      case 17:
      case 18:
      case 19:
      default:this$static.currentPtr == 0 && fromDouble((new Date).getTime());
        break eofloop;
    }
  }
  while (this$static.currentPtr > 0) {
    $popOnEof(this$static);
  }
  !this$static.fragment && $popOnEof(this$static);
}

function $fatal(this$static, e){
  var spe;
  spe = $SAXParseException_0(new SAXParseException, e.getMessage(), this$static.tokenizer, e);
  throw spe;
}

function $fatal_0(this$static, s){
  var spe;
  spe = $SAXParseException(new SAXParseException, s, this$static.tokenizer);
  throw spe;
}

function $findInListOfActiveFormattingElements(this$static, node){
  var i;
  for (i = this$static.listPtr; i >= 0; --i) {
    if (node == this$static.listOfActiveFormattingElements[i]) {
      return i;
    }
  }
  return -1;
}

function $findInListOfActiveFormattingElementsContainsBetweenEndAndLastMarker(this$static, name_0){
  var i, node;
  for (i = this$static.listPtr; i >= 0; --i) {
    node = this$static.listOfActiveFormattingElements[i];
    if (!node) {
      return -1;
    }
     else if (node.name_0 == name_0) {
      return i;
    }
  }
  return -1;
}

function $findLast(this$static, name_0){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].name_0 == name_0) {
      return i;
    }
  }
  return 2147483647;
}

function $findLastInListScope(this$static, name_0){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].name_0 == name_0) {
      return i;
    }
     else if (this$static.stack_0[i].scoping || this$static.stack_0[i].name_0 == 'ul' || this$static.stack_0[i].name_0 == 'ol') {
      return 2147483647;
    }
  }
  return 2147483647;
}

function $findLastInScope(this$static, name_0){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].name_0 == name_0) {
      return i;
    }
     else if (this$static.stack_0[i].scoping) {
      return 2147483647;
    }
  }
  return 2147483647;
}

function $findLastInScopeHn(this$static){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].group == 42) {
      return i;
    }
     else if (this$static.stack_0[i].scoping) {
      return 2147483647;
    }
  }
  return 2147483647;
}

function $findLastInTableScope(this$static, name_0){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].name_0 == name_0) {
      return i;
    }
     else if (this$static.stack_0[i].name_0 == 'table') {
      return 2147483647;
    }
  }
  return 2147483647;
}

function $findLastInTableScopeOrRootTbodyTheadTfoot(this$static){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].group == 39) {
      return i;
    }
  }
  return 0;
}

function $findLastInTableScopeTdTh(this$static){
  var i, name_0;
  for (i = this$static.currentPtr; i > 0; --i) {
    name_0 = this$static.stack_0[i].name_0;
    if ('td' == name_0 || 'th' == name_0) {
      return i;
    }
     else if (name_0 == 'table') {
      return 2147483647;
    }
  }
  return 2147483647;
}

function $findLastOrRoot(this$static, name_0){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].name_0 == name_0) {
      return i;
    }
  }
  return 0;
}

function $findLastOrRoot_0(this$static, group){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].group == group) {
      return i;
    }
  }
  return 0;
}

function $flushCharacters(this$static){
  var current, elt, eltPos, node;
  if (this$static.charBufferLen > 0) {
    current = this$static.stack_0[this$static.currentPtr];
    if (current.fosterParenting && $charBufferContainsNonWhitespace(this$static)) {
      eltPos = $findLastOrRoot_0(this$static, 34);
      node = this$static.stack_0[eltPos];
      elt = node.node;
      if (eltPos == 0) {
        $appendCharacters(this$static, elt, valueOf_0(this$static.charBuffer, 0, this$static.charBufferLen));
        this$static.charBufferLen = 0;
        return;
      }
      $insertFosterParentedCharacters(this$static, this$static.charBuffer, 0, this$static.charBufferLen, elt, this$static.stack_0[eltPos - 1].node);
      this$static.charBufferLen = 0;
      return;
    }
    $appendCharacters(this$static, this$static.stack_0[this$static.currentPtr].node, valueOf_0(this$static.charBuffer, 0, this$static.charBufferLen));
    this$static.charBufferLen = 0;
  }
}

function $generateImpliedEndTags(this$static){
  for (;;) {
    switch (this$static.stack_0[this$static.currentPtr].group) {
      case 29:
      case 15:
      case 41:
      case 28:
      case 27:
      case 53:
        $pop(this$static);
        continue;
      default:return;
    }
  }
}

function $generateImpliedEndTagsExceptFor(this$static, name_0){
  var node;
  for (;;) {
    node = this$static.stack_0[this$static.currentPtr];
    switch (node.group) {
      case 29:
      case 15:
      case 41:
      case 28:
      case 27:
      case 53:
        if (node.name_0 == name_0) {
          return;
        }

        $pop(this$static);
        continue;
      default:return;
    }
  }
}

function $hasForeignInScope(this$static){
  var i;
  for (i = this$static.currentPtr; i > 0; --i) {
    if (this$static.stack_0[i].ns != 'http://www.w3.org/1999/xhtml') {
      return true;
    }
     else if (this$static.stack_0[i].scoping) {
      return false;
    }
  }
  return false;
}

function $implicitlyCloseP(this$static){
  var eltPos;
  eltPos = $findLastInScope(this$static, 'p');
  if (eltPos == 2147483647) {
    return;
  }
  $generateImpliedEndTagsExceptFor(this$static, 'p');
  while (this$static.currentPtr >= eltPos) {
    $pop(this$static);
  }
}

function $insertIntoFosterParent(this$static, child){
  var elt, eltPos, node;
  eltPos = $findLastOrRoot_0(this$static, 34);
  node = this$static.stack_0[eltPos];
  elt = node.node;
  if (eltPos == 0) {
    $appendElement(this$static, child, elt);
    return;
  }
  $insertFosterParentedChild(this$static, child, elt, this$static.stack_0[eltPos - 1].node);
}

function $insertIntoStack(this$static, node, position){
  if (position == this$static.currentPtr + 1) {
    $flushCharacters(this$static);
    $push_0(this$static, node);
  }
   else {
    arraycopy(this$static.stack_0, position, this$static.stack_0, position + 1, this$static.currentPtr - position + 1);
    ++this$static.currentPtr;
    this$static.stack_0[position] = node;
  }
}

function $isAlmostStandards(publicIdentifier, systemIdentifier){
  if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('-//w3c//dtd xhtml 1.0 transitional//en', publicIdentifier)) {
    return true;
  }
  if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('-//w3c//dtd xhtml 1.0 frameset//en', publicIdentifier)) {
    return true;
  }
  if (systemIdentifier != null) {
    if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('-//w3c//dtd html 4.01 transitional//en', publicIdentifier)) {
      return true;
    }
    if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('-//w3c//dtd html 4.01 frameset//en', publicIdentifier)) {
      return true;
    }
  }
  return false;
}

function $isHtml4Doctype(publicIdentifier){
  if (publicIdentifier != null && binarySearch_0(HTML4_PUBLIC_IDS, publicIdentifier, ($clinit_95() , $clinit_95() , NATURAL)) > -1) {
    return true;
  }
  return false;
}

function $isInStack(this$static, node){
  var i;
  for (i = this$static.currentPtr; i >= 0; --i) {
    if (this$static.stack_0[i] == node) {
      return true;
    }
  }
  return false;
}

function $isQuirky(name_0, publicIdentifier, systemIdentifier, forceQuirks){
  var i;
  if (forceQuirks) {
    return true;
  }
  if (name_0 != 'html') {
    return true;
  }
  if (publicIdentifier != null) {
    for (i = 0; i < QUIRKY_PUBLIC_IDS.length; ++i) {
      if (lowerCaseLiteralIsPrefixOfIgnoreAsciiCaseString(QUIRKY_PUBLIC_IDS[i], publicIdentifier)) {
        return true;
      }
    }
    if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('-//w3o//dtd w3 html strict 3.0//en//', publicIdentifier) || lowerCaseLiteralEqualsIgnoreAsciiCaseString('-/w3c/dtd html 4.0 transitional/en', publicIdentifier) || lowerCaseLiteralEqualsIgnoreAsciiCaseString('html', publicIdentifier)) {
      return true;
    }
  }
  if (systemIdentifier == null) {
    if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('-//w3c//dtd html 4.01 transitional//en', publicIdentifier)) {
      return true;
    }
     else if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('-//w3c//dtd html 4.01 frameset//en', publicIdentifier)) {
      return true;
    }
  }
   else if (lowerCaseLiteralEqualsIgnoreAsciiCaseString('http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd', systemIdentifier)) {
    return true;
  }
  return false;
}

function $pop(this$static){
  var node;
  $flushCharacters(this$static);
  node = this$static.stack_0[this$static.currentPtr];
  --this$static.currentPtr;
  $elementPopped(this$static, node.ns, node.popName, node.node);
  --node.refcount;
}

function $popOnEof(this$static){
  var node;
  $flushCharacters(this$static);
  node = this$static.stack_0[this$static.currentPtr];
  --this$static.currentPtr;
  $elementPopped(this$static, node.ns, node.popName, node.node);
  --node.refcount;
}

function $push_0(this$static, node){
  var newStack;
  ++this$static.currentPtr;
  if (this$static.currentPtr == this$static.stack_0.length) {
    newStack = initDim(_3Lnu_validator_htmlparser_impl_StackNode_2_classLit, 62, 15, this$static.stack_0.length + 64, 0);
    arraycopy(this$static.stack_0, 0, newStack, 0, this$static.stack_0.length);
    this$static.stack_0 = newStack;
  }
  this$static.stack_0[this$static.currentPtr] = node;
}

function $reconstructTheActiveFormattingElements(this$static){
  var clone, currentNode, entry, entryClone, entryPos, mostRecent;
  if (this$static.listPtr == -1) {
    return;
  }
  mostRecent = this$static.listOfActiveFormattingElements[this$static.listPtr];
  if (!mostRecent || $isInStack(this$static, mostRecent)) {
    return;
  }
  entryPos = this$static.listPtr;
  for (;;) {
    --entryPos;
    if (entryPos == -1) {
      break;
    }
    if (!this$static.listOfActiveFormattingElements[entryPos]) {
      break;
    }
    if ($isInStack(this$static, this$static.listOfActiveFormattingElements[entryPos])) {
      break;
    }
  }
  entryPos < this$static.listPtr && $flushCharacters(this$static);
  while (entryPos < this$static.listPtr) {
    ++entryPos;
    entry = this$static.listOfActiveFormattingElements[entryPos];
    clone = $createElement(this$static, 'http://www.w3.org/1999/xhtml', entry.name_0, $cloneAttributes(entry.attributes));
    entryClone = $StackNode(new StackNode, entry.group, entry.ns, entry.name_0, clone, entry.scoping, entry.special, entry.fosterParenting, entry.popName, entry.attributes);
    entry.attributes = null;
    currentNode = this$static.stack_0[this$static.currentPtr];
    currentNode.fosterParenting?$insertIntoFosterParent(this$static, clone):$appendElement(this$static, clone, currentNode.node);
    $push_0(this$static, entryClone);
    this$static.listOfActiveFormattingElements[entryPos] = entryClone;
    --entry.refcount;
    ++entryClone.refcount;
  }
}

function $removeFromListOfActiveFormattingElements(this$static, pos){
  --this$static.listOfActiveFormattingElements[pos].refcount;
  if (pos == this$static.listPtr) {
    --this$static.listPtr;
    return;
  }
  arraycopy(this$static.listOfActiveFormattingElements, pos + 1, this$static.listOfActiveFormattingElements, pos, this$static.listPtr - pos);
  --this$static.listPtr;
}

function $removeFromStack(this$static, pos){
  if (this$static.currentPtr == pos) {
    $pop(this$static);
  }
   else {
    --this$static.stack_0[pos].refcount;
    arraycopy(this$static.stack_0, pos + 1, this$static.stack_0, pos, this$static.currentPtr - pos);
    --this$static.currentPtr;
  }
}

function $removeFromStack_0(this$static, node){
  var pos;
  if (this$static.stack_0[this$static.currentPtr] == node) {
    $pop(this$static);
  }
   else {
    pos = this$static.currentPtr - 1;
    while (pos >= 0 && this$static.stack_0[pos] != node) {
      --pos;
    }
    if (pos == -1) {
      return;
    }
    --node.refcount;
    arraycopy(this$static.stack_0, pos + 1, this$static.stack_0, pos, this$static.currentPtr - pos);
    --this$static.currentPtr;
  }
}

function $resetTheInsertionMode(this$static){
  var i, name_0, node, ns;
  this$static.inForeign = false;
  for (i = this$static.currentPtr; i >= 0; --i) {
    node = this$static.stack_0[i];
    name_0 = node.name_0;
    ns = node.ns;
    if (i == 0) {
      if (this$static.contextNamespace == 'http://www.w3.org/1999/xhtml' && (this$static.contextName == 'td' || this$static.contextName == 'th')) {
        this$static.mode = this$static.framesetOk?21:6;
        return;
      }
       else {
        name_0 = this$static.contextName;
        ns = this$static.contextNamespace;
      }
    }
    if ('select' == name_0) {
      this$static.mode = 13;
      return;
    }
     else if ('td' == name_0 || 'th' == name_0) {
      this$static.mode = 12;
      return;
    }
     else if ('tr' == name_0) {
      this$static.mode = 11;
      return;
    }
     else if ('tbody' == name_0 || 'thead' == name_0 || 'tfoot' == name_0) {
      this$static.mode = 10;
      return;
    }
     else if ('caption' == name_0) {
      this$static.mode = 8;
      return;
    }
     else if ('colgroup' == name_0) {
      this$static.mode = 9;
      return;
    }
     else if ('table' == name_0) {
      this$static.mode = 7;
      return;
    }
     else if ('http://www.w3.org/1999/xhtml' != ns) {
      this$static.inForeign = true;
      this$static.mode = this$static.framesetOk?21:6;
      return;
    }
     else if ('head' == name_0) {
      this$static.mode = this$static.framesetOk?21:6;
      return;
    }
     else if ('body' == name_0) {
      this$static.mode = this$static.framesetOk?21:6;
      return;
    }
     else if ('frameset' == name_0) {
      this$static.mode = 16;
      return;
    }
     else if ('html' == name_0) {
      !this$static.headPointer?(this$static.mode = 2):(this$static.mode = 5);
      return;
    }
     else if (i == 0) {
      this$static.mode = this$static.framesetOk?21:6;
      return;
    }
  }
}

function $setFragmentContext(this$static, context){
  this$static.contextName = context;
  this$static.contextNamespace = 'http://www.w3.org/1999/xhtml';
  this$static.fragment = false;
  this$static.quirks = false;
}

function $silentPush(this$static, node){
  var newStack;
  ++this$static.currentPtr;
  if (this$static.currentPtr == this$static.stack_0.length) {
    newStack = initDim(_3Lnu_validator_htmlparser_impl_StackNode_2_classLit, 62, 15, this$static.stack_0.length + 64, 0);
    arraycopy(this$static.stack_0, 0, newStack, 0, this$static.stack_0.length);
    this$static.stack_0 = newStack;
  }
  this$static.stack_0[this$static.currentPtr] = node;
}

function $startTag(this$static, elementName, attributes, selfClosing){
  var actionIndex, activeA, activeAPos, attributeQName, currGroup, currNs, currentNode, eltPos, formAttrs, group, i, inputAttributes, name_0, needsPostProcessing, node, prompt_0, promptIndex, current_0, elt_0, node_2, popName_0, current_2, elt_2, node_3, popName_2, current_3, elt_10, current_4, elt_11;
  this$static.needToDropLF = false;
  needsPostProcessing = false;
  starttagloop: for (;;) {
    group = elementName.group;
    name_0 = elementName.name_0;
    if (this$static.inForeign) {
      currentNode = this$static.stack_0[this$static.currentPtr];
      currNs = currentNode.ns;
      currGroup = currentNode.group;
      if ('http://www.w3.org/1999/xhtml' == currNs || 'http://www.w3.org/1998/Math/MathML' == currNs && (56 != group && 57 == currGroup || 19 == group && 58 == currGroup) || 'http://www.w3.org/2000/svg' == currNs && (36 == currGroup || 59 == currGroup)) {
        needsPostProcessing = true;
      }
       else {
        switch (group) {
          case 45:
          case 50:
          case 3:
          case 4:
          case 52:
          case 41:
          case 46:
          case 48:
          case 42:
          case 20:
          case 22:
          case 15:
          case 18:
          case 24:
          case 29:
          case 44:
          case 34:
            while (this$static.stack_0[this$static.currentPtr].ns != 'http://www.w3.org/1999/xhtml') {
              $pop(this$static);
            }

            this$static.inForeign = false;
            continue starttagloop;
          case 64:
            if ($contains(attributes, ($clinit_124() , COLOR)) || $contains(attributes, FACE) || $contains(attributes, SIZE)) {
              while (this$static.stack_0[this$static.currentPtr].ns != 'http://www.w3.org/1999/xhtml') {
                $pop(this$static);
              }
              this$static.inForeign = false;
              continue starttagloop;
            }

          default:if ('http://www.w3.org/2000/svg' == currNs) {
              attributes.mode = 2;
              if (selfClosing) {
                $appendVoidElementToCurrentMayFosterCamelCase(this$static, currNs, elementName, attributes);
                selfClosing = false;
              }
               else {
                $flushCharacters(this$static);
                popName_0 = elementName.camelCaseName;
                $processNonNcNames(attributes, this$static, this$static.namePolicy);
                elementName.custom && (popName_0 = $checkPopName(this$static, popName_0));
                elt_0 = $createElement(this$static, currNs, popName_0, attributes);
                current_0 = this$static.stack_0[this$static.currentPtr];
                current_0.fosterParenting?$insertIntoFosterParent(this$static, elt_0):$appendElement(this$static, elt_0, current_0.node);
                node_2 = $StackNode_3(new StackNode, currNs, elementName, elt_0, popName_0, ($clinit_125() , FOREIGNOBJECT) == elementName);
                $push_0(this$static, node_2);
              }
              attributes = null;
              break starttagloop;
            }
             else {
              attributes.mode = 1;
              if (selfClosing) {
                $appendVoidElementToCurrentMayFoster_0(this$static, currNs, elementName, attributes);
                selfClosing = false;
              }
               else {
                $flushCharacters(this$static);
                popName_2 = elementName.name_0;
                $processNonNcNames(attributes, this$static, this$static.namePolicy);
                elementName.custom && (popName_2 = $checkPopName(this$static, popName_2));
                elt_2 = $createElement(this$static, currNs, popName_2, attributes);
                current_2 = this$static.stack_0[this$static.currentPtr];
                current_2.fosterParenting?$insertIntoFosterParent(this$static, elt_2):$appendElement(this$static, elt_2, current_2.node);
                node_3 = $StackNode_3(new StackNode, currNs, elementName, elt_2, popName_2, false);
                $push_0(this$static, node_3);
              }
              attributes = null;
              break starttagloop;
            }

        }
      }
    }
    switch (this$static.mode) {
      case 10:
        switch (group) {
          case 37:
            $clearStackBackTo(this$static, $findLastInTableScopeOrRootTbodyTheadTfoot(this$static));
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.mode = 11;
            attributes = null;
            break starttagloop;
          case 40:
            $clearStackBackTo(this$static, $findLastInTableScopeOrRootTbodyTheadTfoot(this$static));
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , TR), ($clinit_128() , EMPTY_ATTRIBUTES));
            this$static.mode = 11;
            continue;
          case 6:
          case 7:
          case 8:
          case 39:
            eltPos = $findLastInTableScopeOrRootTbodyTheadTfoot(this$static);
            if (eltPos == 0) {
              break starttagloop;
            }
             else {
              $clearStackBackTo(this$static, eltPos);
              $pop(this$static);
              this$static.mode = 7;
              continue;
            }

        }

      case 11:
        switch (group) {
          case 40:
            $clearStackBackTo(this$static, $findLastOrRoot_0(this$static, 37));
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.mode = 12;
            $append_3(this$static, null);
            attributes = null;
            break starttagloop;
          case 6:
          case 7:
          case 8:
          case 39:
          case 37:
            eltPos = $findLastOrRoot_0(this$static, 37);
            if (eltPos == 0) {
              break starttagloop;
            }

            $clearStackBackTo(this$static, eltPos);
            $pop(this$static);
            this$static.mode = 10;
            continue;
        }

      case 7:
        intableloop: for (;;) {
          switch (group) {
            case 6:
              $clearStackBackTo(this$static, $findLastOrRoot_0(this$static, 34));
              $append_3(this$static, null);
              $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.mode = 8;
              attributes = null;
              break starttagloop;
            case 8:
              $clearStackBackTo(this$static, $findLastOrRoot_0(this$static, 34));
              $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.mode = 9;
              attributes = null;
              break starttagloop;
            case 7:
              $clearStackBackTo(this$static, $findLastOrRoot_0(this$static, 34));
              $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , COLGROUP), ($clinit_128() , EMPTY_ATTRIBUTES));
              this$static.mode = 9;
              continue starttagloop;
            case 39:
              $clearStackBackTo(this$static, $findLastOrRoot_0(this$static, 34));
              $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.mode = 10;
              attributes = null;
              break starttagloop;
            case 37:
            case 40:
              $clearStackBackTo(this$static, $findLastOrRoot_0(this$static, 34));
              $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , TBODY), ($clinit_128() , EMPTY_ATTRIBUTES));
              this$static.mode = 10;
              continue starttagloop;
            case 34:
              eltPos = $findLastInTableScope(this$static, name_0);
              if (eltPos == 2147483647) {
                break starttagloop;
              }

              $generateImpliedEndTags(this$static);
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }

              $resetTheInsertionMode(this$static);
              continue starttagloop;
            case 31:
              $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 2, elementName);
              attributes = null;
              break starttagloop;
            case 33:
              $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 60, elementName);
              attributes = null;
              break starttagloop;
            case 13:
              if (!lowerCaseLiteralEqualsIgnoreAsciiCaseString('hidden', $getValue_1(attributes, ($clinit_124() , TYPE_1)))) {
                break intableloop;
              }

              $flushCharacters(this$static);
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              elt_10 = $createElement_0(this$static, 'http://www.w3.org/1999/xhtml', name_0, attributes);
              current_3 = this$static.stack_0[this$static.currentPtr];
              $appendElement(this$static, elt_10, current_3.node);
              $elementPopped(this$static, 'http://www.w3.org/1999/xhtml', name_0, elt_10);
              selfClosing = false;
              attributes = null;
              break starttagloop;
            case 9:
              if (this$static.formPointer) {
                break starttagloop;
              }
               else {
                $flushCharacters(this$static);
                $processNonNcNames(attributes, this$static, this$static.namePolicy);
                elt_11 = $createElement(this$static, 'http://www.w3.org/1999/xhtml', 'form', attributes);
                this$static.formPointer = elt_11;
                current_4 = this$static.stack_0[this$static.currentPtr];
                $appendElement(this$static, elt_11, current_4.node);
                $elementPopped(this$static, 'http://www.w3.org/1999/xhtml', 'form', elt_11);
                attributes = null;
                break starttagloop;
              }

            default:break intableloop;
          }
        }

      case 8:
        switch (group) {
          case 6:
          case 7:
          case 8:
          case 39:
          case 37:
          case 40:
            eltPos = $findLastInTableScope(this$static, 'caption');
            if (eltPos == 2147483647) {
              break starttagloop;
            }

            $generateImpliedEndTags(this$static);
            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $clearTheListOfActiveFormattingElementsUpToTheLastMarker(this$static);
            this$static.mode = 7;
            continue;
        }

      case 12:
        switch (group) {
          case 6:
          case 7:
          case 8:
          case 39:
          case 37:
          case 40:
            eltPos = $findLastInTableScopeTdTh(this$static);
            if (eltPos == 2147483647) {
              break starttagloop;
            }
             else {
              $closeTheCell(this$static, eltPos);
              continue;
            }

        }

      case 21:
        switch (group) {
          case 11:
            if (this$static.mode == 21) {
              if (this$static.currentPtr == 0 || this$static.stack_0[1].group != 3) {
                break starttagloop;
              }
               else {
                $detachFromParent(this$static, this$static.stack_0[1].node);
                while (this$static.currentPtr > 0) {
                  $pop(this$static);
                }
                $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
                this$static.mode = 16;
                attributes = null;
                break starttagloop;
              }
            }
             else {
              break starttagloop;
            }

          case 44:
          case 15:
          case 41:
          case 5:
          case 43:
          case 63:
          case 34:
          case 49:
          case 4:
          case 48:
          case 13:
          case 65:
          case 22:
          case 35:
          case 38:
          case 47:
          case 32:
            if (this$static.mode == 21) {
              this$static.framesetOk = false;
              this$static.mode = 6;
            }

        }

      case 6:
        inbodyloop: for (;;) {
          switch (group) {
            case 23:
              if (!this$static.fragment) {
                $processNonNcNames(attributes, this$static, this$static.namePolicy);
                $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
                attributes = null;
              }

              break starttagloop;
            case 2:
            case 16:
            case 18:
            case 33:
            case 31:
            case 36:
            case 54:
              break inbodyloop;
            case 3:
              $addAttributesToBody(this$static, attributes) && (attributes = null);
              break starttagloop;
            case 29:
            case 50:
            case 46:
            case 51:
              $implicitlyCloseP(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 42:
              $implicitlyCloseP(this$static);
              this$static.stack_0[this$static.currentPtr].group == 42 && $pop(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 61:
              $implicitlyCloseP(this$static);
              $appendToCurrentNodeAndPushElementMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 44:
              $implicitlyCloseP(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.needToDropLF = true;
              attributes = null;
              break starttagloop;
            case 9:
              if (this$static.formPointer) {
                break starttagloop;
              }
               else {
                $implicitlyCloseP(this$static);
                $appendToCurrentNodeAndPushFormElementMayFoster(this$static, attributes);
                attributes = null;
                break starttagloop;
              }

            case 15:
            case 41:
              eltPos = this$static.currentPtr;
              for (;;) {
                node = this$static.stack_0[eltPos];
                if (node.group == group) {
                  $generateImpliedEndTagsExceptFor(this$static, node.name_0);
                  while (this$static.currentPtr >= eltPos) {
                    $pop(this$static);
                  }
                  break;
                }
                 else if (node.scoping || node.special && node.name_0 != 'p' && node.name_0 != 'address' && node.name_0 != 'div') {
                  break;
                }
                --eltPos;
              }

              $implicitlyCloseP(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 30:
              $implicitlyCloseP(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 3, elementName);
              attributes = null;
              break starttagloop;
            case 1:
              activeAPos = $findInListOfActiveFormattingElementsContainsBetweenEndAndLastMarker(this$static, 'a');
              if (activeAPos != -1) {
                activeA = this$static.listOfActiveFormattingElements[activeAPos];
                ++activeA.refcount;
                $adoptionAgencyEndTag(this$static, 'a');
                $removeFromStack_0(this$static, activeA);
                activeAPos = $findInListOfActiveFormattingElements(this$static, activeA);
                activeAPos != -1 && $removeFromListOfActiveFormattingElements(this$static, activeAPos);
                --activeA.refcount;
              }

              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushFormattingElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 45:
            case 64:
              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushFormattingElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 24:
              $reconstructTheActiveFormattingElements(this$static);
              2147483647 != $findLastInScope(this$static, 'nobr') && $adoptionAgencyEndTag(this$static, 'nobr');
              $appendToCurrentNodeAndPushFormattingElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 5:
              eltPos = $findLastInScope(this$static, name_0);
              if (eltPos != 2147483647) {
                $generateImpliedEndTags(this$static);
                while (this$static.currentPtr >= eltPos) {
                  $pop(this$static);
                }
                continue starttagloop;
              }
               else {
                $reconstructTheActiveFormattingElements(this$static);
                $appendToCurrentNodeAndPushElementMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
                attributes = null;
                break starttagloop;
              }

            case 63:
              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushElementMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              $append_3(this$static, null);
              attributes = null;
              break starttagloop;
            case 43:
              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              $append_3(this$static, null);
              attributes = null;
              break starttagloop;
            case 34:
              !this$static.quirks && $implicitlyCloseP(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.mode = 7;
              attributes = null;
              break starttagloop;
            case 4:
            case 48:
            case 49:
              $reconstructTheActiveFormattingElements(this$static);
            case 55:
              $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              selfClosing = false;
              attributes = null;
              break starttagloop;
            case 22:
              $implicitlyCloseP(this$static);
              $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              selfClosing = false;
              attributes = null;
              break starttagloop;
            case 12:
              elementName = ($clinit_125() , IMG);
              continue starttagloop;
            case 65:
            case 13:
              $reconstructTheActiveFormattingElements(this$static);
              $appendVoidElementToCurrentMayFoster(this$static, 'http://www.w3.org/1999/xhtml', name_0, attributes);
              selfClosing = false;
              attributes = null;
              break starttagloop;
            case 14:
              if (this$static.formPointer) {
                break starttagloop;
              }

              $implicitlyCloseP(this$static);
              formAttrs = $HtmlAttributes(new HtmlAttributes, 0);
              actionIndex = $getIndex(attributes, ($clinit_124() , ACTION));
              actionIndex > -1 && $addAttribute(formAttrs, ACTION, $getValue_0(attributes, actionIndex), ($clinit_115() , ALLOW));
              $appendToCurrentNodeAndPushFormElementMayFoster(this$static, formAttrs);
              $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HR), ($clinit_128() , EMPTY_ATTRIBUTES));
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', LABEL_0, EMPTY_ATTRIBUTES);
              promptIndex = $getIndex(attributes, PROMPT);
              if (promptIndex > -1) {
                prompt_0 = $toCharArray($getValue_0(attributes, promptIndex));
                $appendCharacters(this$static, this$static.stack_0[this$static.currentPtr].node, valueOf_0(prompt_0, 0, prompt_0.length));
              }
               else {
                $appendCharacters(this$static, this$static.stack_0[this$static.currentPtr].node, 'This is a searchable index. Enter search keywords: ');
              }

              inputAttributes = $HtmlAttributes(new HtmlAttributes, 0);
              $addAttribute(inputAttributes, NAME, 'isindex', ($clinit_115() , ALLOW));
              for (i = 0; i < attributes.length_0; ++i) {
                attributeQName = $getAttributeName(attributes, i);
                NAME == attributeQName || PROMPT == attributeQName || ACTION != attributeQName && $addAttribute(inputAttributes, attributeQName, $getValue_0(attributes, i), ALLOW);
              }

              $clearWithoutReleasingContents(attributes);
              $appendVoidElementToCurrentMayFoster(this$static, 'http://www.w3.org/1999/xhtml', 'input', inputAttributes);
              $pop(this$static);
              $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', HR, EMPTY_ATTRIBUTES);
              $pop(this$static);
              selfClosing = false;
              break starttagloop;
            case 35:
              $appendToCurrentNodeAndPushElementMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 1, elementName);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              this$static.needToDropLF = true;
              attributes = null;
              break starttagloop;
            case 38:
              $implicitlyCloseP(this$static);
              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 60, elementName);
              attributes = null;
              break starttagloop;
            case 26:
              {
                $reconstructTheActiveFormattingElements(this$static);
                $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
                attributes = null;
                break starttagloop;
              }

            case 25:
            case 47:
            case 60:
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 60, elementName);
              attributes = null;
              break starttagloop;
            case 32:
              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushElementMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              switch (this$static.mode) {
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                  this$static.mode = 14;
                  break;
                default:this$static.mode = 13;
              }

              attributes = null;
              break starttagloop;
            case 27:
            case 28:
              if ($findLastInScope(this$static, 'option') != 2147483647) {
                optionendtagloop: for (;;) {
                  if ('option' == this$static.stack_0[this$static.currentPtr].name_0) {
                    $pop(this$static);
                    break optionendtagloop;
                  }
                  eltPos = this$static.currentPtr;
                  for (;;) {
                    if (this$static.stack_0[eltPos].name_0 == 'option') {
                      $generateImpliedEndTags(this$static);
                      while (this$static.currentPtr >= eltPos) {
                        $pop(this$static);
                      }
                      break optionendtagloop;
                    }
                    --eltPos;
                  }
                }
              }

              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 53:
              eltPos = $findLastInScope(this$static, 'ruby');
              eltPos != 2147483647 && $generateImpliedEndTags(this$static);
              if (eltPos != this$static.currentPtr) {
                while (this$static.currentPtr > eltPos) {
                  $pop(this$static);
                }
              }

              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            case 17:
              $reconstructTheActiveFormattingElements(this$static);
              attributes.mode = 1;
              if (selfClosing) {
                $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1998/Math/MathML', elementName, attributes);
                selfClosing = false;
              }
               else {
                $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1998/Math/MathML', elementName, attributes);
                this$static.inForeign = true;
              }

              attributes = null;
              break starttagloop;
            case 19:
              $reconstructTheActiveFormattingElements(this$static);
              attributes.mode = 2;
              if (selfClosing) {
                $appendVoidElementToCurrentMayFosterCamelCase(this$static, 'http://www.w3.org/2000/svg', elementName, attributes);
                selfClosing = false;
              }
               else {
                $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/2000/svg', elementName, attributes);
                this$static.inForeign = true;
              }

              attributes = null;
              break starttagloop;
            case 6:
            case 7:
            case 8:
            case 39:
            case 37:
            case 40:
            case 10:
            case 11:
            case 20:
              break starttagloop;
            case 62:
              $reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushElementMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
            default:$reconstructTheActiveFormattingElements(this$static);
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              attributes = null;
              break starttagloop;
          }
        }

      case 3:
        inheadloop: for (;;) {
          switch (group) {
            case 23:
              if (!this$static.fragment) {
                $processNonNcNames(attributes, this$static, this$static.namePolicy);
                $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
                attributes = null;
              }

              break starttagloop;
            case 2:
            case 54:
              $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              selfClosing = false;
              attributes = null;
              break starttagloop;
            case 18:
            case 16:
              break inheadloop;
            case 36:
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 1, elementName);
              attributes = null;
              break starttagloop;
            case 26:
              {
                $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
                this$static.mode = 4;
              }

              attributes = null;
              break starttagloop;
            case 31:
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 2, elementName);
              attributes = null;
              break starttagloop;
            case 33:
            case 25:
              $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
              this$static.originalMode = this$static.mode;
              this$static.mode = 20;
              $setStateAndEndTagExpectation_0(this$static.tokenizer, 60, elementName);
              attributes = null;
              break starttagloop;
            case 20:
              break starttagloop;
            default:$pop(this$static);
              this$static.mode = 5;
              continue starttagloop;
          }
        }

      case 4:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          case 16:
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            selfClosing = false;
            attributes = null;
            break starttagloop;
          case 18:
            $checkMetaCharset(this$static, attributes);
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            selfClosing = false;
            attributes = null;
            break starttagloop;
          case 33:
          case 25:
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.originalMode = this$static.mode;
            this$static.mode = 20;
            $setStateAndEndTagExpectation_0(this$static.tokenizer, 60, elementName);
            attributes = null;
            break starttagloop;
          case 20:
            break starttagloop;
          case 26:
            break starttagloop;
          default:$pop(this$static);
            this$static.mode = 3;
            continue;
        }

      case 9:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          case 7:
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            selfClosing = false;
            attributes = null;
            break starttagloop;
          default:if (this$static.currentPtr == 0) {
              break starttagloop;
            }

            $pop(this$static);
            this$static.mode = 7;
            continue;
        }

      case 14:
        switch (group) {
          case 6:
          case 39:
          case 37:
          case 40:
          case 34:
            eltPos = $findLastInTableScope(this$static, 'select');
            if (eltPos == 2147483647) {
              break starttagloop;
            }

            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $resetTheInsertionMode(this$static);
            continue;
        }

      case 13:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          case 28:
            'option' == this$static.stack_0[this$static.currentPtr].name_0 && $pop(this$static);
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            attributes = null;
            break starttagloop;
          case 27:
            'option' == this$static.stack_0[this$static.currentPtr].name_0 && $pop(this$static);
            'optgroup' == this$static.stack_0[this$static.currentPtr].name_0 && $pop(this$static);
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            attributes = null;
            break starttagloop;
          case 32:
            eltPos = $findLastInTableScope(this$static, name_0);
            if (eltPos == 2147483647) {
              break starttagloop;
            }
             else {
              while (this$static.currentPtr >= eltPos) {
                $pop(this$static);
              }
              $resetTheInsertionMode(this$static);
              break starttagloop;
            }

          case 13:
          case 35:
          case 65:
            eltPos = $findLastInTableScope(this$static, 'select');
            if (eltPos == 2147483647) {
              break starttagloop;
            }

            while (this$static.currentPtr >= eltPos) {
              $pop(this$static);
            }

            $resetTheInsertionMode(this$static);
            continue;
          case 31:
            $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.originalMode = this$static.mode;
            this$static.mode = 20;
            $setStateAndEndTagExpectation_0(this$static.tokenizer, 2, elementName);
            attributes = null;
            break starttagloop;
          default:break starttagloop;
        }

      case 15:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          default:this$static.mode = this$static.framesetOk?21:6;
            continue;
        }

      case 16:
        switch (group) {
          case 11:
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            attributes = null;
            break starttagloop;
          case 10:
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            selfClosing = false;
            attributes = null;
            break starttagloop;
        }

      case 17:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          case 25:
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.originalMode = this$static.mode;
            this$static.mode = 20;
            $setStateAndEndTagExpectation_0(this$static.tokenizer, 60, elementName);
            attributes = null;
            break starttagloop;
          default:break starttagloop;
        }

      case 0:
        $documentModeInternal(this$static, ($clinit_113() , QUIRKS_MODE));
        this$static.mode = 1;
        continue;
      case 1:
        switch (group) {
          case 23:
            attributes == ($clinit_128() , EMPTY_ATTRIBUTES)?$appendHtmlElementToDocumentAndPush(this$static, $emptyAttributes(this$static.tokenizer)):$appendHtmlElementToDocumentAndPush(this$static, attributes);
            this$static.mode = 2;
            attributes = null;
            break starttagloop;
          default:$appendHtmlElementToDocumentAndPush(this$static, $emptyAttributes(this$static.tokenizer));
            this$static.mode = 2;
            continue;
        }

      case 2:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          case 20:
            $appendToCurrentNodeAndPushHeadElement(this$static, attributes);
            this$static.mode = 3;
            attributes = null;
            break starttagloop;
          default:$appendToCurrentNodeAndPushHeadElement(this$static, ($clinit_128() , EMPTY_ATTRIBUTES));
            this$static.mode = 3;
            continue;
        }

      case 5:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          case 3:
            attributes.length_0 == 0?($appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , BODY), $emptyAttributes(this$static.tokenizer)) , undefined):$appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , BODY), attributes);
            this$static.framesetOk = false;
            this$static.mode = 6;
            attributes = null;
            break starttagloop;
          case 11:
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.mode = 16;
            attributes = null;
            break starttagloop;
          case 2:
            $flushCharacters(this$static);
            $silentPush(this$static, $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HEAD), this$static.headPointer));
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            selfClosing = false;
            $pop(this$static);
            attributes = null;
            break starttagloop;
          case 16:
            $flushCharacters(this$static);
            $silentPush(this$static, $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HEAD), this$static.headPointer));
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            selfClosing = false;
            $pop(this$static);
            attributes = null;
            break starttagloop;
          case 18:
            $checkMetaCharset(this$static, attributes);
            $flushCharacters(this$static);
            $silentPush(this$static, $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HEAD), this$static.headPointer));
            $appendVoidElementToCurrentMayFoster_0(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            selfClosing = false;
            $pop(this$static);
            attributes = null;
            break starttagloop;
          case 31:
            $flushCharacters(this$static);
            $silentPush(this$static, $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HEAD), this$static.headPointer));
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.originalMode = this$static.mode;
            this$static.mode = 20;
            $setStateAndEndTagExpectation_0(this$static.tokenizer, 2, elementName);
            attributes = null;
            break starttagloop;
          case 33:
          case 25:
            $flushCharacters(this$static);
            $silentPush(this$static, $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HEAD), this$static.headPointer));
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.originalMode = this$static.mode;
            this$static.mode = 20;
            $setStateAndEndTagExpectation_0(this$static.tokenizer, 60, elementName);
            attributes = null;
            break starttagloop;
          case 36:
            $flushCharacters(this$static);
            $silentPush(this$static, $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HEAD), this$static.headPointer));
            $appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.originalMode = this$static.mode;
            this$static.mode = 20;
            $setStateAndEndTagExpectation_0(this$static.tokenizer, 1, elementName);
            attributes = null;
            break starttagloop;
          case 20:
            break starttagloop;
          default:$appendToCurrentNodeAndPushElement(this$static, 'http://www.w3.org/1999/xhtml', ($clinit_125() , BODY), $emptyAttributes(this$static.tokenizer));
            this$static.mode = 21;
            continue;
        }

      case 18:
        switch (group) {
          case 23:
            if (!this$static.fragment) {
              $processNonNcNames(attributes, this$static, this$static.namePolicy);
              $addAttributesToElement(this$static, this$static.stack_0[0].node, attributes);
              attributes = null;
            }

            break starttagloop;
          default:this$static.mode = this$static.framesetOk?21:6;
            continue;
        }

      case 19:
        switch (group) {
          case 25:
            $appendToCurrentNodeAndPushElementMayFoster(this$static, 'http://www.w3.org/1999/xhtml', elementName, attributes);
            this$static.originalMode = this$static.mode;
            this$static.mode = 20;
            $setStateAndEndTagExpectation_0(this$static.tokenizer, 2, elementName);
            attributes = null;
            break starttagloop;
          default:break starttagloop;
        }

      case 20:
        break starttagloop;
    }
  }
  needsPostProcessing && this$static.inForeign && !$hasForeignInScope(this$static) && (this$static.inForeign = false);
  attributes != ($clinit_128() , EMPTY_ATTRIBUTES);
}

function $startTokenization(this$static, self_0){
  var elt, node;
  this$static.tokenizer = self_0;
  this$static.stack_0 = initDim(_3Lnu_validator_htmlparser_impl_StackNode_2_classLit, 62, 15, 64, 0);
  this$static.listOfActiveFormattingElements = initDim(_3Lnu_validator_htmlparser_impl_StackNode_2_classLit, 62, 15, 64, 0);
  this$static.needToDropLF = false;
  this$static.originalMode = 0;
  this$static.currentPtr = -1;
  this$static.listPtr = -1;
  this$static.formPointer = null;
  this$static.headPointer = null;
  this$static.html4 = false;
  $clearImpl(this$static.idLocations);
  this$static.wantingComments = this$static.wantingComments;
  this$static.script = null;
  this$static.placeholder = null;
  this$static.readyToRun = false;
  this$static.charBufferLen = 0;
  this$static.charBuffer = initDim(_3C_classLit, 47, -1, 1024, 1);
  this$static.framesetOk = true;
  if (this$static.fragment) {
    elt = $createHtmlElementSetAsRoot(this$static, $emptyAttributes(this$static.tokenizer));
    node = $StackNode_0(new StackNode, 'http://www.w3.org/1999/xhtml', ($clinit_125() , HTML_0), elt);
    ++this$static.currentPtr;
    this$static.stack_0[this$static.currentPtr] = node;
    $resetTheInsertionMode(this$static);
    'title' == this$static.contextName || 'textarea' == this$static.contextName?$setStateAndEndTagExpectation(this$static.tokenizer, 1):'style' == this$static.contextName || 'xmp' == this$static.contextName || 'iframe' == this$static.contextName || 'noembed' == this$static.contextName || 'noframes' == this$static.contextName?$setStateAndEndTagExpectation(this$static.tokenizer, 60):'plaintext' == this$static.contextName?$setStateAndEndTagExpectation(this$static.tokenizer, 3):'script' == this$static.contextName?$setStateAndEndTagExpectation(this$static.tokenizer, 2):$setStateAndEndTagExpectation(this$static.tokenizer, 0);
    this$static.contextName = null;
  }
   else {
    this$static.mode = 0;
    this$static.inForeign = false;
  }
}

function $zeroOriginatingReplacementCharacter(this$static){
  (this$static.inForeign || this$static.mode == 20) && $characters(this$static, REPLACEMENT_CHARACTER, 0, 1);
}

function extractCharsetFromContent(attributeValue){
  var buffer, c, charset, charsetState, end, i, start;
  charsetState = 0;
  start = -1;
  end = -1;
  buffer = $toCharArray(attributeValue);
  charsetloop: for (i = 0; i < buffer.length; ++i) {
    c = buffer[i];
    switch (charsetState) {
      case 0:
        switch (c) {
          case 99:
          case 67:
            charsetState = 1;
            continue;
          default:continue;
        }

      case 1:
        switch (c) {
          case 104:
          case 72:
            charsetState = 2;
            continue;
          default:charsetState = 0;
            continue;
        }

      case 2:
        switch (c) {
          case 97:
          case 65:
            charsetState = 3;
            continue;
          default:charsetState = 0;
            continue;
        }

      case 3:
        switch (c) {
          case 114:
          case 82:
            charsetState = 4;
            continue;
          default:charsetState = 0;
            continue;
        }

      case 4:
        switch (c) {
          case 115:
          case 83:
            charsetState = 5;
            continue;
          default:charsetState = 0;
            continue;
        }

      case 5:
        switch (c) {
          case 101:
          case 69:
            charsetState = 6;
            continue;
          default:charsetState = 0;
            continue;
        }

      case 6:
        switch (c) {
          case 116:
          case 84:
            charsetState = 7;
            continue;
          default:charsetState = 0;
            continue;
        }

      case 7:
        switch (c) {
          case 9:
          case 10:
          case 12:
          case 13:
          case 32:
            continue;
          case 61:
            charsetState = 8;
            continue;
          default:return null;
        }

      case 8:
        switch (c) {
          case 9:
          case 10:
          case 12:
          case 13:
          case 32:
            continue;
          case 39:
            start = i + 1;
            charsetState = 9;
            continue;
          case 34:
            start = i + 1;
            charsetState = 10;
            continue;
          default:start = i;
            charsetState = 11;
            continue;
        }

      case 9:
        switch (c) {
          case 39:
            end = i;
            break charsetloop;
          default:continue;
        }

      case 10:
        switch (c) {
          case 34:
            end = i;
            break charsetloop;
          default:continue;
        }

      case 11:
        switch (c) {
          case 9:
          case 10:
          case 12:
          case 13:
          case 32:
          case 59:
            end = i;
            break charsetloop;
          default:continue;
        }

    }
  }
  charset = null;
  if (start != -1) {
    end == -1 && (end = buffer.length);
    charset = valueOf_0(buffer, start, end - start);
  }
  return charset;
}

function getClass_60(){
  return Lnu_validator_htmlparser_impl_TreeBuilder_2_classLit;
}

function TreeBuilder(){
}

_ = TreeBuilder.prototype = new Object_0;
_.getClass$ = getClass_60;
_.typeId$ = 0;
_.charBuffer = null;
_.charBufferLen = 0;
_.contextName = null;
_.contextNamespace = null;
_.currentPtr = -1;
_.formPointer = null;
_.fragment = false;
_.framesetOk = true;
_.headPointer = null;
_.html4 = false;
_.inForeign = false;
_.listOfActiveFormattingElements = null;
_.listPtr = -1;
_.mode = 0;
_.needToDropLF = false;
_.originalMode = 0;
_.quirks = false;
_.stack_0 = null;
_.tokenizer = null;
_.wantingComments = false;
var HTML4_PUBLIC_IDS, QUIRKY_PUBLIC_IDS, REPLACEMENT_CHARACTER;
function $clinit_117(){
  $clinit_117 = nullMethod;
  $clinit_116();
}

function $accumulateCharacters(this$static, buf, start, length_0){
  var newBuf, newLen;
  newLen = this$static.charBufferLen + length_0;
  if (newLen > this$static.charBuffer.length) {
    newBuf = initDim(_3C_classLit, 47, -1, newLen, 1);
    arraycopy(this$static.charBuffer, 0, newBuf, 0, this$static.charBufferLen);
    this$static.charBuffer = newBuf;
  }
  arraycopy(buf, start, this$static.charBuffer, this$static.charBufferLen, length_0);
  this$static.charBufferLen = newLen;
}

function $insertFosterParentedCharacters(this$static, buf, start, length_0, table, stackParent){
  var end;
  $insertFosterParentedCharacters_0(this$static, (end = start + length_0 , __checkBounds(buf.length, start, end) , __valueOf(buf, start, end)), table, stackParent);
}

function getClass_61(){
  return Lnu_validator_htmlparser_impl_CoalescingTreeBuilder_2_classLit;
}

function CoalescingTreeBuilder(){
}

_ = CoalescingTreeBuilder.prototype = new TreeBuilder;
_.getClass$ = getClass_61;
_.typeId$ = 0;
function $clinit_118(){
  $clinit_118 = nullMethod;
  $clinit_117();
}

function $BrowserTreeBuilder(this$static, document_0){
  $clinit_118();
  this$static.doctypeExpectation = ($clinit_112() , HTML);
  this$static.namePolicy = ($clinit_115() , ALTER_INFOSET);
  this$static.idLocations = $HashMap(new HashMap);
  this$static.fragment = false;
  this$static.scriptStack = $LinkedList(new LinkedList);
  this$static.document_0 = document_0;
  installExplorerCreateElementNS(document_0);
  return this$static;
}

function $addAttributesToElement(this$static, element, attributes){
  var $e0, e, i, localName, uri;
  try {
    for (i = 0; i < attributes.length_0; ++i) {
      localName = $getLocalName(attributes, i);
      uri = $getURI(attributes, i);
      !element.hasAttributeNS(uri, localName) && (element.setAttributeNS(uri, localName, $getValue_0(attributes, i)) , undefined);
    }
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $appendCharacters(this$static, parent_0, text){
  var $e0, e;
  try {
    parent_0 == this$static.placeholder && (this$static.script.appendChild(this$static.document_0.createTextNode(text)) , undefined);
    parent_0.appendChild(this$static.document_0.createTextNode(text));
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $appendChildrenToNewParent(this$static, oldParent, newParent){
  var $e0, e;
  try {
    while (oldParent.hasChildNodes()) {
      newParent.appendChild(oldParent.firstChild);
    }
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $appendComment(this$static, parent_0, comment){
  var $e0, e;
  try {
    parent_0 == this$static.placeholder && (this$static.script.appendChild(this$static.document_0.createComment(comment)) , undefined);
    parent_0.appendChild(this$static.document_0.createComment(comment));
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $appendCommentToDocument(this$static, comment){
  var $e0, e;
  try {
    this$static.document_0.appendChild(this$static.document_0.createComment(comment));
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $appendElement(this$static, child, newParent){
  var $e0, e;
  try {
    newParent == this$static.placeholder && (this$static.script.appendChild(child.cloneNode(true)) , undefined);
    newParent.appendChild(child);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $createElement(this$static, ns, name_0, attributes){
  var $e0, e, i, rv;
  try {
    rv = this$static.document_0.createElementNS(ns, name_0);
    for (i = 0; i < attributes.length_0; ++i) {
      rv.setAttributeNS($getURI(attributes, i), $getLocalName(attributes, i), $getValue_0(attributes, i));
    }
    if ('script' == name_0) {
      !!this$static.placeholder && $addLast(this$static.scriptStack, $BrowserTreeBuilder$ScriptHolder(new BrowserTreeBuilder$ScriptHolder, this$static.script, this$static.placeholder));
      this$static.script = rv;
      this$static.placeholder = this$static.document_0.createElementNS('http://n.validator.nu/placeholder/', 'script');
      rv = this$static.placeholder;
      for (i = 0; i < attributes.length_0; ++i) {
        rv.setAttributeNS($getURI(attributes, i), $getLocalName(attributes, i), $getValue_0(attributes, i));
      }
    }
    return rv;
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
      throw $RuntimeException(new RuntimeException, 'Unreachable');
    }
     else 
      throw $e0;
  }
}

function $createElement_0(this$static, ns, name_0, attributes){
  var $e0, e, rv;
  try {
    rv = $createElement(this$static, ns, name_0, attributes);
    return rv;
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
      return null;
    }
     else 
      throw $e0;
  }
}

function $createHtmlElementSetAsRoot(this$static, attributes){
  var $e0, e, i, rv;
  try {
    rv = this$static.document_0.createElementNS('http://www.w3.org/1999/xhtml', 'html');
    for (i = 0; i < attributes.length_0; ++i) {
      rv.setAttributeNS($getURI(attributes, i), $getLocalName(attributes, i), $getValue_0(attributes, i));
    }
    this$static.document_0.appendChild(rv);
    return rv;
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
      throw $RuntimeException(new RuntimeException, 'Unreachable');
    }
     else 
      throw $e0;
  }
}

function $detachFromParent(this$static, element){
  var $e0, e, parent_0;
  try {
    parent_0 = element.parentNode;
    !!parent_0 && (parent_0.removeChild(element) , undefined);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $elementPopped(this$static, ns, name_0, node){
  if (node == this$static.placeholder) {
    this$static.readyToRun = true;
    this$static.tokenizer.shouldSuspend = true;
  }
  __elementPopped__(ns, name_0, node);
}

function $getDocument(this$static){
  var rv;
  rv = this$static.document_0;
  this$static.document_0 = null;
  return rv;
}

function $insertFosterParentedCharacters_0(this$static, text, table, stackParent){
  var $e0, child, e, parent_0;
  try {
    child = this$static.document_0.createTextNode(text);
    parent_0 = table.parentNode;
    !!parent_0 && parent_0.nodeType == 1?(parent_0.insertBefore(child, table) , undefined):(stackParent.appendChild(child) , undefined);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $insertFosterParentedChild(this$static, child, table, stackParent){
  var $e0, e, parent_0;
  parent_0 = table.parentNode;
  try {
    !!parent_0 && parent_0.nodeType == 1?(parent_0.insertBefore(child, table) , undefined):(stackParent.appendChild(child) , undefined);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 29)) {
      e = $e0;
      $fatal(this$static, e);
    }
     else 
      throw $e0;
  }
}

function $maybeRunScript(this$static){
  var scriptHolder;
  if (this$static.readyToRun) {
    this$static.readyToRun = false;
    replace_0(this$static.placeholder, this$static.script);
    if (this$static.scriptStack.size == 0) {
      this$static.script = null;
      this$static.placeholder = null;
    }
     else {
      scriptHolder = dynamicCast($removeLast(this$static.scriptStack), 30);
      this$static.script = scriptHolder.script;
      this$static.placeholder = scriptHolder.placeholder;
    }
  }
}

function getClass_62(){
  return Lnu_validator_htmlparser_gwt_BrowserTreeBuilder_2_classLit;
}

function installExplorerCreateElementNS(doc){
  !doc.createElementNS && (doc.createElementNS = function(uri, local){
    if ('http://www.w3.org/1999/xhtml' == uri) {
      return doc.createElement(local);
    }
     else if ('http://www.w3.org/1998/Math/MathML' == uri) {
      if (!doc.mathplayerinitialized) {
        var obj = document.createElement('object');
        obj.setAttribute('id', 'mathplayer');
        obj.setAttribute('classid', 'clsid:32F66A20-7614-11D4-BD11-00104BD3F987');
        document.getElementsByTagName('head')[0].appendChild(obj);
        document.namespaces.add('m', 'http://www.w3.org/1998/Math/MathML', '#mathplayer');
        doc.mathplayerinitialized = true;
      }
      return doc.createElement('m:' + local);
    }
     else if ('http://www.w3.org/2000/svg' == uri) {
      if (!doc.renesisinitialized) {
        var obj = document.createElement('object');
        obj.setAttribute('id', 'renesis');
        obj.setAttribute('classid', 'clsid:AC159093-1683-4BA2-9DCF-0C350141D7F2');
        document.getElementsByTagName('head')[0].appendChild(obj);
        document.namespaces.add('s', 'http://www.w3.org/2000/svg', '#renesis');
        doc.renesisinitialized = true;
      }
      return doc.createElement('s:' + local);
    }
  }
  );
}

function replace_0(oldNode, newNode){
  oldNode.parentNode.replaceChild(newNode, oldNode);
  __elementPopped__('', newNode.nodeName, newNode);
}

function BrowserTreeBuilder(){
}

_ = BrowserTreeBuilder.prototype = new CoalescingTreeBuilder;
_.getClass$ = getClass_62;
_.typeId$ = 0;
_.document_0 = null;
_.placeholder = null;
_.readyToRun = false;
_.script = null;
function $BrowserTreeBuilder$ScriptHolder(this$static, script, placeholder){
  this$static.script = script;
  this$static.placeholder = placeholder;
  return this$static;
}

function getClass_63(){
  return Lnu_validator_htmlparser_gwt_BrowserTreeBuilder$ScriptHolder_2_classLit;
}

function BrowserTreeBuilder$ScriptHolder(){
}

_ = BrowserTreeBuilder$ScriptHolder.prototype = new Object_0;
_.getClass$ = getClass_63;
_.typeId$ = 37;
_.placeholder = null;
_.script = null;
function $HtmlParser(this$static, document_0){
  this$static.documentWriteBuffer = $StringBuilder(new StringBuilder);
  this$static.bufferStack = $LinkedList(new LinkedList);
  this$static.domTreeBuilder = $BrowserTreeBuilder(new BrowserTreeBuilder, document_0);
  this$static.tokenizer = $ErrorReportingTokenizer(new ErrorReportingTokenizer, this$static.domTreeBuilder);
  this$static.domTreeBuilder.namePolicy = ($clinit_115() , ALTER_INFOSET);
  this$static.tokenizer.commentPolicy = ALTER_INFOSET;
  this$static.tokenizer.contentNonXmlCharPolicy = ALTER_INFOSET;
  this$static.tokenizer.contentSpacePolicy = ALTER_INFOSET;
  this$static.tokenizer.namePolicy = ALTER_INFOSET;
  $setXmlnsPolicy(this$static.tokenizer, ALTER_INFOSET);
  return this$static;
}

function $parse(this$static, source, useSetTimeouts, callback){
  this$static.parseEndListener = callback;
  $setFragmentContext(this$static.domTreeBuilder, null);
  this$static.lastWasCR = false;
  this$static.ending = false;
  $setLength(this$static.documentWriteBuffer, 0);
  this$static.streamLength = source.length;
  this$static.stream = $UTF16Buffer(new UTF16Buffer, $toCharArray(source), 0, this$static.streamLength < 512?this$static.streamLength:512);
  $clear(this$static.bufferStack);
  $addLast(this$static.bufferStack, this$static.stream);
  $setFragmentContext(this$static.domTreeBuilder, null);
  $start_0(this$static.tokenizer);
  $pump(this$static, useSetTimeouts);
}

function $pump(this$static, useSetTimeouts){
  var $e0, timer;
  if ($pumpcore(this$static)) {
    return;
  }
  if (useSetTimeouts) {
    timer = $HtmlParser$1(new HtmlParser$1, this$static);
    $schedule(timer, 1);
  }
   else {
    try {
      while (!$pumpcore(this$static)) {
      }
    }
     catch ($e0) {
      $e0 = caught($e0);
      if (instanceOf($e0, 31)) {
        this$static.ending = true;
      }
       else 
        throw $e0;
    }
  }
}

function $pumpcore(this$static){
  var buffer, docWriteLen, newBuf, newEnd;
  if (this$static.ending) {
    $end(this$static.tokenizer);
    $getDocument(this$static.domTreeBuilder);
    this$static.parseEndListener.callback();
    return true;
  }
  docWriteLen = this$static.documentWriteBuffer.impl.string.length;
  if (docWriteLen > 0) {
    newBuf = initDim(_3C_classLit, 47, -1, docWriteLen, 1);
    $getChars_0(this$static.documentWriteBuffer, 0, docWriteLen, newBuf, 0);
    $addLast(this$static.bufferStack, $UTF16Buffer(new UTF16Buffer, newBuf, 0, docWriteLen));
    $setLength(this$static.documentWriteBuffer, 0);
  }
  for (;;) {
    buffer = dynamicCast($getLast(this$static.bufferStack), 32);
    if (buffer.start >= buffer.end) {
      if (buffer == this$static.stream) {
        if (buffer.end == this$static.streamLength) {
          $eof_0(this$static.tokenizer);
          this$static.ending = true;
          break;
        }
         else {
          newEnd = buffer.start + 512;
          buffer.end = newEnd < this$static.streamLength?newEnd:this$static.streamLength;
          continue;
        }
      }
       else {
        $removeLast(this$static.bufferStack);
        continue;
      }
    }
    $adjust(buffer, this$static.lastWasCR);
    this$static.lastWasCR = false;
    if (buffer.start < buffer.end) {
      this$static.lastWasCR = $tokenizeBuffer(this$static.tokenizer, buffer);
      $maybeRunScript(this$static.domTreeBuilder);
      break;
    }
     else {
      continue;
    }
  }
  return false;
}

function documentWrite(text){
  var buffer;
  buffer = $UTF16Buffer(new UTF16Buffer, $toCharArray(text), 0, text.length);
  while (buffer.start < buffer.end) {
    $adjust(buffer, this.lastWasCR);
    this.lastWasCR = false;
    if (buffer.start < buffer.end) {
      this.lastWasCR = $tokenizeBuffer(this.tokenizer, buffer);
      $maybeRunScript(this.domTreeBuilder);
    }
  }
}

function getClass_64(){
  return Lnu_validator_htmlparser_gwt_HtmlParser_2_classLit;
}

function HtmlParser(){
}

_ = HtmlParser.prototype = new Object_0;
_.documentWrite = documentWrite;
_.getClass$ = getClass_64;
_.typeId$ = 0;
_.domTreeBuilder = null;
_.ending = false;
_.lastWasCR = false;
_.parseEndListener = null;
_.stream = null;
_.streamLength = 0;
_.tokenizer = null;
function $clinit_121(){
  $clinit_121 = nullMethod;
  $clinit_47();
}

function $HtmlParser$1(this$static, this$0){
  $clinit_121();
  this$static.this$0 = this$0;
  return this$static;
}

function $run(this$static){
  var $e0;
  try {
    $pump(this$static.this$0, true);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, 31)) {
      this$static.this$0.ending = true;
    }
     else 
      throw $e0;
  }
}

function getClass_65(){
  return Lnu_validator_htmlparser_gwt_HtmlParser$1_2_classLit;
}

function HtmlParser$1(){
}

_ = HtmlParser$1.prototype = new Timer;
_.getClass$ = getClass_65;
_.typeId$ = 38;
_.this$0 = null;
function installDocWrite(doc, parser){
  doc.write = function(){
    if (arguments.length == 0) {
      return;
    }
    var text = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      text += arguments[i];
    }
    parser.documentWrite(text);
  }
  ;
  doc.writeln = function(){
    if (arguments.length == 0) {
      parser.documentWrite('\n');
      return;
    }
    var text = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
      text += arguments[i];
    }
    text += '\n';
    parser.documentWrite(text);
  }
  ;
}

function parseHtmlDocument(source, document_0, useSetTimeouts, readyCallback, errorHandler){
  var parser;
  !readyCallback && (readyCallback = createFunction());
  zapChildren(document_0);
  parser = $HtmlParser(new HtmlParser, document_0);
  installDocWrite(document_0, parser);
  $parse(parser, source, useSetTimeouts, $ParseEndListener(new ParseEndListener, readyCallback));
}

function zapChildren(node){
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
}

function $ParseEndListener(this$static, callback){
  this$static.callback = callback;
  return this$static;
}

function getClass_66(){
  return Lnu_validator_htmlparser_gwt_ParseEndListener_2_classLit;
}

function ParseEndListener(){
}

_ = ParseEndListener.prototype = new Object_0;
_.getClass$ = getClass_66;
_.typeId$ = 0;
_.callback = null;
function $clinit_124(){
  var arr_471;
  $clinit_124 = nullMethod;
  ALL_NO_NS = initValues(_3Ljava_lang_String_2_classLit, 56, 1, ['', '', '', '']);
  XMLNS_NS = initValues(_3Ljava_lang_String_2_classLit, 56, 1, ['', 'http://www.w3.org/2000/xmlns/', 'http://www.w3.org/2000/xmlns/', '']);
  XML_NS = initValues(_3Ljava_lang_String_2_classLit, 56, 1, ['', 'http://www.w3.org/XML/1998/namespace', 'http://www.w3.org/XML/1998/namespace', '']);
  XLINK_NS = initValues(_3Ljava_lang_String_2_classLit, 56, 1, ['', 'http://www.w3.org/1999/xlink', 'http://www.w3.org/1999/xlink', '']);
  LANG_NS = initValues(_3Ljava_lang_String_2_classLit, 56, 1, ['', '', '', 'http://www.w3.org/XML/1998/namespace']);
  ALL_NO_PREFIX = initValues(_3Ljava_lang_String_2_classLit, 56, 1, [null, null, null, null]);
  XMLNS_PREFIX = initValues(_3Ljava_lang_String_2_classLit, 56, 1, [null, 'xmlns', 'xmlns', null]);
  XLINK_PREFIX = initValues(_3Ljava_lang_String_2_classLit, 56, 1, [null, 'xlink', 'xlink', null]);
  XML_PREFIX = initValues(_3Ljava_lang_String_2_classLit, 56, 1, [null, 'xml', 'xml', null]);
  LANG_PREFIX = initValues(_3Ljava_lang_String_2_classLit, 56, 1, [null, null, null, 'xml']);
  ALL_NCNAME = initValues(_3Z_classLit, 45, -1, [true, true, true, true]);
  ALL_NO_NCNAME = initValues(_3Z_classLit, 45, -1, [false, false, false, false]);
  D = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('d'), ALL_NO_PREFIX, ALL_NCNAME, false);
  K = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('k'), ALL_NO_PREFIX, ALL_NCNAME, false);
  R = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('r'), ALL_NO_PREFIX, ALL_NCNAME, false);
  X = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('x'), ALL_NO_PREFIX, ALL_NCNAME, false);
  Y = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('y'), ALL_NO_PREFIX, ALL_NCNAME, false);
  Z = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('z'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('by'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cx'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cy'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('dx'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('dy'), ALL_NO_PREFIX, ALL_NCNAME, false);
  G2 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('g2'), ALL_NO_PREFIX, ALL_NCNAME, false);
  G1 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('g1'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fx'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fy'), ALL_NO_PREFIX, ALL_NCNAME, false);
  K4 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('k4'), ALL_NO_PREFIX, ALL_NCNAME, false);
  K2 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('k2'), ALL_NO_PREFIX, ALL_NCNAME, false);
  K3 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('k3'), ALL_NO_PREFIX, ALL_NCNAME, false);
  K1 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('k1'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ID = $AttributeName(new AttributeName, ALL_NO_NS, SAME_LOCAL('id'), ALL_NO_PREFIX, ALL_NCNAME, false);
  IN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('in'), ALL_NO_PREFIX, ALL_NCNAME, false);
  U2 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('u2'), ALL_NO_PREFIX, ALL_NCNAME, false);
  U1 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('u1'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rt'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rx'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ry'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TO = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('to'), ALL_NO_PREFIX, ALL_NCNAME, false);
  Y2 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('y2'), ALL_NO_PREFIX, ALL_NCNAME, false);
  Y1 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('y1'), ALL_NO_PREFIX, ALL_NCNAME, false);
  X1 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('x1'), ALL_NO_PREFIX, ALL_NCNAME, false);
  X2 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('x2'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('alt'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DIR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('dir'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DUR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('dur'), ALL_NO_PREFIX, ALL_NCNAME, false);
  END = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('end'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('for'), ALL_NO_PREFIX, ALL_NCNAME, false);
  IN2 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('in2'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MAX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('max'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('min'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LOW = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('low'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rel'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REV = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rev'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SRC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('src'), ALL_NO_PREFIX, ALL_NCNAME, false);
  AXIS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('axis'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ABBR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('abbr'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BBOX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('bbox'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CITE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cite'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CODE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('code'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BIAS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('bias'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cols'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLIP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('clip'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CHAR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('char'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BASE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('base'), ALL_NO_PREFIX, ALL_NCNAME, false);
  EDGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('edge'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DATA = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('data'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FILL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fill'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FROM = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('from'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FORM = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('form'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('face'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HIGH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('high'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HREF = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('href'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OPEN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('open'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ICON = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('icon'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NAME = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('name'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MODE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mode'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MASK = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mask'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LINK = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('link'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LANG = $AttributeName_0(new AttributeName, LANG_NS, SAME_LOCAL('lang'), LANG_PREFIX, ALL_NCNAME, false);
  LIST = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('list'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TYPE_1 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('type'), ALL_NO_PREFIX, ALL_NCNAME, false);
  WHEN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('when'), ALL_NO_PREFIX, ALL_NCNAME, false);
  WRAP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('wrap'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TEXT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('text'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PATH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('path'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ping'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REFX = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('refx', 'refX'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REFY = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('refy', 'refY'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('size'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SEED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('seed'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ROWS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rows'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SPAN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('span'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STEP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('step'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ROLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('role'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XREF = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('xref'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ASYNC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('async'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALINK = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('alink'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALIGN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('align'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLOSE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('close'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('color'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLASS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('class'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLEAR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('clear'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BEGIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('begin'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DEPTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('depth'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DEFER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('defer'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FENCE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fence'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FRAME = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('frame'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ISMAP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ismap'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONEND = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onend'), ALL_NO_PREFIX, ALL_NCNAME, false);
  INDEX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('index'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ORDER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('order'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OTHER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('other'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONCUT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('oncut'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NARGS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('nargs'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MEDIA = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('media'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LABEL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('label'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LOCAL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('local'), ALL_NO_PREFIX, ALL_NCNAME, false);
  WIDTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('width'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TITLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('title'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VLINK = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('vlink'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VALUE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('value'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SLOPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('slope'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SHAPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('shape'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCOPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scope'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCALE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scale'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SPEED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('speed'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STYLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('style'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RULES = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rules'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STEMH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stemh'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STEMV = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stemv'), ALL_NO_PREFIX, ALL_NCNAME, false);
  START = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('start'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XMLNS = $AttributeName_0(new AttributeName, XMLNS_NS, SAME_LOCAL('xmlns'), ALL_NO_PREFIX, initValues(_3Z_classLit, 45, -1, [false, false, false, false]), true);
  ACCEPT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('accept'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ACCENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('accent'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ASCENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ascent'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ACTIVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('active'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALTIMG = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('altimg'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ACTION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('action'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BORDER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('border'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CURSOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cursor'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COORDS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('coords'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FILTER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('filter'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FORMAT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('format'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HIDDEN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('hidden'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('hspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('height'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmove'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONLOAD = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onload'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDRAG = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondrag'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ORIGIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('origin'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONZOOM = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onzoom'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONHELP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onhelp'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONSTOP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onstop'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDROP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondrop'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBLUR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onblur'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OBJECT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('object'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OFFSET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('offset'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ORIENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('orient'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONCOPY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('oncopy'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NOWRAP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('nowrap'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NOHREF = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('nohref'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MACROS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('macros'), ALL_NO_PREFIX, ALL_NCNAME, false);
  METHOD = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('method'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LOWSRC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('lowsrc'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('lspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LQUOTE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('lquote'), ALL_NO_PREFIX, ALL_NCNAME, false);
  USEMAP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('usemap'), ALL_NO_PREFIX, ALL_NCNAME, false);
  WIDTHS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('widths'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TARGET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('target'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VALUES = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('values'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VALIGN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('valign'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('vspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  POSTER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('poster'), ALL_NO_PREFIX, ALL_NCNAME, false);
  POINTS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('points'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PROMPT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('prompt'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCOPED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scoped'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STRING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('string'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCHEME = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scheme'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RADIUS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('radius'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RESULT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('result'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPEAT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('repeat'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ROTATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rotate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RQUOTE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rquote'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALTTEXT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('alttext'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARCHIVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('archive'), ALL_NO_PREFIX, ALL_NCNAME, false);
  AZIMUTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('azimuth'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLOSURE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('closure'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CHECKED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('checked'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLASSID = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('classid'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CHAROFF = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('charoff'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BGCOLOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('bgcolor'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLSPAN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('colspan'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CHARSET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('charset'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COMPACT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('compact'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CONTENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('content'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ENCTYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('enctype'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DATASRC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('datasrc'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DATAFLD = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('datafld'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DECLARE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('declare'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DISPLAY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('display'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DIVISOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('divisor'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DEFAULT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('default'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DESCENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('descent'), ALL_NO_PREFIX, ALL_NCNAME, false);
  KERNING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('kerning'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HANGING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('hanging'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HEADERS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('headers'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONPASTE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onpaste'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONCLICK = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onclick'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OPTIMUM = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('optimum'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEGIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbegin'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONKEYUP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onkeyup'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONFOCUS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onfocus'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONERROR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onerror'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONINPUT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('oninput'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONABORT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onabort'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONSTART = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onstart'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONRESET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onreset'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OPACITY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('opacity'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NOSHADE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('noshade'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MINSIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('minsize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MAXSIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('maxsize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LOOPEND = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('loopend'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LARGEOP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('largeop'), ALL_NO_PREFIX, ALL_NCNAME, false);
  UNICODE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('unicode'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TARGETX = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('targetx', 'targetX'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TARGETY = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('targety', 'targetY'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VIEWBOX = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('viewbox', 'viewBox'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERSION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('version'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PATTERN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('pattern'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PROFILE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('profile'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SPACING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('spacing'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RESTART = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('restart'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ROWSPAN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rowspan'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SANDBOX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('sandbox'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SUMMARY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('summary'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STANDBY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('standby'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPLACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('replace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  AUTOPLAY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('autoplay'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ADDITIVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('additive'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CALCMODE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('calcmode', 'calcMode'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CODETYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('codetype'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CODEBASE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('codebase'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CONTROLS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('controls'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BEVELLED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('bevelled'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BASELINE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('baseline'), ALL_NO_PREFIX, ALL_NCNAME, false);
  EXPONENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('exponent'), ALL_NO_PREFIX, ALL_NCNAME, false);
  EDGEMODE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('edgemode', 'edgeMode'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ENCODING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('encoding'), ALL_NO_PREFIX, ALL_NCNAME, false);
  GLYPHREF = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('glyphref', 'glyphRef'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DATETIME = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('datetime'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DISABLED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('disabled'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONTSIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fontsize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  KEYTIMES = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('keytimes', 'keyTimes'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PANOSE_1 = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('panose-1'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HREFLANG = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('hreflang'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONRESIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onresize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONCHANGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onchange'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBOUNCE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbounce'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONUNLOAD = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onunload'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONFINISH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onfinish'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONSCROLL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onscroll'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OPERATOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('operator'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OVERFLOW = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('overflow'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONSUBMIT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onsubmit'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONREPEAT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onrepeat'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONSELECT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onselect'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NOTATION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('notation'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NORESIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('noresize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MANIFEST = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('manifest'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MATHSIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mathsize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MULTIPLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('multiple'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LONGDESC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('longdesc'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LANGUAGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('language'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TEMPLATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('template'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TABINDEX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('tabindex'), ALL_NO_PREFIX, ALL_NCNAME, false);
  READONLY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('readonly'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SELECTED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('selected'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ROWLINES = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rowlines'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SEAMLESS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('seamless'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ROWALIGN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rowalign'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STRETCHY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stretchy'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REQUIRED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('required'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XML_BASE = $AttributeName_0(new AttributeName, XML_NS, COLONIFIED_LOCAL('xml:base', 'base'), XML_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  XML_LANG = $AttributeName_0(new AttributeName, XML_NS, COLONIFIED_LOCAL('xml:lang', 'lang'), XML_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  X_HEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('x-height'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_OWNS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-owns'), ALL_NO_PREFIX, ALL_NCNAME, false);
  AUTOFOCUS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('autofocus'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_SORT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-sort'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ACCESSKEY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('accesskey'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_BUSY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-busy'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_GRAB = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-grab'), ALL_NO_PREFIX, ALL_NCNAME, false);
  AMPLITUDE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('amplitude'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_LIVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-live'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLIP_RULE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('clip-rule'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLIP_PATH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('clip-path'), ALL_NO_PREFIX, ALL_NCNAME, false);
  EQUALROWS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('equalrows'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ELEVATION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('elevation'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DIRECTION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('direction'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DRAGGABLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('draggable'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FILTERRES = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('filterres', 'filterRes'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FILL_RULE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fill-rule'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONTSTYLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fontstyle'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONT_SIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('font-size'), ALL_NO_PREFIX, ALL_NCNAME, false);
  KEYPOINTS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('keypoints', 'keyPoints'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HIDEFOCUS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('hidefocus'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMESSAGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmessage'), ALL_NO_PREFIX, ALL_NCNAME, false);
  INTERCEPT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('intercept'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDRAGEND = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondragend'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOVEEND = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmoveend'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONINVALID = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('oninvalid'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONKEYDOWN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onkeydown'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONFOCUSIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onfocusin'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSEUP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmouseup'), ALL_NO_PREFIX, ALL_NCNAME, false);
  INPUTMODE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('inputmode'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONROWEXIT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onrowexit'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MATHCOLOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mathcolor'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MASKUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('maskunits', 'maskUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MAXLENGTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('maxlength'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LINEBREAK = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('linebreak'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LOOPSTART = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('loopstart'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TRANSFORM = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('transform'), ALL_NO_PREFIX, ALL_NCNAME, false);
  V_HANGING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('v-hanging'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VALUETYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('valuetype'), ALL_NO_PREFIX, ALL_NCNAME, false);
  POINTSATZ = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('pointsatz', 'pointsAtZ'), ALL_NO_PREFIX, ALL_NCNAME, false);
  POINTSATX = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('pointsatx', 'pointsAtX'), ALL_NO_PREFIX, ALL_NCNAME, false);
  POINTSATY = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('pointsaty', 'pointsAtY'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PLAYCOUNT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('playcount'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SYMMETRIC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('symmetric'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCROLLING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scrolling'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPEATDUR = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('repeatdur', 'repeatDur'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SELECTION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('selection'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SEPARATOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('separator'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XML_SPACE = $AttributeName_0(new AttributeName, XML_NS, COLONIFIED_LOCAL('xml:space', 'space'), XML_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  AUTOSUBMIT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('autosubmit'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALPHABETIC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('alphabetic'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ACTIONTYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('actiontype'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ACCUMULATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('accumulate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_LEVEL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-level'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLUMNSPAN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('columnspan'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CAP_HEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cap-height'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BACKGROUND = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('background'), ALL_NO_PREFIX, ALL_NCNAME, false);
  GLYPH_NAME = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('glyph-name'), ALL_NO_PREFIX, ALL_NCNAME, false);
  GROUPALIGN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('groupalign'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONTFAMILY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fontfamily'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONTWEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fontweight'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONT_STYLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('font-style'), ALL_NO_PREFIX, ALL_NCNAME, false);
  KEYSPLINES = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('keysplines', 'keySplines'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HTTP_EQUIV = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('http-equiv'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONACTIVATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onactivate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OCCURRENCE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('occurrence'), ALL_NO_PREFIX, ALL_NCNAME, false);
  IRRELEVANT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('irrelevant'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDBLCLICK = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondblclick'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDRAGDROP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondragdrop'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONKEYPRESS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onkeypress'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONROWENTER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onrowenter'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDRAGOVER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondragover'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONFOCUSOUT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onfocusout'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSEOUT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmouseout'), ALL_NO_PREFIX, ALL_NCNAME, false);
  NUMOCTAVES = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('numoctaves', 'numOctaves'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARKER_MID = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('marker-mid'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARKER_END = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('marker-end'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TEXTLENGTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('textlength', 'textLength'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VISIBILITY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('visibility'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VIEWTARGET = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('viewtarget', 'viewTarget'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERT_ADV_Y = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('vert-adv-y'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PATHLENGTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('pathlength', 'pathLength'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPEAT_MAX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('repeat-max'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RADIOGROUP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('radiogroup'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STOP_COLOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stop-color'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SEPARATORS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('separators'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPEAT_MIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('repeat-min'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ROWSPACING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rowspacing'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ZOOMANDPAN = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('zoomandpan', 'zoomAndPan'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XLINK_TYPE = $AttributeName_0(new AttributeName, XLINK_NS, COLONIFIED_LOCAL('xlink:type', 'type'), XLINK_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  XLINK_ROLE = $AttributeName_0(new AttributeName, XLINK_NS, COLONIFIED_LOCAL('xlink:role', 'role'), XLINK_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  XLINK_HREF = $AttributeName_0(new AttributeName, XLINK_NS, COLONIFIED_LOCAL('xlink:href', 'href'), XLINK_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  XLINK_SHOW = $AttributeName_0(new AttributeName, XLINK_NS, COLONIFIED_LOCAL('xlink:show', 'show'), XLINK_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  ACCENTUNDER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('accentunder'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_SECRET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-secret'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_ATOMIC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-atomic'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_HIDDEN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-hidden'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_FLOWTO = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-flowto'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARABIC_FORM = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('arabic-form'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CELLPADDING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cellpadding'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CELLSPACING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('cellspacing'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLUMNWIDTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('columnwidth'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLUMNALIGN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('columnalign'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLUMNLINES = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('columnlines'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CONTEXTMENU = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('contextmenu'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BASEPROFILE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('baseprofile', 'baseProfile'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONT_FAMILY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('font-family'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FRAMEBORDER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('frameborder'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FILTERUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('filterunits', 'filterUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FLOOD_COLOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('flood-color'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONT_WEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('font-weight'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HORIZ_ADV_X = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('horiz-adv-x'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDRAGLEAVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondragleave'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSEMOVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmousemove'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ORIENTATION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('orientation'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSEDOWN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmousedown'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSEOVER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmouseover'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDRAGENTER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondragenter'), ALL_NO_PREFIX, ALL_NCNAME, false);
  IDEOGRAPHIC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ideographic'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFORECUT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforecut'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONFORMINPUT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onforminput'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDRAGSTART = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondragstart'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOVESTART = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmovestart'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARKERUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('markerunits', 'markerUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MATHVARIANT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mathvariant'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARGINWIDTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('marginwidth'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARKERWIDTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('markerwidth', 'markerWidth'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TEXT_ANCHOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('text-anchor'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TABLEVALUES = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('tablevalues', 'tableValues'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCRIPTLEVEL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scriptlevel'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPEATCOUNT = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('repeatcount', 'repeatCount'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STITCHTILES = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('stitchtiles', 'stitchTiles'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STARTOFFSET = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('startoffset', 'startOffset'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCROLLDELAY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scrolldelay'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XMLNS_XLINK = $AttributeName_0(new AttributeName, XMLNS_NS, COLONIFIED_LOCAL('xmlns:xlink', 'xlink'), XMLNS_PREFIX, initValues(_3Z_classLit, 45, -1, [false, false, false, false]), true);
  XLINK_TITLE = $AttributeName_0(new AttributeName, XLINK_NS, COLONIFIED_LOCAL('xlink:title', 'title'), XLINK_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  ARIA_INVALID = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-invalid'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_PRESSED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-pressed'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_CHECKED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-checked'), ALL_NO_PREFIX, ALL_NCNAME, false);
  AUTOCOMPLETE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('autocomplete'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_SETSIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-setsize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_CHANNEL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-channel'), ALL_NO_PREFIX, ALL_NCNAME, false);
  EQUALCOLUMNS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('equalcolumns'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DISPLAYSTYLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('displaystyle'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DATAFORMATAS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('dataformatas'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FILL_OPACITY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('fill-opacity'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONT_VARIANT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('font-variant'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONT_STRETCH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('font-stretch'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FRAMESPACING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('framespacing'), ALL_NO_PREFIX, ALL_NCNAME, false);
  KERNELMATRIX = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('kernelmatrix', 'kernelMatrix'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDEACTIVATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondeactivate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONROWSDELETE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onrowsdelete'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSELEAVE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmouseleave'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONFORMCHANGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onformchange'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONCELLCHANGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('oncellchange'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSEWHEEL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmousewheel'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONMOUSEENTER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onmouseenter'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONAFTERPRINT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onafterprint'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFORECOPY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforecopy'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARGINHEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('marginheight'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARKERHEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('markerheight', 'markerHeight'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MARKER_START = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('marker-start'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MATHEMATICAL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mathematical'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LENGTHADJUST = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('lengthadjust', 'lengthAdjust'), ALL_NO_PREFIX, ALL_NCNAME, false);
  UNSELECTABLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('unselectable'), ALL_NO_PREFIX, ALL_NCNAME, false);
  UNICODE_BIDI = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('unicode-bidi'), ALL_NO_PREFIX, ALL_NCNAME, false);
  UNITS_PER_EM = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('units-per-em'), ALL_NO_PREFIX, ALL_NCNAME, false);
  WORD_SPACING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('word-spacing'), ALL_NO_PREFIX, ALL_NCNAME, false);
  WRITING_MODE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('writing-mode'), ALL_NO_PREFIX, ALL_NCNAME, false);
  V_ALPHABETIC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('v-alphabetic'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PATTERNUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('patternunits', 'patternUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SPREADMETHOD = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('spreadmethod', 'spreadMethod'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SURFACESCALE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('surfacescale', 'surfaceScale'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE_WIDTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke-width'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPEAT_START = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('repeat-start'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STDDEVIATION = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('stddeviation', 'stdDeviation'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STOP_OPACITY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stop-opacity'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_CONTROLS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-controls'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_HASPOPUP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-haspopup'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ACCENT_HEIGHT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('accent-height'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_VALUENOW = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-valuenow'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_RELEVANT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-relevant'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_POSINSET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-posinset'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_VALUEMAX = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-valuemax'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_READONLY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-readonly'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_SELECTED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-selected'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_REQUIRED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-required'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_EXPANDED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-expanded'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_DISABLED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-disabled'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ATTRIBUTETYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('attributetype', 'attributeType'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ATTRIBUTENAME = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('attributename', 'attributeName'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_DATATYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-datatype'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_VALUEMIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-valuemin'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BASEFREQUENCY = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('basefrequency', 'baseFrequency'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLUMNSPACING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('columnspacing'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLOR_PROFILE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('color-profile'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CLIPPATHUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('clippathunits', 'clipPathUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DEFINITIONURL = $AttributeName_0(new AttributeName, ALL_NO_NS, (arr_471 = initDim(_3Ljava_lang_String_2_classLit, 56, 1, 4, 0) , arr_471[0] = 'definitionurl' , arr_471[1] = 'definitionURL' , arr_471[2] = 'definitionurl' , arr_471[3] = 'definitionurl' , arr_471), ALL_NO_PREFIX, ALL_NCNAME, false);
  GRADIENTUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('gradientunits', 'gradientUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FLOOD_OPACITY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('flood-opacity'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONAFTERUPDATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onafterupdate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONERRORUPDATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onerrorupdate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFOREPASTE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforepaste'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONLOSECAPTURE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onlosecapture'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONCONTEXTMENU = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('oncontextmenu'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONSELECTSTART = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onselectstart'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFOREPRINT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforeprint'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MOVABLELIMITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('movablelimits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LINETHICKNESS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('linethickness'), ALL_NO_PREFIX, ALL_NCNAME, false);
  UNICODE_RANGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('unicode-range'), ALL_NO_PREFIX, ALL_NCNAME, false);
  THINMATHSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('thinmathspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERT_ORIGIN_X = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('vert-origin-x'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERT_ORIGIN_Y = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('vert-origin-y'), ALL_NO_PREFIX, ALL_NCNAME, false);
  V_IDEOGRAPHIC = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('v-ideographic'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PRESERVEALPHA = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('preservealpha', 'preserveAlpha'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCRIPTMINSIZE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scriptminsize'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SPECIFICATION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('specification'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XLINK_ACTUATE = $AttributeName_0(new AttributeName, XLINK_NS, COLONIFIED_LOCAL('xlink:actuate', 'actuate'), XLINK_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  XLINK_ARCROLE = $AttributeName_0(new AttributeName, XLINK_NS, COLONIFIED_LOCAL('xlink:arcrole', 'arcrole'), XLINK_PREFIX, initValues(_3Z_classLit, 45, -1, [false, true, true, false]), false);
  ACCEPT_CHARSET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('accept-charset'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALIGNMENTSCOPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('alignmentscope'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_MULTILINE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-multiline'), ALL_NO_PREFIX, ALL_NCNAME, false);
  BASELINE_SHIFT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('baseline-shift'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HORIZ_ORIGIN_X = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('horiz-origin-x'), ALL_NO_PREFIX, ALL_NCNAME, false);
  HORIZ_ORIGIN_Y = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('horiz-origin-y'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFOREUPDATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforeupdate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONFILTERCHANGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onfilterchange'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONROWSINSERTED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onrowsinserted'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFOREUNLOAD = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforeunload'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MATHBACKGROUND = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mathbackground'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LETTER_SPACING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('letter-spacing'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LIGHTING_COLOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('lighting-color'), ALL_NO_PREFIX, ALL_NCNAME, false);
  THICKMATHSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('thickmathspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TEXT_RENDERING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('text-rendering'), ALL_NO_PREFIX, ALL_NCNAME, false);
  V_MATHEMATICAL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('v-mathematical'), ALL_NO_PREFIX, ALL_NCNAME, false);
  POINTER_EVENTS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('pointer-events'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PRIMITIVEUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('primitiveunits', 'primitiveUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SYSTEMLANGUAGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('systemlanguage', 'systemLanguage'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE_LINECAP = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke-linecap'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SUBSCRIPTSHIFT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('subscriptshift'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE_OPACITY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke-opacity'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_DROPEFFECT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-dropeffect'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_LABELLEDBY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-labelledby'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_TEMPLATEID = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-templateid'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLOR_RENDERING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('color-rendering'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CONTENTEDITABLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('contenteditable'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DIFFUSECONSTANT = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('diffuseconstant', 'diffuseConstant'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDATAAVAILABLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondataavailable'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONCONTROLSELECT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('oncontrolselect'), ALL_NO_PREFIX, ALL_NCNAME, false);
  IMAGE_RENDERING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('image-rendering'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MEDIUMMATHSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('mediummathspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  TEXT_DECORATION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('text-decoration'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SHAPE_RENDERING = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('shape-rendering'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE_LINEJOIN = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke-linejoin'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REPEAT_TEMPLATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('repeat-template'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_DESCRIBEDBY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-describedby'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CONTENTSTYLETYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('contentstyletype', 'contentStyleType'), ALL_NO_PREFIX, ALL_NCNAME, false);
  FONT_SIZE_ADJUST = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('font-size-adjust'), ALL_NO_PREFIX, ALL_NCNAME, false);
  KERNELUNITLENGTH = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('kernelunitlength', 'kernelUnitLength'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFOREACTIVATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforeactivate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONPROPERTYCHANGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onpropertychange'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDATASETCHANGED = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondatasetchanged'), ALL_NO_PREFIX, ALL_NCNAME, false);
  MASKCONTENTUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('maskcontentunits', 'maskContentUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PATTERNTRANSFORM = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('patterntransform', 'patternTransform'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REQUIREDFEATURES = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('requiredfeatures', 'requiredFeatures'), ALL_NO_PREFIX, ALL_NCNAME, false);
  RENDERING_INTENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('rendering-intent'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SPECULAREXPONENT = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('specularexponent', 'specularExponent'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SPECULARCONSTANT = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('specularconstant', 'specularConstant'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SUPERSCRIPTSHIFT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('superscriptshift'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE_DASHARRAY = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke-dasharray'), ALL_NO_PREFIX, ALL_NCNAME, false);
  XCHANNELSELECTOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('xchannelselector', 'xChannelSelector'), ALL_NO_PREFIX, ALL_NCNAME, false);
  YCHANNELSELECTOR = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('ychannelselector', 'yChannelSelector'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_AUTOCOMPLETE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-autocomplete'), ALL_NO_PREFIX, ALL_NCNAME, false);
  CONTENTSCRIPTTYPE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('contentscripttype', 'contentScriptType'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ENABLE_BACKGROUND = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('enable-background'), ALL_NO_PREFIX, ALL_NCNAME, false);
  DOMINANT_BASELINE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('dominant-baseline'), ALL_NO_PREFIX, ALL_NCNAME, false);
  GRADIENTTRANSFORM = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('gradienttransform', 'gradientTransform'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFORDEACTIVATE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbefordeactivate'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONDATASETCOMPLETE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('ondatasetcomplete'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OVERLINE_POSITION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('overline-position'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONBEFOREEDITFOCUS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onbeforeeditfocus'), ALL_NO_PREFIX, ALL_NCNAME, false);
  LIMITINGCONEANGLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('limitingconeangle', 'limitingConeAngle'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERYTHINMATHSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('verythinmathspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE_DASHOFFSET = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke-dashoffset'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STROKE_MITERLIMIT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('stroke-miterlimit'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ALIGNMENT_BASELINE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('alignment-baseline'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ONREADYSTATECHANGE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('onreadystatechange'), ALL_NO_PREFIX, ALL_NCNAME, false);
  OVERLINE_THICKNESS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('overline-thickness'), ALL_NO_PREFIX, ALL_NCNAME, false);
  UNDERLINE_POSITION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('underline-position'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERYTHICKMATHSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('verythickmathspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  REQUIREDEXTENSIONS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('requiredextensions', 'requiredExtensions'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLOR_INTERPOLATION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('color-interpolation'), ALL_NO_PREFIX, ALL_NCNAME, false);
  UNDERLINE_THICKNESS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('underline-thickness'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PRESERVEASPECTRATIO = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('preserveaspectratio', 'preserveAspectRatio'), ALL_NO_PREFIX, ALL_NCNAME, false);
  PATTERNCONTENTUNITS = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('patterncontentunits', 'patternContentUnits'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_MULTISELECTABLE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-multiselectable'), ALL_NO_PREFIX, ALL_NCNAME, false);
  SCRIPTSIZEMULTIPLIER = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('scriptsizemultiplier'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ARIA_ACTIVEDESCENDANT = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('aria-activedescendant'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERYVERYTHINMATHSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('veryverythinmathspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  VERYVERYTHICKMATHSPACE = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('veryverythickmathspace'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STRIKETHROUGH_POSITION = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('strikethrough-position'), ALL_NO_PREFIX, ALL_NCNAME, false);
  STRIKETHROUGH_THICKNESS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('strikethrough-thickness'), ALL_NO_PREFIX, ALL_NCNAME, false);
  EXTERNALRESOURCESREQUIRED = $AttributeName_0(new AttributeName, ALL_NO_NS, SVG_DIFFERENT('externalresourcesrequired', 'externalResourcesRequired'), ALL_NO_PREFIX, ALL_NCNAME, false);
  GLYPH_ORIENTATION_VERTICAL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('glyph-orientation-vertical'), ALL_NO_PREFIX, ALL_NCNAME, false);
  COLOR_INTERPOLATION_FILTERS = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('color-interpolation-filters'), ALL_NO_PREFIX, ALL_NCNAME, false);
  GLYPH_ORIENTATION_HORIZONTAL = $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL('glyph-orientation-horizontal'), ALL_NO_PREFIX, ALL_NCNAME, false);
  ATTRIBUTE_NAMES = initValues(_3Lnu_validator_htmlparser_impl_AttributeName_2_classLit, 60, 13, [D, K, R, X, Y, Z, BY, CX, CY, DX, DY, G2, G1, FX, FY, K4, K2, K3, K1, ID, IN, U2, U1, RT, RX, RY, TO, Y2, Y1, X1, X2, ALT, DIR, DUR, END, FOR, IN2, MAX, MIN, LOW, REL, REV, SRC, AXIS, ABBR, BBOX, CITE, CODE, BIAS, COLS, CLIP, CHAR, BASE, EDGE, DATA, FILL, FROM, FORM, FACE, HIGH, HREF, OPEN, ICON, NAME, MODE, MASK, LINK, LANG, LIST, TYPE_1, WHEN, WRAP, TEXT, PATH, PING, REFX, REFY, SIZE, SEED, ROWS, SPAN, STEP, ROLE, XREF, ASYNC, ALINK, ALIGN, CLOSE, COLOR, CLASS, CLEAR, BEGIN, DEPTH, DEFER, FENCE, FRAME, ISMAP, ONEND, INDEX, ORDER, OTHER, ONCUT, NARGS, MEDIA, LABEL, LOCAL, WIDTH, TITLE, VLINK, VALUE, SLOPE, SHAPE, SCOPE, SCALE, SPEED, STYLE, RULES, STEMH, STEMV, START, XMLNS, ACCEPT, ACCENT, ASCENT, ACTIVE, ALTIMG, ACTION, BORDER, CURSOR, COORDS, FILTER, FORMAT, HIDDEN, HSPACE, HEIGHT, ONMOVE, ONLOAD, ONDRAG, ORIGIN, ONZOOM, ONHELP, ONSTOP, ONDROP, ONBLUR, OBJECT, OFFSET, ORIENT, ONCOPY, NOWRAP, NOHREF, MACROS, METHOD, LOWSRC, LSPACE, LQUOTE, USEMAP, WIDTHS, TARGET, VALUES, VALIGN, VSPACE, POSTER, POINTS, PROMPT, SCOPED, STRING, SCHEME, STROKE, RADIUS, RESULT, REPEAT, RSPACE, ROTATE, RQUOTE, ALTTEXT, ARCHIVE, AZIMUTH, CLOSURE, CHECKED, CLASSID, CHAROFF, BGCOLOR, COLSPAN, CHARSET, COMPACT, CONTENT, ENCTYPE, DATASRC, DATAFLD, DECLARE, DISPLAY, DIVISOR, DEFAULT, DESCENT, KERNING, HANGING, HEADERS, ONPASTE, ONCLICK, OPTIMUM, ONBEGIN, ONKEYUP, ONFOCUS, ONERROR, ONINPUT, ONABORT, ONSTART, ONRESET, OPACITY, NOSHADE, MINSIZE, MAXSIZE, LOOPEND, LARGEOP, UNICODE, TARGETX, TARGETY, VIEWBOX, VERSION, PATTERN, PROFILE, SPACING, RESTART, ROWSPAN, SANDBOX, SUMMARY, STANDBY, REPLACE, AUTOPLAY, ADDITIVE, CALCMODE, CODETYPE, CODEBASE, CONTROLS, BEVELLED, BASELINE, EXPONENT, EDGEMODE, ENCODING, GLYPHREF, DATETIME, DISABLED, FONTSIZE, KEYTIMES, PANOSE_1, HREFLANG, ONRESIZE, ONCHANGE, ONBOUNCE, ONUNLOAD, ONFINISH, ONSCROLL, OPERATOR, OVERFLOW, ONSUBMIT, ONREPEAT, ONSELECT, NOTATION, NORESIZE, MANIFEST, MATHSIZE, MULTIPLE, LONGDESC, LANGUAGE, TEMPLATE, TABINDEX, READONLY, SELECTED, ROWLINES, SEAMLESS, ROWALIGN, STRETCHY, REQUIRED, XML_BASE, XML_LANG, X_HEIGHT, ARIA_OWNS, AUTOFOCUS, ARIA_SORT, ACCESSKEY, ARIA_BUSY, ARIA_GRAB, AMPLITUDE, ARIA_LIVE, CLIP_RULE, CLIP_PATH, EQUALROWS, ELEVATION, DIRECTION, DRAGGABLE, FILTERRES, FILL_RULE, FONTSTYLE, FONT_SIZE, KEYPOINTS, HIDEFOCUS, ONMESSAGE, INTERCEPT, ONDRAGEND, ONMOVEEND, ONINVALID, ONKEYDOWN, ONFOCUSIN, ONMOUSEUP, INPUTMODE, ONROWEXIT, MATHCOLOR, MASKUNITS, MAXLENGTH, LINEBREAK, LOOPSTART, TRANSFORM, V_HANGING, VALUETYPE, POINTSATZ, POINTSATX, POINTSATY, PLAYCOUNT, SYMMETRIC, SCROLLING, REPEATDUR, SELECTION, SEPARATOR, XML_SPACE, AUTOSUBMIT, ALPHABETIC, ACTIONTYPE, ACCUMULATE, ARIA_LEVEL, COLUMNSPAN, CAP_HEIGHT, BACKGROUND, GLYPH_NAME, GROUPALIGN, FONTFAMILY, FONTWEIGHT, FONT_STYLE, KEYSPLINES, HTTP_EQUIV, ONACTIVATE, OCCURRENCE, IRRELEVANT, ONDBLCLICK, ONDRAGDROP, ONKEYPRESS, ONROWENTER, ONDRAGOVER, ONFOCUSOUT, ONMOUSEOUT, NUMOCTAVES, MARKER_MID, MARKER_END, TEXTLENGTH, VISIBILITY, VIEWTARGET, VERT_ADV_Y, PATHLENGTH, REPEAT_MAX, RADIOGROUP, STOP_COLOR, SEPARATORS, REPEAT_MIN, ROWSPACING, ZOOMANDPAN, XLINK_TYPE, XLINK_ROLE, XLINK_HREF, XLINK_SHOW, ACCENTUNDER, ARIA_SECRET, ARIA_ATOMIC, ARIA_HIDDEN, ARIA_FLOWTO, ARABIC_FORM, CELLPADDING, CELLSPACING, COLUMNWIDTH, COLUMNALIGN, COLUMNLINES, CONTEXTMENU, BASEPROFILE, FONT_FAMILY, FRAMEBORDER, FILTERUNITS, FLOOD_COLOR, FONT_WEIGHT, HORIZ_ADV_X, ONDRAGLEAVE, ONMOUSEMOVE, ORIENTATION, ONMOUSEDOWN, ONMOUSEOVER, ONDRAGENTER, IDEOGRAPHIC, ONBEFORECUT, ONFORMINPUT, ONDRAGSTART, ONMOVESTART, MARKERUNITS, MATHVARIANT, MARGINWIDTH, MARKERWIDTH, TEXT_ANCHOR, TABLEVALUES, SCRIPTLEVEL, REPEATCOUNT, STITCHTILES, STARTOFFSET, SCROLLDELAY, XMLNS_XLINK, XLINK_TITLE, ARIA_INVALID, ARIA_PRESSED, ARIA_CHECKED, AUTOCOMPLETE, ARIA_SETSIZE, ARIA_CHANNEL, EQUALCOLUMNS, DISPLAYSTYLE, DATAFORMATAS, FILL_OPACITY, FONT_VARIANT, FONT_STRETCH, FRAMESPACING, KERNELMATRIX, ONDEACTIVATE, ONROWSDELETE, ONMOUSELEAVE, ONFORMCHANGE, ONCELLCHANGE, ONMOUSEWHEEL, ONMOUSEENTER, ONAFTERPRINT, ONBEFORECOPY, MARGINHEIGHT, MARKERHEIGHT, MARKER_START, MATHEMATICAL, LENGTHADJUST, UNSELECTABLE, UNICODE_BIDI, UNITS_PER_EM, WORD_SPACING, WRITING_MODE, V_ALPHABETIC, PATTERNUNITS, SPREADMETHOD, SURFACESCALE, STROKE_WIDTH, REPEAT_START, STDDEVIATION, STOP_OPACITY, ARIA_CONTROLS, ARIA_HASPOPUP, ACCENT_HEIGHT, ARIA_VALUENOW, ARIA_RELEVANT, ARIA_POSINSET, ARIA_VALUEMAX, ARIA_READONLY, ARIA_SELECTED, ARIA_REQUIRED, ARIA_EXPANDED, ARIA_DISABLED, ATTRIBUTETYPE, ATTRIBUTENAME, ARIA_DATATYPE, ARIA_VALUEMIN, BASEFREQUENCY, COLUMNSPACING, COLOR_PROFILE, CLIPPATHUNITS, DEFINITIONURL, GRADIENTUNITS, FLOOD_OPACITY, ONAFTERUPDATE, ONERRORUPDATE, ONBEFOREPASTE, ONLOSECAPTURE, ONCONTEXTMENU, ONSELECTSTART, ONBEFOREPRINT, MOVABLELIMITS, LINETHICKNESS, UNICODE_RANGE, THINMATHSPACE, VERT_ORIGIN_X, VERT_ORIGIN_Y, V_IDEOGRAPHIC, PRESERVEALPHA, SCRIPTMINSIZE, SPECIFICATION, XLINK_ACTUATE, XLINK_ARCROLE, ACCEPT_CHARSET, ALIGNMENTSCOPE, ARIA_MULTILINE, BASELINE_SHIFT, HORIZ_ORIGIN_X, HORIZ_ORIGIN_Y, ONBEFOREUPDATE, ONFILTERCHANGE, ONROWSINSERTED, ONBEFOREUNLOAD, MATHBACKGROUND, LETTER_SPACING, LIGHTING_COLOR, THICKMATHSPACE, TEXT_RENDERING, V_MATHEMATICAL, POINTER_EVENTS, PRIMITIVEUNITS, SYSTEMLANGUAGE, STROKE_LINECAP, SUBSCRIPTSHIFT, STROKE_OPACITY, ARIA_DROPEFFECT, ARIA_LABELLEDBY, ARIA_TEMPLATEID, COLOR_RENDERING, CONTENTEDITABLE, DIFFUSECONSTANT, ONDATAAVAILABLE, ONCONTROLSELECT, IMAGE_RENDERING, MEDIUMMATHSPACE, TEXT_DECORATION, SHAPE_RENDERING, STROKE_LINEJOIN, REPEAT_TEMPLATE, ARIA_DESCRIBEDBY, CONTENTSTYLETYPE, FONT_SIZE_ADJUST, KERNELUNITLENGTH, ONBEFOREACTIVATE, ONPROPERTYCHANGE, ONDATASETCHANGED, MASKCONTENTUNITS, PATTERNTRANSFORM, REQUIREDFEATURES, RENDERING_INTENT, SPECULAREXPONENT, SPECULARCONSTANT, SUPERSCRIPTSHIFT, STROKE_DASHARRAY, XCHANNELSELECTOR, YCHANNELSELECTOR, ARIA_AUTOCOMPLETE, CONTENTSCRIPTTYPE, ENABLE_BACKGROUND, DOMINANT_BASELINE, GRADIENTTRANSFORM, ONBEFORDEACTIVATE, ONDATASETCOMPLETE, OVERLINE_POSITION, ONBEFOREEDITFOCUS, LIMITINGCONEANGLE, VERYTHINMATHSPACE, STROKE_DASHOFFSET, STROKE_MITERLIMIT, ALIGNMENT_BASELINE, ONREADYSTATECHANGE, OVERLINE_THICKNESS, UNDERLINE_POSITION, VERYTHICKMATHSPACE, REQUIREDEXTENSIONS, COLOR_INTERPOLATION, UNDERLINE_THICKNESS, PRESERVEASPECTRATIO, PATTERNCONTENTUNITS, ARIA_MULTISELECTABLE, SCRIPTSIZEMULTIPLIER, ARIA_ACTIVEDESCENDANT, VERYVERYTHINMATHSPACE, VERYVERYTHICKMATHSPACE, STRIKETHROUGH_POSITION, STRIKETHROUGH_THICKNESS, EXTERNALRESOURCESREQUIRED, GLYPH_ORIENTATION_VERTICAL, COLOR_INTERPOLATION_FILTERS, GLYPH_ORIENTATION_HORIZONTAL]);
  ATTRIBUTE_HASHES = initValues(_3I_classLit, 49, -1, [1153, 1383, 1601, 1793, 1827, 1857, 68600, 69146, 69177, 70237, 70270, 71572, 71669, 72415, 72444, 74846, 74904, 74943, 75001, 75276, 75590, 84742, 84839, 85575, 85963, 85992, 87204, 88074, 88171, 89130, 89163, 3207892, 3283895, 3284791, 3338752, 3358197, 3369562, 3539124, 3562402, 3574260, 3670335, 3696933, 3721879, 135280021, 135346322, 136317019, 136475749, 136548517, 136652214, 136884919, 136902418, 136942992, 137292068, 139120259, 139785574, 142250603, 142314056, 142331176, 142519584, 144752417, 145106895, 146147200, 146765926, 148805544, 149655723, 149809441, 150018784, 150445028, 150923321, 152528754, 152536216, 152647366, 152962785, 155219321, 155654904, 157317483, 157350248, 157437941, 157447478, 157604838, 157685404, 157894402, 158315188, 166078431, 169409980, 169700259, 169856932, 170007032, 170409695, 170466488, 170513710, 170608367, 173028944, 173896963, 176090625, 176129212, 179390001, 179489057, 179627464, 179840468, 179849042, 180004216, 181779081, 183027151, 183645319, 183698797, 185922012, 185997252, 188312483, 188675799, 190977533, 190992569, 191006194, 191033518, 191038774, 191096249, 191166163, 191194426, 191522106, 191568039, 200104642, 202506661, 202537381, 202602917, 203070590, 203120766, 203389054, 203690071, 203971238, 203986524, 209040857, 209125756, 212055489, 212322418, 212746849, 213002877, 213055164, 213088023, 213259873, 213273386, 213435118, 213437318, 213438231, 213493071, 213532268, 213542834, 213584431, 213659891, 215285828, 215880731, 216112976, 216684637, 217369699, 217565298, 217576549, 218186795, 219743185, 220082234, 221623802, 221986406, 222283890, 223089542, 223138630, 223311265, 224547358, 224587256, 224589550, 224655650, 224785518, 224810917, 224813302, 225429618, 225432950, 225440869, 236107233, 236709921, 236838947, 237117095, 237143271, 237172455, 237209953, 237354143, 237372743, 237668065, 237703073, 237714273, 239743521, 240512803, 240522627, 240560417, 240656513, 241015715, 241062755, 241065383, 243523041, 245865199, 246261793, 246556195, 246774817, 246923491, 246928419, 246981667, 247014847, 247058369, 247112833, 247118177, 247119137, 247128739, 247316903, 249533729, 250235623, 250269543, 251083937, 251402351, 252339047, 253260911, 253293679, 254844367, 255547879, 256077281, 256345377, 258124199, 258354465, 258605063, 258744193, 258845603, 258856961, 258926689, 269869248, 270174334, 270709417, 270778994, 270781796, 271102503, 271478858, 271490090, 272870654, 273335275, 273369140, 273924313, 274108530, 274116736, 276818662, 277476156, 279156579, 279349675, 280108533, 280128712, 280132869, 280162403, 280280292, 280413430, 280506130, 280677397, 280678580, 280686710, 280689066, 282736758, 283110901, 283275116, 283823226, 283890012, 284479340, 284606461, 286700477, 286798916, 291557706, 291665349, 291804100, 292138018, 292166446, 292418738, 292451039, 300298041, 300374839, 300597935, 303073389, 303083839, 303266673, 303354997, 303430688, 303576261, 303724281, 303819694, 304242723, 304382625, 306247792, 307227811, 307468786, 307724489, 309671175, 310252031, 310358241, 310373094, 311015256, 313357609, 313683893, 313701861, 313706996, 313707317, 313710350, 314027746, 314038181, 314091299, 314205627, 314233813, 316741830, 316797986, 317486755, 317794164, 318721061, 320076137, 322657125, 322887778, 323506876, 323572412, 323605180, 323938869, 325060058, 325320188, 325398738, 325541490, 325671619, 333868843, 336806130, 337212108, 337282686, 337285434, 337585223, 338036037, 338298087, 338566051, 340943551, 341190970, 342995704, 343352124, 343912673, 344585053, 346977248, 347218098, 347262163, 347278576, 347438191, 347655959, 347684788, 347726430, 347727772, 347776035, 347776629, 349500753, 350880161, 350887073, 353384123, 355496998, 355906922, 355979793, 356545959, 358637867, 358905016, 359164318, 359247286, 359350571, 359579447, 365560330, 367399355, 367420285, 367510727, 368013212, 370234760, 370353345, 370710317, 371074566, 371122285, 371194213, 371448425, 371448430, 371545055, 371596922, 371758751, 371964792, 372151328, 376550136, 376710172, 376795771, 376826271, 376906556, 380514830, 380774774, 380775037, 381030322, 381136500, 381281631, 381282269, 381285504, 381330595, 381331422, 381335911, 381336484, 383907298, 383917408, 384595009, 384595013, 387799894, 387823201, 392581647, 392584937, 392742684, 392906485, 393003349, 400644707, 400973830, 404428547, 404432113, 404432865, 404469244, 404478897, 404694860, 406887479, 408294949, 408789955, 410022510, 410467324, 410586448, 410945965, 411845275, 414327152, 414327932, 414329781, 414346257, 414346439, 414639928, 414835998, 414894517, 414986533, 417465377, 417465381, 417492216, 418259232, 419310946, 420103495, 420242342, 420380455, 420658662, 420717432, 423183880, 424539259, 425929170, 425972964, 426050649, 426126450, 426142833, 426607922, 437289840, 437347469, 437412335, 437423943, 437455540, 437462252, 437597991, 437617485, 437986305, 437986507, 437986828, 437987072, 438015591, 438034813, 438038966, 438179623, 438347971, 438483573, 438547062, 438895551, 441592676, 442032555, 443548979, 447881379, 447881655, 447881895, 447887844, 448416189, 448445746, 448449012, 450942191, 452816744, 453668677, 454434495, 456610076, 456642844, 456738709, 457544600, 459451897, 459680944, 468058810, 468083581, 470964084, 471470955, 471567278, 472267822, 481177859, 481210627, 481435874, 481455115, 481485378, 481490218, 485105638, 486005878, 486383494, 487988916, 488103783, 490661867, 491574090, 491578272, 493041952, 493441205, 493582844, 493716979, 504577572, 504740359, 505091638, 505592418, 505656212, 509516275, 514998531, 515571132, 515594682, 518712698, 521362273, 526592419, 526807354, 527348842, 538294791, 539214049, 544689535, 545535009, 548544752, 548563346, 548595116, 551679010, 558034099, 560329411, 560356209, 560671018, 560671152, 560692590, 560845442, 569212097, 569474241, 572252718, 572768481, 575326764, 576174758, 576190819, 582099184, 582099438, 582372519, 582558889, 586552164, 591325418, 594231990, 594243961, 605711268, 615672071, 616086845, 621792370, 624879850, 627432831, 640040548, 654392808, 658675477, 659420283, 672891587, 694768102, 705890982, 725543146, 759097578, 761686526, 795383908, 843809551, 878105336, 908643300, 945213471]);
}

function $AttributeName(this$static, uri, local, prefix, ncname, xmlns){
  $clinit_124();
  this$static.uri = uri;
  this$static.local = local;
  COMPUTE_QNAME(local, prefix);
  this$static.ncname = ncname;
  this$static.xmlns = xmlns;
  return this$static;
}

function $AttributeName_0(this$static, uri, local, prefix, ncname, xmlns){
  $clinit_124();
  this$static.uri = uri;
  this$static.local = local;
  COMPUTE_QNAME(local, prefix);
  this$static.ncname = ncname;
  this$static.xmlns = xmlns;
  return this$static;
}

function $isBoolean(this$static){
  return this$static == ACTIVE || this$static == ASYNC || this$static == AUTOFOCUS || this$static == AUTOSUBMIT || this$static == CHECKED || this$static == COMPACT || this$static == DECLARE || this$static == DEFAULT || this$static == DEFER || this$static == DISABLED || this$static == ISMAP || this$static == MULTIPLE || this$static == NOHREF || this$static == NORESIZE || this$static == NOSHADE || this$static == NOWRAP || this$static == READONLY || this$static == REQUIRED || this$static == SELECTED;
}

function $isCaseFolded(this$static){
  return this$static == ACTIVE || this$static == ALIGN || this$static == ASYNC || this$static == AUTOCOMPLETE || this$static == AUTOFOCUS || this$static == AUTOSUBMIT || this$static == CHECKED || this$static == CLEAR || this$static == COMPACT || this$static == DATAFORMATAS || this$static == DECLARE || this$static == DEFAULT || this$static == DEFER || this$static == DIR || this$static == DISABLED || this$static == ENCTYPE || this$static == FRAME || this$static == ISMAP || this$static == METHOD || this$static == MULTIPLE || this$static == NOHREF || this$static == NORESIZE || this$static == NOSHADE || this$static == NOWRAP || this$static == READONLY || this$static == REPLACE || this$static == REQUIRED || this$static == RULES || this$static == SCOPE || this$static == SCROLLING || this$static == SELECTED || this$static == SHAPE || this$static == STEP || this$static == TYPE_1 || this$static == VALIGN || this$static == VALUETYPE;
}

function COLONIFIED_LOCAL(name_0, suffix){
  var arr;
  arr = initDim(_3Ljava_lang_String_2_classLit, 56, 1, 4, 0);
  arr[0] = name_0;
  arr[1] = suffix;
  arr[2] = suffix;
  arr[3] = name_0;
  return arr;
}

function COMPUTE_QNAME(local, prefix){
  var arr, i;
  arr = initDim(_3Ljava_lang_String_2_classLit, 56, 1, 4, 0);
  for (i = 0; i < arr.length; ++i) {
    prefix[i] == null?(arr[i] = local[i]):(arr[i] = String(prefix[i] + ':' + local[i]));
  }
  return arr;
}

function SAME_LOCAL(name_0){
  var arr;
  arr = initDim(_3Ljava_lang_String_2_classLit, 56, 1, 4, 0);
  arr[0] = name_0;
  arr[1] = name_0;
  arr[2] = name_0;
  arr[3] = name_0;
  return arr;
}

function SVG_DIFFERENT(name_0, camel){
  var arr;
  arr = initDim(_3Ljava_lang_String_2_classLit, 56, 1, 4, 0);
  arr[0] = name_0;
  arr[1] = name_0;
  arr[2] = camel;
  arr[3] = name_0;
  return arr;
}

function bufToHash(buf, len){
  var hash, hash2, i, j;
  hash2 = 0;
  hash = len;
  hash <<= 5;
  hash += buf[0] - 96;
  j = len;
  for (i = 0; i < 4 && j > 0; ++i) {
    --j;
    hash <<= 5;
    hash += buf[j] - 96;
    hash2 <<= 6;
    hash2 += buf[i] - 95;
  }
  return hash ^ hash2;
}

function createAttributeName(name_0, checkNcName){
  var ncName, xmlns;
  ncName = true;
  xmlns = name_0.indexOf('xmlns:') == 0;
  checkNcName && (xmlns?(ncName = false):(ncName = isNCName(name_0)));
  return $AttributeName_0(new AttributeName, ALL_NO_NS, SAME_LOCAL(name_0), ALL_NO_PREFIX, ncName?ALL_NCNAME:ALL_NO_NCNAME, xmlns);
}

function getClass_67(){
  return Lnu_validator_htmlparser_impl_AttributeName_2_classLit;
}

function nameByBuffer(buf, offset, length_0, checkNcName){
  var end, end_0;
  $clinit_124();
  var attributeName, hash, index, name_0;
  hash = bufToHash(buf, length_0);
  index = binarySearch(ATTRIBUTE_HASHES, hash);
  if (index < 0) {
    return createAttributeName(String((end = offset + length_0 , __checkBounds(buf.length, offset, end) , __valueOf(buf, offset, end))), checkNcName);
  }
   else {
    attributeName = ATTRIBUTE_NAMES[index];
    name_0 = attributeName.local[0];
    if (!localEqualsBuffer(name_0, buf, offset, length_0)) {
      return createAttributeName(String((end_0 = offset + length_0 , __checkBounds(buf.length, offset, end_0) , __valueOf(buf, offset, end_0))), checkNcName);
    }
    return attributeName;
  }
}

function AttributeName(){
}

_ = AttributeName.prototype = new Object_0;
_.getClass$ = getClass_67;
_.typeId$ = 39;
_.local = null;
_.ncname = null;
_.uri = null;
_.xmlns = false;
var ABBR, ACCENT, ACCENTUNDER, ACCENT_HEIGHT, ACCEPT, ACCEPT_CHARSET, ACCESSKEY, ACCUMULATE, ACTION, ACTIONTYPE, ACTIVE, ADDITIVE, ALIGN, ALIGNMENTSCOPE, ALIGNMENT_BASELINE, ALINK, ALL_NCNAME, ALL_NO_NCNAME, ALL_NO_NS, ALL_NO_PREFIX, ALPHABETIC, ALT, ALTIMG, ALTTEXT, AMPLITUDE, ARABIC_FORM, ARCHIVE, ARIA_ACTIVEDESCENDANT, ARIA_ATOMIC, ARIA_AUTOCOMPLETE, ARIA_BUSY, ARIA_CHANNEL, ARIA_CHECKED, ARIA_CONTROLS, ARIA_DATATYPE, ARIA_DESCRIBEDBY, ARIA_DISABLED, ARIA_DROPEFFECT, ARIA_EXPANDED, ARIA_FLOWTO, ARIA_GRAB, ARIA_HASPOPUP, ARIA_HIDDEN, ARIA_INVALID, ARIA_LABELLEDBY, ARIA_LEVEL, ARIA_LIVE, ARIA_MULTILINE, ARIA_MULTISELECTABLE, ARIA_OWNS, ARIA_POSINSET, ARIA_PRESSED, ARIA_READONLY, ARIA_RELEVANT, ARIA_REQUIRED, ARIA_SECRET, ARIA_SELECTED, ARIA_SETSIZE, ARIA_SORT, ARIA_TEMPLATEID, ARIA_VALUEMAX, ARIA_VALUEMIN, ARIA_VALUENOW, ASCENT, ASYNC, ATTRIBUTENAME, ATTRIBUTETYPE, ATTRIBUTE_HASHES, ATTRIBUTE_NAMES, AUTOCOMPLETE, AUTOFOCUS, AUTOPLAY, AUTOSUBMIT, AXIS, AZIMUTH, BACKGROUND, BASE, BASEFREQUENCY, BASELINE, BASELINE_SHIFT, BASEPROFILE, BBOX, BEGIN, BEVELLED, BGCOLOR, BIAS, BORDER, BY, CALCMODE, CAP_HEIGHT, CELLPADDING, CELLSPACING, CHAR, CHAROFF, CHARSET, CHECKED, CITE, CLASS, CLASSID, CLEAR, CLIP, CLIPPATHUNITS, CLIP_PATH, CLIP_RULE, CLOSE, CLOSURE, CODE, CODEBASE, CODETYPE, COLOR, COLOR_INTERPOLATION, COLOR_INTERPOLATION_FILTERS, COLOR_PROFILE, COLOR_RENDERING, COLS, COLSPAN, COLUMNALIGN, COLUMNLINES, COLUMNSPACING, COLUMNSPAN, COLUMNWIDTH, COMPACT, CONTENT, CONTENTEDITABLE, CONTENTSCRIPTTYPE, CONTENTSTYLETYPE, CONTEXTMENU, CONTROLS, COORDS, CURSOR, CX, CY, D, DATA, DATAFLD, DATAFORMATAS, DATASRC, DATETIME, DECLARE, DEFAULT, DEFER, DEFINITIONURL, DEPTH, DESCENT, DIFFUSECONSTANT, DIR, DIRECTION, DISABLED, DISPLAY, DISPLAYSTYLE, DIVISOR, DOMINANT_BASELINE, DRAGGABLE, DUR, DX, DY, EDGE, EDGEMODE, ELEVATION, ENABLE_BACKGROUND, ENCODING, ENCTYPE, END, EQUALCOLUMNS, EQUALROWS, EXPONENT, EXTERNALRESOURCESREQUIRED, FACE, FENCE, FILL, FILL_OPACITY, FILL_RULE, FILTER, FILTERRES, FILTERUNITS, FLOOD_COLOR, FLOOD_OPACITY, FONTFAMILY, FONTSIZE, FONTSTYLE, FONTWEIGHT, FONT_FAMILY, FONT_SIZE, FONT_SIZE_ADJUST, FONT_STRETCH, FONT_STYLE, FONT_VARIANT, FONT_WEIGHT, FOR, FORM, FORMAT, FRAME, FRAMEBORDER, FRAMESPACING, FROM, FX, FY, G1, G2, GLYPHREF, GLYPH_NAME, GLYPH_ORIENTATION_HORIZONTAL, GLYPH_ORIENTATION_VERTICAL, GRADIENTTRANSFORM, GRADIENTUNITS, GROUPALIGN, HANGING, HEADERS, HEIGHT, HIDDEN, HIDEFOCUS, HIGH, HORIZ_ADV_X, HORIZ_ORIGIN_X, HORIZ_ORIGIN_Y, HREF, HREFLANG, HSPACE, HTTP_EQUIV, ICON, ID, IDEOGRAPHIC, IMAGE_RENDERING, IN, IN2, INDEX, INPUTMODE, INTERCEPT, IRRELEVANT, ISMAP, K, K1, K2, K3, K4, KERNELMATRIX, KERNELUNITLENGTH, KERNING, KEYPOINTS, KEYSPLINES, KEYTIMES, LABEL, LANG, LANGUAGE, LANG_NS, LANG_PREFIX, LARGEOP, LENGTHADJUST, LETTER_SPACING, LIGHTING_COLOR, LIMITINGCONEANGLE, LINEBREAK, LINETHICKNESS, LINK, LIST, LOCAL, LONGDESC, LOOPEND, LOOPSTART, LOW, LOWSRC, LQUOTE, LSPACE, MACROS, MANIFEST, MARGINHEIGHT, MARGINWIDTH, MARKERHEIGHT, MARKERUNITS, MARKERWIDTH, MARKER_END, MARKER_MID, MARKER_START, MASK, MASKCONTENTUNITS, MASKUNITS, MATHBACKGROUND, MATHCOLOR, MATHEMATICAL, MATHSIZE, MATHVARIANT, MAX, MAXLENGTH, MAXSIZE, MEDIA, MEDIUMMATHSPACE, METHOD, MIN, MINSIZE, MODE, MOVABLELIMITS, MULTIPLE, NAME, NARGS, NOHREF, NORESIZE, NOSHADE, NOTATION, NOWRAP, NUMOCTAVES, OBJECT, OCCURRENCE, OFFSET, ONABORT, ONACTIVATE, ONAFTERPRINT, ONAFTERUPDATE, ONBEFORDEACTIVATE, ONBEFOREACTIVATE, ONBEFORECOPY, ONBEFORECUT, ONBEFOREEDITFOCUS, ONBEFOREPASTE, ONBEFOREPRINT, ONBEFOREUNLOAD, ONBEFOREUPDATE, ONBEGIN, ONBLUR, ONBOUNCE, ONCELLCHANGE, ONCHANGE, ONCLICK, ONCONTEXTMENU, ONCONTROLSELECT, ONCOPY, ONCUT, ONDATAAVAILABLE, ONDATASETCHANGED, ONDATASETCOMPLETE, ONDBLCLICK, ONDEACTIVATE, ONDRAG, ONDRAGDROP, ONDRAGEND, ONDRAGENTER, ONDRAGLEAVE, ONDRAGOVER, ONDRAGSTART, ONDROP, ONEND, ONERROR, ONERRORUPDATE, ONFILTERCHANGE, ONFINISH, ONFOCUS, ONFOCUSIN, ONFOCUSOUT, ONFORMCHANGE, ONFORMINPUT, ONHELP, ONINPUT, ONINVALID, ONKEYDOWN, ONKEYPRESS, ONKEYUP, ONLOAD, ONLOSECAPTURE, ONMESSAGE, ONMOUSEDOWN, ONMOUSEENTER, ONMOUSELEAVE, ONMOUSEMOVE, ONMOUSEOUT, ONMOUSEOVER, ONMOUSEUP, ONMOUSEWHEEL, ONMOVE, ONMOVEEND, ONMOVESTART, ONPASTE, ONPROPERTYCHANGE, ONREADYSTATECHANGE, ONREPEAT, ONRESET, ONRESIZE, ONROWENTER, ONROWEXIT, ONROWSDELETE, ONROWSINSERTED, ONSCROLL, ONSELECT, ONSELECTSTART, ONSTART, ONSTOP, ONSUBMIT, ONUNLOAD, ONZOOM, OPACITY, OPEN, OPERATOR, OPTIMUM, ORDER, ORIENT, ORIENTATION, ORIGIN, OTHER, OVERFLOW, OVERLINE_POSITION, OVERLINE_THICKNESS, PANOSE_1, PATH, PATHLENGTH, PATTERN, PATTERNCONTENTUNITS, PATTERNTRANSFORM, PATTERNUNITS, PING, PLAYCOUNT, POINTER_EVENTS, POINTS, POINTSATX, POINTSATY, POINTSATZ, POSTER, PRESERVEALPHA, PRESERVEASPECTRATIO, PRIMITIVEUNITS, PROFILE, PROMPT, R, RADIOGROUP, RADIUS, READONLY, REFX, REFY, REL, RENDERING_INTENT, REPEAT, REPEATCOUNT, REPEATDUR, REPEAT_MAX, REPEAT_MIN, REPEAT_START, REPEAT_TEMPLATE, REPLACE, REQUIRED, REQUIREDEXTENSIONS, REQUIREDFEATURES, RESTART, RESULT, REV, ROLE, ROTATE, ROWALIGN, ROWLINES, ROWS, ROWSPACING, ROWSPAN, RQUOTE, RSPACE, RT, RULES, RX, RY, SANDBOX, SCALE, SCHEME, SCOPE, SCOPED, SCRIPTLEVEL, SCRIPTMINSIZE, SCRIPTSIZEMULTIPLIER, SCROLLDELAY, SCROLLING, SEAMLESS, SEED, SELECTED, SELECTION, SEPARATOR, SEPARATORS, SHAPE, SHAPE_RENDERING, SIZE, SLOPE, SPACING, SPAN, SPECIFICATION, SPECULARCONSTANT, SPECULAREXPONENT, SPEED, SPREADMETHOD, SRC, STANDBY, START, STARTOFFSET, STDDEVIATION, STEMH, STEMV, STEP, STITCHTILES, STOP_COLOR, STOP_OPACITY, STRETCHY, STRIKETHROUGH_POSITION, STRIKETHROUGH_THICKNESS, STRING, STROKE, STROKE_DASHARRAY, STROKE_DASHOFFSET, STROKE_LINECAP, STROKE_LINEJOIN, STROKE_MITERLIMIT, STROKE_OPACITY, STROKE_WIDTH, STYLE, SUBSCRIPTSHIFT, SUMMARY, SUPERSCRIPTSHIFT, SURFACESCALE, SYMMETRIC, SYSTEMLANGUAGE, TABINDEX, TABLEVALUES, TARGET, TARGETX, TARGETY, TEMPLATE, TEXT, TEXTLENGTH, TEXT_ANCHOR, TEXT_DECORATION, TEXT_RENDERING, THICKMATHSPACE, THINMATHSPACE, TITLE, TO, TRANSFORM, TYPE_1, U1, U2, UNDERLINE_POSITION, UNDERLINE_THICKNESS, UNICODE, UNICODE_BIDI, UNICODE_RANGE, UNITS_PER_EM, UNSELECTABLE, USEMAP, VALIGN, VALUE, VALUES, VALUETYPE, VERSION, VERT_ADV_Y, VERT_ORIGIN_X, VERT_ORIGIN_Y, VERYTHICKMATHSPACE, VERYTHINMATHSPACE, VERYVERYTHICKMATHSPACE, VERYVERYTHINMATHSPACE, VIEWBOX, VIEWTARGET, VISIBILITY, VLINK, VSPACE, V_ALPHABETIC, V_HANGING, V_IDEOGRAPHIC, V_MATHEMATICAL, WHEN, WIDTH, WIDTHS, WORD_SPACING, WRAP, WRITING_MODE, X, X1, X2, XCHANNELSELECTOR, XLINK_ACTUATE, XLINK_ARCROLE, XLINK_HREF, XLINK_NS, XLINK_PREFIX, XLINK_ROLE, XLINK_SHOW, XLINK_TITLE, XLINK_TYPE, XMLNS, XMLNS_NS, XMLNS_PREFIX, XMLNS_XLINK, XML_BASE, XML_LANG, XML_NS, XML_PREFIX, XML_SPACE, XREF, X_HEIGHT, Y, Y1, Y2, YCHANNELSELECTOR, Z, ZOOMANDPAN;
function $clinit_125(){
  $clinit_125 = nullMethod;
  $ElementName_0(new ElementName, null);
  A = $ElementName(new ElementName, 'a', 'a', 1, false, false, false);
  B = $ElementName(new ElementName, 'b', 'b', 45, false, false, false);
  G = $ElementName(new ElementName, 'g', 'g', 0, false, false, false);
  I = $ElementName(new ElementName, 'i', 'i', 45, false, false, false);
  P = $ElementName(new ElementName, 'p', 'p', 29, true, false, false);
  Q = $ElementName(new ElementName, 'q', 'q', 0, false, false, false);
  S = $ElementName(new ElementName, 's', 's', 45, false, false, false);
  U = $ElementName(new ElementName, 'u', 'u', 45, false, false, false);
  BR = $ElementName(new ElementName, 'br', 'br', 4, true, false, false);
  CI = $ElementName(new ElementName, 'ci', 'ci', 0, false, false, false);
  CN = $ElementName(new ElementName, 'cn', 'cn', 0, false, false, false);
  DD = $ElementName(new ElementName, 'dd', 'dd', 41, true, false, false);
  DL = $ElementName(new ElementName, 'dl', 'dl', 46, true, false, false);
  DT = $ElementName(new ElementName, 'dt', 'dt', 41, true, false, false);
  EM = $ElementName(new ElementName, 'em', 'em', 45, false, false, false);
  EQ = $ElementName(new ElementName, 'eq', 'eq', 0, false, false, false);
  FN = $ElementName(new ElementName, 'fn', 'fn', 0, false, false, false);
  H1 = $ElementName(new ElementName, 'h1', 'h1', 42, true, false, false);
  H2 = $ElementName(new ElementName, 'h2', 'h2', 42, true, false, false);
  H3 = $ElementName(new ElementName, 'h3', 'h3', 42, true, false, false);
  H4 = $ElementName(new ElementName, 'h4', 'h4', 42, true, false, false);
  H5 = $ElementName(new ElementName, 'h5', 'h5', 42, true, false, false);
  H6 = $ElementName(new ElementName, 'h6', 'h6', 42, true, false, false);
  GT = $ElementName(new ElementName, 'gt', 'gt', 0, false, false, false);
  HR = $ElementName(new ElementName, 'hr', 'hr', 22, true, false, false);
  IN_0 = $ElementName(new ElementName, 'in', 'in', 0, false, false, false);
  LI = $ElementName(new ElementName, 'li', 'li', 15, true, false, false);
  LN = $ElementName(new ElementName, 'ln', 'ln', 0, false, false, false);
  LT = $ElementName(new ElementName, 'lt', 'lt', 0, false, false, false);
  MI = $ElementName(new ElementName, 'mi', 'mi', 57, false, false, false);
  MN = $ElementName(new ElementName, 'mn', 'mn', 57, false, false, false);
  MO = $ElementName(new ElementName, 'mo', 'mo', 57, false, false, false);
  MS = $ElementName(new ElementName, 'ms', 'ms', 57, false, false, false);
  OL = $ElementName(new ElementName, 'ol', 'ol', 46, true, false, false);
  OR = $ElementName(new ElementName, 'or', 'or', 0, false, false, false);
  PI = $ElementName(new ElementName, 'pi', 'pi', 0, false, false, false);
  RP = $ElementName(new ElementName, 'rp', 'rp', 53, false, false, false);
  RT_0 = $ElementName(new ElementName, 'rt', 'rt', 53, false, false, false);
  TD = $ElementName(new ElementName, 'td', 'td', 40, false, true, false);
  TH = $ElementName(new ElementName, 'th', 'th', 40, false, true, false);
  TR = $ElementName(new ElementName, 'tr', 'tr', 37, true, false, true);
  TT = $ElementName(new ElementName, 'tt', 'tt', 45, false, false, false);
  UL = $ElementName(new ElementName, 'ul', 'ul', 46, true, false, false);
  AND = $ElementName(new ElementName, 'and', 'and', 0, false, false, false);
  ARG = $ElementName(new ElementName, 'arg', 'arg', 0, false, false, false);
  ABS = $ElementName(new ElementName, 'abs', 'abs', 0, false, false, false);
  BIG = $ElementName(new ElementName, 'big', 'big', 45, false, false, false);
  BDO = $ElementName(new ElementName, 'bdo', 'bdo', 0, false, false, false);
  CSC = $ElementName(new ElementName, 'csc', 'csc', 0, false, false, false);
  COL = $ElementName(new ElementName, 'col', 'col', 7, true, false, false);
  COS = $ElementName(new ElementName, 'cos', 'cos', 0, false, false, false);
  COT = $ElementName(new ElementName, 'cot', 'cot', 0, false, false, false);
  DEL = $ElementName(new ElementName, 'del', 'del', 0, false, false, false);
  DFN = $ElementName(new ElementName, 'dfn', 'dfn', 0, false, false, false);
  DIR_0 = $ElementName(new ElementName, 'dir', 'dir', 51, true, false, false);
  DIV = $ElementName(new ElementName, 'div', 'div', 50, true, false, false);
  EXP = $ElementName(new ElementName, 'exp', 'exp', 0, false, false, false);
  GCD = $ElementName(new ElementName, 'gcd', 'gcd', 0, false, false, false);
  GEQ = $ElementName(new ElementName, 'geq', 'geq', 0, false, false, false);
  IMG = $ElementName(new ElementName, 'img', 'img', 48, true, false, false);
  INS = $ElementName(new ElementName, 'ins', 'ins', 0, false, false, false);
  INT = $ElementName(new ElementName, 'int', 'int', 0, false, false, false);
  KBD = $ElementName(new ElementName, 'kbd', 'kbd', 0, false, false, false);
  LOG = $ElementName(new ElementName, 'log', 'log', 0, false, false, false);
  LCM = $ElementName(new ElementName, 'lcm', 'lcm', 0, false, false, false);
  LEQ = $ElementName(new ElementName, 'leq', 'leq', 0, false, false, false);
  MTD = $ElementName(new ElementName, 'mtd', 'mtd', 0, false, false, false);
  MIN_0 = $ElementName(new ElementName, 'min', 'min', 0, false, false, false);
  MAP = $ElementName(new ElementName, 'map', 'map', 0, false, false, false);
  MTR = $ElementName(new ElementName, 'mtr', 'mtr', 0, false, false, false);
  MAX_0 = $ElementName(new ElementName, 'max', 'max', 0, false, false, false);
  NEQ = $ElementName(new ElementName, 'neq', 'neq', 0, false, false, false);
  NOT = $ElementName(new ElementName, 'not', 'not', 0, false, false, false);
  NAV = $ElementName(new ElementName, 'nav', 'nav', 51, true, false, false);
  PRE = $ElementName(new ElementName, 'pre', 'pre', 44, true, false, false);
  REM = $ElementName(new ElementName, 'rem', 'rem', 0, false, false, false);
  SUB = $ElementName(new ElementName, 'sub', 'sub', 52, false, false, false);
  SEC = $ElementName(new ElementName, 'sec', 'sec', 0, false, false, false);
  SVG = $ElementName(new ElementName, 'svg', 'svg', 19, false, false, false);
  SUM = $ElementName(new ElementName, 'sum', 'sum', 0, false, false, false);
  SIN = $ElementName(new ElementName, 'sin', 'sin', 0, false, false, false);
  SEP = $ElementName(new ElementName, 'sep', 'sep', 0, false, false, false);
  SUP = $ElementName(new ElementName, 'sup', 'sup', 52, false, false, false);
  SET = $ElementName(new ElementName, 'set', 'set', 0, false, false, false);
  TAN = $ElementName(new ElementName, 'tan', 'tan', 0, false, false, false);
  USE = $ElementName(new ElementName, 'use', 'use', 0, false, false, false);
  VAR = $ElementName(new ElementName, 'var', 'var', 52, false, false, false);
  WBR = $ElementName(new ElementName, 'wbr', 'wbr', 49, true, false, false);
  XMP = $ElementName(new ElementName, 'xmp', 'xmp', 38, false, false, false);
  XOR = $ElementName(new ElementName, 'xor', 'xor', 0, false, false, false);
  AREA = $ElementName(new ElementName, 'area', 'area', 49, true, false, false);
  ABBR_0 = $ElementName(new ElementName, 'abbr', 'abbr', 0, false, false, false);
  BASE_0 = $ElementName(new ElementName, 'base', 'base', 2, true, false, false);
  BVAR = $ElementName(new ElementName, 'bvar', 'bvar', 0, false, false, false);
  BODY = $ElementName(new ElementName, 'body', 'body', 3, true, false, false);
  CARD = $ElementName(new ElementName, 'card', 'card', 0, false, false, false);
  CODE_0 = $ElementName(new ElementName, 'code', 'code', 45, false, false, false);
  CITE_0 = $ElementName(new ElementName, 'cite', 'cite', 0, false, false, false);
  CSCH = $ElementName(new ElementName, 'csch', 'csch', 0, false, false, false);
  COSH = $ElementName(new ElementName, 'cosh', 'cosh', 0, false, false, false);
  COTH = $ElementName(new ElementName, 'coth', 'coth', 0, false, false, false);
  CURL = $ElementName(new ElementName, 'curl', 'curl', 0, false, false, false);
  DESC = $ElementName(new ElementName, 'desc', 'desc', 59, false, false, false);
  DIFF = $ElementName(new ElementName, 'diff', 'diff', 0, false, false, false);
  DEFS = $ElementName(new ElementName, 'defs', 'defs', 0, false, false, false);
  FORM_0 = $ElementName(new ElementName, 'form', 'form', 9, true, false, false);
  FONT = $ElementName(new ElementName, 'font', 'font', 64, false, false, false);
  GRAD = $ElementName(new ElementName, 'grad', 'grad', 0, false, false, false);
  HEAD = $ElementName(new ElementName, 'head', 'head', 20, true, false, false);
  HTML_0 = $ElementName(new ElementName, 'html', 'html', 23, false, true, false);
  LINE = $ElementName(new ElementName, 'line', 'line', 0, false, false, false);
  LINK_0 = $ElementName(new ElementName, 'link', 'link', 16, true, false, false);
  LIST_0 = $ElementName(new ElementName, 'list', 'list', 0, false, false, false);
  META = $ElementName(new ElementName, 'meta', 'meta', 18, true, false, false);
  MSUB = $ElementName(new ElementName, 'msub', 'msub', 0, false, false, false);
  MODE_0 = $ElementName(new ElementName, 'mode', 'mode', 0, false, false, false);
  MATH = $ElementName(new ElementName, 'math', 'math', 17, false, false, false);
  MARK = $ElementName(new ElementName, 'mark', 'mark', 0, false, false, false);
  MASK_0 = $ElementName(new ElementName, 'mask', 'mask', 0, false, false, false);
  MEAN = $ElementName(new ElementName, 'mean', 'mean', 0, false, false, false);
  MSUP = $ElementName(new ElementName, 'msup', 'msup', 0, false, false, false);
  MENU = $ElementName(new ElementName, 'menu', 'menu', 50, true, false, false);
  MROW = $ElementName(new ElementName, 'mrow', 'mrow', 0, false, false, false);
  NONE = $ElementName(new ElementName, 'none', 'none', 0, false, false, false);
  NOBR = $ElementName(new ElementName, 'nobr', 'nobr', 24, false, false, false);
  NEST = $ElementName(new ElementName, 'nest', 'nest', 0, false, false, false);
  PATH_0 = $ElementName(new ElementName, 'path', 'path', 0, false, false, false);
  PLUS = $ElementName(new ElementName, 'plus', 'plus', 0, false, false, false);
  RULE = $ElementName(new ElementName, 'rule', 'rule', 0, false, false, false);
  REAL = $ElementName(new ElementName, 'real', 'real', 0, false, false, false);
  RELN = $ElementName(new ElementName, 'reln', 'reln', 0, false, false, false);
  RECT = $ElementName(new ElementName, 'rect', 'rect', 0, false, false, false);
  ROOT = $ElementName(new ElementName, 'root', 'root', 0, false, false, false);
  RUBY = $ElementName(new ElementName, 'ruby', 'ruby', 52, false, false, false);
  SECH = $ElementName(new ElementName, 'sech', 'sech', 0, false, false, false);
  SINH = $ElementName(new ElementName, 'sinh', 'sinh', 0, false, false, false);
  SPAN_0 = $ElementName(new ElementName, 'span', 'span', 52, false, false, false);
  SAMP = $ElementName(new ElementName, 'samp', 'samp', 0, false, false, false);
  STOP = $ElementName(new ElementName, 'stop', 'stop', 0, false, false, false);
  SDEV = $ElementName(new ElementName, 'sdev', 'sdev', 0, false, false, false);
  TIME = $ElementName(new ElementName, 'time', 'time', 0, false, false, false);
  TRUE = $ElementName(new ElementName, 'true', 'true', 0, false, false, false);
  TREF = $ElementName(new ElementName, 'tref', 'tref', 0, false, false, false);
  TANH = $ElementName(new ElementName, 'tanh', 'tanh', 0, false, false, false);
  TEXT_0 = $ElementName(new ElementName, 'text', 'text', 0, false, false, false);
  VIEW = $ElementName(new ElementName, 'view', 'view', 0, false, false, false);
  ASIDE = $ElementName(new ElementName, 'aside', 'aside', 51, true, false, false);
  AUDIO = $ElementName(new ElementName, 'audio', 'audio', 0, false, false, false);
  APPLY = $ElementName(new ElementName, 'apply', 'apply', 0, false, false, false);
  EMBED = $ElementName(new ElementName, 'embed', 'embed', 48, true, false, false);
  FRAME_0 = $ElementName(new ElementName, 'frame', 'frame', 10, true, false, false);
  FALSE = $ElementName(new ElementName, 'false', 'false', 0, false, false, false);
  FLOOR = $ElementName(new ElementName, 'floor', 'floor', 0, false, false, false);
  GLYPH = $ElementName(new ElementName, 'glyph', 'glyph', 0, false, false, false);
  HKERN = $ElementName(new ElementName, 'hkern', 'hkern', 0, false, false, false);
  IMAGE = $ElementName(new ElementName, 'image', 'image', 12, true, false, false);
  IDENT = $ElementName(new ElementName, 'ident', 'ident', 0, false, false, false);
  INPUT = $ElementName(new ElementName, 'input', 'input', 13, true, false, false);
  LABEL_0 = $ElementName(new ElementName, 'label', 'label', 62, false, false, false);
  LIMIT = $ElementName(new ElementName, 'limit', 'limit', 0, false, false, false);
  MFRAC = $ElementName(new ElementName, 'mfrac', 'mfrac', 0, false, false, false);
  MPATH = $ElementName(new ElementName, 'mpath', 'mpath', 0, false, false, false);
  METER = $ElementName(new ElementName, 'meter', 'meter', 0, false, false, false);
  MOVER = $ElementName(new ElementName, 'mover', 'mover', 0, false, false, false);
  MINUS = $ElementName(new ElementName, 'minus', 'minus', 0, false, false, false);
  MROOT = $ElementName(new ElementName, 'mroot', 'mroot', 0, false, false, false);
  MSQRT = $ElementName(new ElementName, 'msqrt', 'msqrt', 0, false, false, false);
  MTEXT = $ElementName(new ElementName, 'mtext', 'mtext', 57, false, false, false);
  NOTIN = $ElementName(new ElementName, 'notin', 'notin', 0, false, false, false);
  PIECE = $ElementName(new ElementName, 'piece', 'piece', 0, false, false, false);
  PARAM = $ElementName(new ElementName, 'param', 'param', 55, true, false, false);
  POWER = $ElementName(new ElementName, 'power', 'power', 0, false, false, false);
  REALS = $ElementName(new ElementName, 'reals', 'reals', 0, false, false, false);
  STYLE_0 = $ElementName(new ElementName, 'style', 'style', 33, true, false, false);
  SMALL = $ElementName(new ElementName, 'small', 'small', 45, false, false, false);
  THEAD = $ElementName(new ElementName, 'thead', 'thead', 39, true, false, true);
  TABLE = $ElementName(new ElementName, 'table', 'table', 34, false, true, true);
  TITLE_0 = $ElementName(new ElementName, 'title', 'title', 36, true, false, false);
  TSPAN = $ElementName(new ElementName, 'tspan', 'tspan', 0, false, false, false);
  TIMES = $ElementName(new ElementName, 'times', 'times', 0, false, false, false);
  TFOOT = $ElementName(new ElementName, 'tfoot', 'tfoot', 39, true, false, true);
  TBODY = $ElementName(new ElementName, 'tbody', 'tbody', 39, true, false, true);
  UNION = $ElementName(new ElementName, 'union', 'union', 0, false, false, false);
  VKERN = $ElementName(new ElementName, 'vkern', 'vkern', 0, false, false, false);
  VIDEO = $ElementName(new ElementName, 'video', 'video', 0, false, false, false);
  ARCSEC = $ElementName(new ElementName, 'arcsec', 'arcsec', 0, false, false, false);
  ARCCSC = $ElementName(new ElementName, 'arccsc', 'arccsc', 0, false, false, false);
  ARCTAN = $ElementName(new ElementName, 'arctan', 'arctan', 0, false, false, false);
  ARCSIN = $ElementName(new ElementName, 'arcsin', 'arcsin', 0, false, false, false);
  ARCCOS = $ElementName(new ElementName, 'arccos', 'arccos', 0, false, false, false);
  APPLET = $ElementName(new ElementName, 'applet', 'applet', 43, false, true, false);
  ARCCOT = $ElementName(new ElementName, 'arccot', 'arccot', 0, false, false, false);
  APPROX = $ElementName(new ElementName, 'approx', 'approx', 0, false, false, false);
  BUTTON = $ElementName(new ElementName, 'button', 'button', 5, false, false, false);
  CIRCLE = $ElementName(new ElementName, 'circle', 'circle', 0, false, false, false);
  CENTER = $ElementName(new ElementName, 'center', 'center', 50, true, false, false);
  CURSOR_0 = $ElementName(new ElementName, 'cursor', 'cursor', 0, false, false, false);
  CANVAS = $ElementName(new ElementName, 'canvas', 'canvas', 0, false, false, false);
  DIVIDE = $ElementName(new ElementName, 'divide', 'divide', 0, false, false, false);
  DEGREE = $ElementName(new ElementName, 'degree', 'degree', 0, false, false, false);
  DOMAIN = $ElementName(new ElementName, 'domain', 'domain', 0, false, false, false);
  EXISTS = $ElementName(new ElementName, 'exists', 'exists', 0, false, false, false);
  FETILE = $ElementName(new ElementName, 'fetile', 'feTile', 0, false, false, false);
  FIGURE = $ElementName(new ElementName, 'figure', 'figure', 51, true, false, false);
  FORALL = $ElementName(new ElementName, 'forall', 'forall', 0, false, false, false);
  FILTER_0 = $ElementName(new ElementName, 'filter', 'filter', 0, false, false, false);
  FOOTER = $ElementName(new ElementName, 'footer', 'footer', 51, true, false, false);
  HGROUP = $ElementName(new ElementName, 'hgroup', 'hgroup', 51, true, false, false);
  HEADER = $ElementName(new ElementName, 'header', 'header', 51, true, false, false);
  IFRAME = $ElementName(new ElementName, 'iframe', 'iframe', 47, true, false, false);
  KEYGEN = $ElementName(new ElementName, 'keygen', 'keygen', 65, true, false, false);
  LAMBDA = $ElementName(new ElementName, 'lambda', 'lambda', 0, false, false, false);
  LEGEND = $ElementName(new ElementName, 'legend', 'legend', 0, false, false, false);
  MSPACE = $ElementName(new ElementName, 'mspace', 'mspace', 0, false, false, false);
  MTABLE = $ElementName(new ElementName, 'mtable', 'mtable', 0, false, false, false);
  MSTYLE = $ElementName(new ElementName, 'mstyle', 'mstyle', 0, false, false, false);
  MGLYPH = $ElementName(new ElementName, 'mglyph', 'mglyph', 56, false, false, false);
  MEDIAN = $ElementName(new ElementName, 'median', 'median', 0, false, false, false);
  MUNDER = $ElementName(new ElementName, 'munder', 'munder', 0, false, false, false);
  MARKER = $ElementName(new ElementName, 'marker', 'marker', 0, false, false, false);
  MERROR = $ElementName(new ElementName, 'merror', 'merror', 0, false, false, false);
  MOMENT = $ElementName(new ElementName, 'moment', 'moment', 0, false, false, false);
  MATRIX = $ElementName(new ElementName, 'matrix', 'matrix', 0, false, false, false);
  OPTION = $ElementName(new ElementName, 'option', 'option', 28, false, false, false);
  OBJECT_0 = $ElementName(new ElementName, 'object', 'object', 63, false, true, false);
  OUTPUT = $ElementName(new ElementName, 'output', 'output', 62, false, false, false);
  PRIMES = $ElementName(new ElementName, 'primes', 'primes', 0, false, false, false);
  SOURCE = $ElementName(new ElementName, 'source', 'source', 55, false, false, false);
  STRIKE = $ElementName(new ElementName, 'strike', 'strike', 45, false, false, false);
  STRONG = $ElementName(new ElementName, 'strong', 'strong', 45, false, false, false);
  SWITCH = $ElementName(new ElementName, 'switch', 'switch', 0, false, false, false);
  SYMBOL = $ElementName(new ElementName, 'symbol', 'symbol', 0, false, false, false);
  SPACER = $ElementName(new ElementName, 'spacer', 'spacer', 49, true, false, false);
  SELECT = $ElementName(new ElementName, 'select', 'select', 32, true, false, false);
  SUBSET = $ElementName(new ElementName, 'subset', 'subset', 0, false, false, false);
  SCRIPT = $ElementName(new ElementName, 'script', 'script', 31, true, false, false);
  TBREAK = $ElementName(new ElementName, 'tbreak', 'tbreak', 0, false, false, false);
  VECTOR = $ElementName(new ElementName, 'vector', 'vector', 0, false, false, false);
  ARTICLE = $ElementName(new ElementName, 'article', 'article', 51, true, false, false);
  ANIMATE = $ElementName(new ElementName, 'animate', 'animate', 0, false, false, false);
  ARCSECH = $ElementName(new ElementName, 'arcsech', 'arcsech', 0, false, false, false);
  ARCCSCH = $ElementName(new ElementName, 'arccsch', 'arccsch', 0, false, false, false);
  ARCTANH = $ElementName(new ElementName, 'arctanh', 'arctanh', 0, false, false, false);
  ARCSINH = $ElementName(new ElementName, 'arcsinh', 'arcsinh', 0, false, false, false);
  ARCCOSH = $ElementName(new ElementName, 'arccosh', 'arccosh', 0, false, false, false);
  ARCCOTH = $ElementName(new ElementName, 'arccoth', 'arccoth', 0, false, false, false);
  ACRONYM = $ElementName(new ElementName, 'acronym', 'acronym', 0, false, false, false);
  ADDRESS = $ElementName(new ElementName, 'address', 'address', 51, true, false, false);
  BGSOUND = $ElementName(new ElementName, 'bgsound', 'bgsound', 16, true, false, false);
  COMMAND = $ElementName(new ElementName, 'command', 'command', 54, true, false, false);
  COMPOSE = $ElementName(new ElementName, 'compose', 'compose', 0, false, false, false);
  CEILING = $ElementName(new ElementName, 'ceiling', 'ceiling', 0, false, false, false);
  CSYMBOL = $ElementName(new ElementName, 'csymbol', 'csymbol', 0, false, false, false);
  CAPTION = $ElementName(new ElementName, 'caption', 'caption', 6, false, true, false);
  DISCARD = $ElementName(new ElementName, 'discard', 'discard', 0, false, false, false);
  DECLARE_0 = $ElementName(new ElementName, 'declare', 'declare', 0, false, false, false);
  DETAILS = $ElementName(new ElementName, 'details', 'details', 51, true, false, false);
  ELLIPSE = $ElementName(new ElementName, 'ellipse', 'ellipse', 0, false, false, false);
  FEFUNCA = $ElementName(new ElementName, 'fefunca', 'feFuncA', 0, false, false, false);
  FEFUNCB = $ElementName(new ElementName, 'fefuncb', 'feFuncB', 0, false, false, false);
  FEBLEND = $ElementName(new ElementName, 'feblend', 'feBlend', 0, false, false, false);
  FEFLOOD = $ElementName(new ElementName, 'feflood', 'feFlood', 0, false, false, false);
  FEIMAGE = $ElementName(new ElementName, 'feimage', 'feImage', 0, false, false, false);
  FEMERGE = $ElementName(new ElementName, 'femerge', 'feMerge', 0, false, false, false);
  FEFUNCG = $ElementName(new ElementName, 'fefuncg', 'feFuncG', 0, false, false, false);
  FEFUNCR = $ElementName(new ElementName, 'fefuncr', 'feFuncR', 0, false, false, false);
  HANDLER = $ElementName(new ElementName, 'handler', 'handler', 0, false, false, false);
  INVERSE = $ElementName(new ElementName, 'inverse', 'inverse', 0, false, false, false);
  IMPLIES = $ElementName(new ElementName, 'implies', 'implies', 0, false, false, false);
  ISINDEX = $ElementName(new ElementName, 'isindex', 'isindex', 14, true, false, false);
  LOGBASE = $ElementName(new ElementName, 'logbase', 'logbase', 0, false, false, false);
  LISTING = $ElementName(new ElementName, 'listing', 'listing', 44, true, false, false);
  MFENCED = $ElementName(new ElementName, 'mfenced', 'mfenced', 0, false, false, false);
  MPADDED = $ElementName(new ElementName, 'mpadded', 'mpadded', 0, false, false, false);
  MARQUEE = $ElementName(new ElementName, 'marquee', 'marquee', 43, false, true, false);
  MACTION = $ElementName(new ElementName, 'maction', 'maction', 0, false, false, false);
  MSUBSUP = $ElementName(new ElementName, 'msubsup', 'msubsup', 0, false, false, false);
  NOEMBED = $ElementName(new ElementName, 'noembed', 'noembed', 60, true, false, false);
  POLYGON = $ElementName(new ElementName, 'polygon', 'polygon', 0, false, false, false);
  PATTERN_0 = $ElementName(new ElementName, 'pattern', 'pattern', 0, false, false, false);
  PRODUCT = $ElementName(new ElementName, 'product', 'product', 0, false, false, false);
  SETDIFF = $ElementName(new ElementName, 'setdiff', 'setdiff', 0, false, false, false);
  SECTION = $ElementName(new ElementName, 'section', 'section', 51, true, false, false);
  TENDSTO = $ElementName(new ElementName, 'tendsto', 'tendsto', 0, false, false, false);
  UPLIMIT = $ElementName(new ElementName, 'uplimit', 'uplimit', 0, false, false, false);
  ALTGLYPH = $ElementName(new ElementName, 'altglyph', 'altGlyph', 0, false, false, false);
  BASEFONT = $ElementName(new ElementName, 'basefont', 'basefont', 16, true, false, false);
  CLIPPATH = $ElementName(new ElementName, 'clippath', 'clipPath', 0, false, false, false);
  CODOMAIN = $ElementName(new ElementName, 'codomain', 'codomain', 0, false, false, false);
  COLGROUP = $ElementName(new ElementName, 'colgroup', 'colgroup', 8, true, false, false);
  DATAGRID = $ElementName(new ElementName, 'datagrid', 'datagrid', 51, true, false, false);
  EMPTYSET = $ElementName(new ElementName, 'emptyset', 'emptyset', 0, false, false, false);
  FACTOROF = $ElementName(new ElementName, 'factorof', 'factorof', 0, false, false, false);
  FIELDSET = $ElementName(new ElementName, 'fieldset', 'fieldset', 61, true, false, false);
  FRAMESET = $ElementName(new ElementName, 'frameset', 'frameset', 11, true, false, false);
  FEOFFSET = $ElementName(new ElementName, 'feoffset', 'feOffset', 0, false, false, false);
  GLYPHREF_0 = $ElementName(new ElementName, 'glyphref', 'glyphRef', 0, false, false, false);
  INTERVAL = $ElementName(new ElementName, 'interval', 'interval', 0, false, false, false);
  INTEGERS = $ElementName(new ElementName, 'integers', 'integers', 0, false, false, false);
  INFINITY = $ElementName(new ElementName, 'infinity', 'infinity', 0, false, false, false);
  LISTENER = $ElementName(new ElementName, 'listener', 'listener', 0, false, false, false);
  LOWLIMIT = $ElementName(new ElementName, 'lowlimit', 'lowlimit', 0, false, false, false);
  METADATA = $ElementName(new ElementName, 'metadata', 'metadata', 0, false, false, false);
  MENCLOSE = $ElementName(new ElementName, 'menclose', 'menclose', 0, false, false, false);
  MPHANTOM = $ElementName(new ElementName, 'mphantom', 'mphantom', 0, false, false, false);
  NOFRAMES = $ElementName(new ElementName, 'noframes', 'noframes', 25, true, false, false);
  NOSCRIPT = $ElementName(new ElementName, 'noscript', 'noscript', 26, true, false, false);
  OPTGROUP = $ElementName(new ElementName, 'optgroup', 'optgroup', 27, true, false, false);
  POLYLINE = $ElementName(new ElementName, 'polyline', 'polyline', 0, false, false, false);
  PREFETCH = $ElementName(new ElementName, 'prefetch', 'prefetch', 0, false, false, false);
  PROGRESS = $ElementName(new ElementName, 'progress', 'progress', 0, false, false, false);
  PRSUBSET = $ElementName(new ElementName, 'prsubset', 'prsubset', 0, false, false, false);
  QUOTIENT = $ElementName(new ElementName, 'quotient', 'quotient', 0, false, false, false);
  SELECTOR = $ElementName(new ElementName, 'selector', 'selector', 0, false, false, false);
  TEXTAREA = $ElementName(new ElementName, 'textarea', 'textarea', 35, true, false, false);
  TEXTPATH = $ElementName(new ElementName, 'textpath', 'textPath', 0, false, false, false);
  VARIANCE = $ElementName(new ElementName, 'variance', 'variance', 0, false, false, false);
  ANIMATION = $ElementName(new ElementName, 'animation', 'animation', 0, false, false, false);
  CONJUGATE = $ElementName(new ElementName, 'conjugate', 'conjugate', 0, false, false, false);
  CONDITION = $ElementName(new ElementName, 'condition', 'condition', 0, false, false, false);
  COMPLEXES = $ElementName(new ElementName, 'complexes', 'complexes', 0, false, false, false);
  FONT_FACE = $ElementName(new ElementName, 'font-face', 'font-face', 0, false, false, false);
  FACTORIAL = $ElementName(new ElementName, 'factorial', 'factorial', 0, false, false, false);
  INTERSECT = $ElementName(new ElementName, 'intersect', 'intersect', 0, false, false, false);
  IMAGINARY = $ElementName(new ElementName, 'imaginary', 'imaginary', 0, false, false, false);
  LAPLACIAN = $ElementName(new ElementName, 'laplacian', 'laplacian', 0, false, false, false);
  MATRIXROW = $ElementName(new ElementName, 'matrixrow', 'matrixrow', 0, false, false, false);
  NOTSUBSET = $ElementName(new ElementName, 'notsubset', 'notsubset', 0, false, false, false);
  OTHERWISE = $ElementName(new ElementName, 'otherwise', 'otherwise', 0, false, false, false);
  PIECEWISE = $ElementName(new ElementName, 'piecewise', 'piecewise', 0, false, false, false);
  PLAINTEXT = $ElementName(new ElementName, 'plaintext', 'plaintext', 30, true, false, false);
  RATIONALS = $ElementName(new ElementName, 'rationals', 'rationals', 0, false, false, false);
  SEMANTICS = $ElementName(new ElementName, 'semantics', 'semantics', 0, false, false, false);
  TRANSPOSE = $ElementName(new ElementName, 'transpose', 'transpose', 0, false, false, false);
  ANNOTATION = $ElementName(new ElementName, 'annotation', 'annotation', 0, false, false, false);
  BLOCKQUOTE = $ElementName(new ElementName, 'blockquote', 'blockquote', 50, true, false, false);
  DIVERGENCE = $ElementName(new ElementName, 'divergence', 'divergence', 0, false, false, false);
  EULERGAMMA = $ElementName(new ElementName, 'eulergamma', 'eulergamma', 0, false, false, false);
  EQUIVALENT = $ElementName(new ElementName, 'equivalent', 'equivalent', 0, false, false, false);
  IMAGINARYI = $ElementName(new ElementName, 'imaginaryi', 'imaginaryi', 0, false, false, false);
  MALIGNMARK = $ElementName(new ElementName, 'malignmark', 'malignmark', 56, false, false, false);
  MUNDEROVER = $ElementName(new ElementName, 'munderover', 'munderover', 0, false, false, false);
  MLABELEDTR = $ElementName(new ElementName, 'mlabeledtr', 'mlabeledtr', 0, false, false, false);
  NOTANUMBER = $ElementName(new ElementName, 'notanumber', 'notanumber', 0, false, false, false);
  SOLIDCOLOR = $ElementName(new ElementName, 'solidcolor', 'solidcolor', 0, false, false, false);
  ALTGLYPHDEF = $ElementName(new ElementName, 'altglyphdef', 'altGlyphDef', 0, false, false, false);
  DETERMINANT = $ElementName(new ElementName, 'determinant', 'determinant', 0, false, false, false);
  FEMERGENODE = $ElementName(new ElementName, 'femergenode', 'feMergeNode', 0, false, false, false);
  FECOMPOSITE = $ElementName(new ElementName, 'fecomposite', 'feComposite', 0, false, false, false);
  FESPOTLIGHT = $ElementName(new ElementName, 'fespotlight', 'feSpotLight', 0, false, false, false);
  MALIGNGROUP = $ElementName(new ElementName, 'maligngroup', 'maligngroup', 0, false, false, false);
  MPRESCRIPTS = $ElementName(new ElementName, 'mprescripts', 'mprescripts', 0, false, false, false);
  MOMENTABOUT = $ElementName(new ElementName, 'momentabout', 'momentabout', 0, false, false, false);
  NOTPRSUBSET = $ElementName(new ElementName, 'notprsubset', 'notprsubset', 0, false, false, false);
  PARTIALDIFF = $ElementName(new ElementName, 'partialdiff', 'partialdiff', 0, false, false, false);
  ALTGLYPHITEM = $ElementName(new ElementName, 'altglyphitem', 'altGlyphItem', 0, false, false, false);
  ANIMATECOLOR = $ElementName(new ElementName, 'animatecolor', 'animateColor', 0, false, false, false);
  DATATEMPLATE = $ElementName(new ElementName, 'datatemplate', 'datatemplate', 0, false, false, false);
  EXPONENTIALE = $ElementName(new ElementName, 'exponentiale', 'exponentiale', 0, false, false, false);
  FETURBULENCE = $ElementName(new ElementName, 'feturbulence', 'feTurbulence', 0, false, false, false);
  FEPOINTLIGHT = $ElementName(new ElementName, 'fepointlight', 'fePointLight', 0, false, false, false);
  FEMORPHOLOGY = $ElementName(new ElementName, 'femorphology', 'feMorphology', 0, false, false, false);
  OUTERPRODUCT = $ElementName(new ElementName, 'outerproduct', 'outerproduct', 0, false, false, false);
  ANIMATEMOTION = $ElementName(new ElementName, 'animatemotion', 'animateMotion', 0, false, false, false);
  COLOR_PROFILE_0 = $ElementName(new ElementName, 'color-profile', 'color-profile', 0, false, false, false);
  FONT_FACE_SRC = $ElementName(new ElementName, 'font-face-src', 'font-face-src', 0, false, false, false);
  FONT_FACE_URI = $ElementName(new ElementName, 'font-face-uri', 'font-face-uri', 0, false, false, false);
  FOREIGNOBJECT = $ElementName(new ElementName, 'foreignobject', 'foreignObject', 59, false, false, false);
  FECOLORMATRIX = $ElementName(new ElementName, 'fecolormatrix', 'feColorMatrix', 0, false, false, false);
  MISSING_GLYPH = $ElementName(new ElementName, 'missing-glyph', 'missing-glyph', 0, false, false, false);
  MMULTISCRIPTS = $ElementName(new ElementName, 'mmultiscripts', 'mmultiscripts', 0, false, false, false);
  SCALARPRODUCT = $ElementName(new ElementName, 'scalarproduct', 'scalarproduct', 0, false, false, false);
  VECTORPRODUCT = $ElementName(new ElementName, 'vectorproduct', 'vectorproduct', 0, false, false, false);
  ANNOTATION_XML = $ElementName(new ElementName, 'annotation-xml', 'annotation-xml', 58, false, false, false);
  DEFINITION_SRC = $ElementName(new ElementName, 'definition-src', 'definition-src', 0, false, false, false);
  FONT_FACE_NAME = $ElementName(new ElementName, 'font-face-name', 'font-face-name', 0, false, false, false);
  FEGAUSSIANBLUR = $ElementName(new ElementName, 'fegaussianblur', 'feGaussianBlur', 0, false, false, false);
  FEDISTANTLIGHT = $ElementName(new ElementName, 'fedistantlight', 'feDistantLight', 0, false, false, false);
  LINEARGRADIENT = $ElementName(new ElementName, 'lineargradient', 'linearGradient', 0, false, false, false);
  NATURALNUMBERS = $ElementName(new ElementName, 'naturalnumbers', 'naturalnumbers', 0, false, false, false);
  RADIALGRADIENT = $ElementName(new ElementName, 'radialgradient', 'radialGradient', 0, false, false, false);
  ANIMATETRANSFORM = $ElementName(new ElementName, 'animatetransform', 'animateTransform', 0, false, false, false);
  CARTESIANPRODUCT = $ElementName(new ElementName, 'cartesianproduct', 'cartesianproduct', 0, false, false, false);
  FONT_FACE_FORMAT = $ElementName(new ElementName, 'font-face-format', 'font-face-format', 0, false, false, false);
  FECONVOLVEMATRIX = $ElementName(new ElementName, 'feconvolvematrix', 'feConvolveMatrix', 0, false, false, false);
  FEDIFFUSELIGHTING = $ElementName(new ElementName, 'fediffuselighting', 'feDiffuseLighting', 0, false, false, false);
  FEDISPLACEMENTMAP = $ElementName(new ElementName, 'fedisplacementmap', 'feDisplacementMap', 0, false, false, false);
  FESPECULARLIGHTING = $ElementName(new ElementName, 'fespecularlighting', 'feSpecularLighting', 0, false, false, false);
  DOMAINOFAPPLICATION = $ElementName(new ElementName, 'domainofapplication', 'domainofapplication', 0, false, false, false);
  FECOMPONENTTRANSFER = $ElementName(new ElementName, 'fecomponenttransfer', 'feComponentTransfer', 0, false, false, false);
  ELEMENT_NAMES = initValues(_3Lnu_validator_htmlparser_impl_ElementName_2_classLit, 61, 14, [A, B, G, I, P, Q, S, U, BR, CI, CN, DD, DL, DT, EM, EQ, FN, H1, H2, H3, H4, H5, H6, GT, HR, IN_0, LI, LN, LT, MI, MN, MO, MS, OL, OR, PI, RP, RT_0, TD, TH, TR, TT, UL, AND, ARG, ABS, BIG, BDO, CSC, COL, COS, COT, DEL, DFN, DIR_0, DIV, EXP, GCD, GEQ, IMG, INS, INT, KBD, LOG, LCM, LEQ, MTD, MIN_0, MAP, MTR, MAX_0, NEQ, NOT, NAV, PRE, REM, SUB, SEC, SVG, SUM, SIN, SEP, SUP, SET, TAN, USE, VAR, WBR, XMP, XOR, AREA, ABBR_0, BASE_0, BVAR, BODY, CARD, CODE_0, CITE_0, CSCH, COSH, COTH, CURL, DESC, DIFF, DEFS, FORM_0, FONT, GRAD, HEAD, HTML_0, LINE, LINK_0, LIST_0, META, MSUB, MODE_0, MATH, MARK, MASK_0, MEAN, MSUP, MENU, MROW, NONE, NOBR, NEST, PATH_0, PLUS, RULE, REAL, RELN, RECT, ROOT, RUBY, SECH, SINH, SPAN_0, SAMP, STOP, SDEV, TIME, TRUE, TREF, TANH, TEXT_0, VIEW, ASIDE, AUDIO, APPLY, EMBED, FRAME_0, FALSE, FLOOR, GLYPH, HKERN, IMAGE, IDENT, INPUT, LABEL_0, LIMIT, MFRAC, MPATH, METER, MOVER, MINUS, MROOT, MSQRT, MTEXT, NOTIN, PIECE, PARAM, POWER, REALS, STYLE_0, SMALL, THEAD, TABLE, TITLE_0, TSPAN, TIMES, TFOOT, TBODY, UNION, VKERN, VIDEO, ARCSEC, ARCCSC, ARCTAN, ARCSIN, ARCCOS, APPLET, ARCCOT, APPROX, BUTTON, CIRCLE, CENTER, CURSOR_0, CANVAS, DIVIDE, DEGREE, DOMAIN, EXISTS, FETILE, FIGURE, FORALL, FILTER_0, FOOTER, HGROUP, HEADER, IFRAME, KEYGEN, LAMBDA, LEGEND, MSPACE, MTABLE, MSTYLE, MGLYPH, MEDIAN, MUNDER, MARKER, MERROR, MOMENT, MATRIX, OPTION, OBJECT_0, OUTPUT, PRIMES, SOURCE, STRIKE, STRONG, SWITCH, SYMBOL, SPACER, SELECT, SUBSET, SCRIPT, TBREAK, VECTOR, ARTICLE, ANIMATE, ARCSECH, ARCCSCH, ARCTANH, ARCSINH, ARCCOSH, ARCCOTH, ACRONYM, ADDRESS, BGSOUND, COMMAND, COMPOSE, CEILING, CSYMBOL, CAPTION, DISCARD, DECLARE_0, DETAILS, ELLIPSE, FEFUNCA, FEFUNCB, FEBLEND, FEFLOOD, FEIMAGE, FEMERGE, FEFUNCG, FEFUNCR, HANDLER, INVERSE, IMPLIES, ISINDEX, LOGBASE, LISTING, MFENCED, MPADDED, MARQUEE, MACTION, MSUBSUP, NOEMBED, POLYGON, PATTERN_0, PRODUCT, SETDIFF, SECTION, TENDSTO, UPLIMIT, ALTGLYPH, BASEFONT, CLIPPATH, CODOMAIN, COLGROUP, DATAGRID, EMPTYSET, FACTOROF, FIELDSET, FRAMESET, FEOFFSET, GLYPHREF_0, INTERVAL, INTEGERS, INFINITY, LISTENER, LOWLIMIT, METADATA, MENCLOSE, MPHANTOM, NOFRAMES, NOSCRIPT, OPTGROUP, POLYLINE, PREFETCH, PROGRESS, PRSUBSET, QUOTIENT, SELECTOR, TEXTAREA, TEXTPATH, VARIANCE, ANIMATION, CONJUGATE, CONDITION, COMPLEXES, FONT_FACE, FACTORIAL, INTERSECT, IMAGINARY, LAPLACIAN, MATRIXROW, NOTSUBSET, OTHERWISE, PIECEWISE, PLAINTEXT, RATIONALS, SEMANTICS, TRANSPOSE, ANNOTATION, BLOCKQUOTE, DIVERGENCE, EULERGAMMA, EQUIVALENT, IMAGINARYI, MALIGNMARK, MUNDEROVER, MLABELEDTR, NOTANUMBER, SOLIDCOLOR, ALTGLYPHDEF, DETERMINANT, FEMERGENODE, FECOMPOSITE, FESPOTLIGHT, MALIGNGROUP, MPRESCRIPTS, MOMENTABOUT, NOTPRSUBSET, PARTIALDIFF, ALTGLYPHITEM, ANIMATECOLOR, DATATEMPLATE, EXPONENTIALE, FETURBULENCE, FEPOINTLIGHT, FEMORPHOLOGY, OUTERPRODUCT, ANIMATEMOTION, COLOR_PROFILE_0, FONT_FACE_SRC, FONT_FACE_URI, FOREIGNOBJECT, FECOLORMATRIX, MISSING_GLYPH, MMULTISCRIPTS, SCALARPRODUCT, VECTORPRODUCT, ANNOTATION_XML, DEFINITION_SRC, FONT_FACE_NAME, FEGAUSSIANBLUR, FEDISTANTLIGHT, LINEARGRADIENT, NATURALNUMBERS, RADIALGRADIENT, ANIMATETRANSFORM, CARTESIANPRODUCT, FONT_FACE_FORMAT, FECONVOLVEMATRIX, FEDIFFUSELIGHTING, FEDISPLACEMENTMAP, FESPECULARLIGHTING, DOMAINOFAPPLICATION, FECOMPONENTTRANSFER]);
  ELEMENT_HASHES = initValues(_3I_classLit, 49, -1, [1057, 1090, 1255, 1321, 1552, 1585, 1651, 1717, 68162, 68899, 69059, 69764, 70020, 70276, 71077, 71205, 72134, 72232, 72264, 72296, 72328, 72360, 72392, 73351, 74312, 75209, 78124, 78284, 78476, 79149, 79309, 79341, 79469, 81295, 81487, 82224, 84498, 84626, 86164, 86292, 86612, 86676, 87445, 3183041, 3186241, 3198017, 3218722, 3226754, 3247715, 3256803, 3263971, 3264995, 3289252, 3291332, 3295524, 3299620, 3326725, 3379303, 3392679, 3448233, 3460553, 3461577, 3510347, 3546604, 3552364, 3556524, 3576461, 3586349, 3588141, 3590797, 3596333, 3622062, 3625454, 3627054, 3675728, 3749042, 3771059, 3771571, 3776211, 3782323, 3782963, 3784883, 3785395, 3788979, 3815476, 3839605, 3885110, 3917911, 3948984, 3951096, 135304769, 135858241, 136498210, 136906434, 137138658, 137512995, 137531875, 137548067, 137629283, 137645539, 137646563, 137775779, 138529956, 138615076, 139040932, 140954086, 141179366, 141690439, 142738600, 143013512, 146979116, 147175724, 147475756, 147902637, 147936877, 148017645, 148131885, 148228141, 148229165, 148309165, 148395629, 148551853, 148618829, 149076462, 149490158, 149572782, 151277616, 151639440, 153268914, 153486514, 153563314, 153750706, 153763314, 153914034, 154406067, 154417459, 154600979, 154678323, 154680979, 154866835, 155366708, 155375188, 155391572, 155465780, 155869364, 158045494, 168988979, 169321621, 169652752, 173151309, 174240818, 174247297, 174669292, 175391532, 176638123, 177380397, 177879204, 177886734, 180753473, 181020073, 181503558, 181686320, 181999237, 181999311, 182048201, 182074866, 182078003, 182083764, 182920847, 184716457, 184976961, 185145071, 187281445, 187872052, 188100653, 188875944, 188919873, 188920457, 189203987, 189371817, 189414886, 189567458, 190266670, 191318187, 191337609, 202479203, 202493027, 202835587, 202843747, 203013219, 203036048, 203045987, 203177552, 203898516, 204648562, 205067918, 205078130, 205096654, 205689142, 205690439, 205988909, 207213161, 207794484, 207800999, 208023602, 208213644, 208213647, 210261490, 210310273, 210940978, 213325049, 213946445, 214055079, 215125040, 215134273, 215135028, 215237420, 215418148, 215553166, 215553394, 215563858, 215627949, 215754324, 217529652, 217713834, 217732628, 218731945, 221417045, 221424946, 221493746, 221515401, 221658189, 221844577, 221908140, 221910626, 221921586, 222659762, 225001091, 236105833, 236113965, 236194995, 236195427, 236206132, 236206387, 236211683, 236212707, 236381647, 236571826, 237124271, 238172205, 238210544, 238270764, 238435405, 238501172, 239224867, 239257644, 239710497, 240307721, 241208789, 241241557, 241318060, 241319404, 241343533, 241344069, 241405397, 241765845, 243864964, 244502085, 244946220, 245109902, 247647266, 247707956, 248648814, 248648836, 248682161, 248986932, 249058914, 249697357, 252132601, 252135604, 252317348, 255007012, 255278388, 256365156, 257566121, 269763372, 271202790, 271863856, 272049197, 272127474, 272770631, 274339449, 274939471, 275388004, 275388005, 275388006, 275977800, 278267602, 278513831, 278712622, 281613765, 281683369, 282120228, 282250732, 282508942, 283743649, 283787570, 284710386, 285391148, 285478533, 285854898, 285873762, 286931113, 288964227, 289445441, 289689648, 291671489, 303512884, 305319975, 305610036, 305764101, 308448294, 308675890, 312085683, 312264750, 315032867, 316391000, 317331042, 317902135, 318950711, 319447220, 321499182, 322538804, 323145200, 337067316, 337826293, 339905989, 340833697, 341457068, 345302593, 349554733, 349771471, 349786245, 350819405, 356072847, 370349192, 373962798, 375558638, 375574835, 376053993, 383276530, 383373833, 383407586, 384439906, 386079012, 404133513, 404307343, 407031852, 408072233, 409112005, 409608425, 409771500, 419040932, 437730612, 439529766, 442616365, 442813037, 443157674, 443295316, 450118444, 450482697, 456789668, 459935396, 471217869, 474073645, 476230702, 476665218, 476717289, 483014825, 485083298, 489306281, 538364390, 540675748, 543819186, 543958612, 576960820, 577242548, 610515252, 642202932, 644420819]);
}

function $ElementName(this$static, name_0, camelCaseName, group, special, scoping, fosterParenting){
  $clinit_125();
  this$static.name_0 = name_0;
  this$static.camelCaseName = camelCaseName;
  this$static.group = group;
  this$static.special = special;
  this$static.scoping = scoping;
  this$static.fosterParenting = fosterParenting;
  this$static.custom = false;
  return this$static;
}

function $ElementName_0(this$static, name_0){
  $clinit_125();
  this$static.name_0 = name_0;
  this$static.camelCaseName = name_0;
  this$static.group = 0;
  this$static.special = false;
  this$static.scoping = false;
  this$static.fosterParenting = false;
  this$static.custom = true;
  return this$static;
}

function bufToHash_0(buf, len){
  var hash, i, j;
  hash = len;
  hash <<= 5;
  hash += buf[0] - 96;
  j = len;
  for (i = 0; i < 4 && j > 0; ++i) {
    --j;
    hash <<= 5;
    hash += buf[j] - 96;
  }
  return hash;
}

function elementNameByBuffer(buf, offset, length_0){
  var end, end_0;
  $clinit_125();
  var elementName, hash, index, name_0;
  hash = bufToHash_0(buf, length_0);
  index = binarySearch(ELEMENT_HASHES, hash);
  if (index < 0) {
    return $ElementName_0(new ElementName, String((end = offset + length_0 , __checkBounds(buf.length, offset, end) , __valueOf(buf, offset, end))));
  }
   else {
    elementName = ELEMENT_NAMES[index];
    name_0 = elementName.name_0;
    if (!localEqualsBuffer(name_0, buf, offset, length_0)) {
      return $ElementName_0(new ElementName, String((end_0 = offset + length_0 , __checkBounds(buf.length, offset, end_0) , __valueOf(buf, offset, end_0))));
    }
    return elementName;
  }
}

function getClass_68(){
  return Lnu_validator_htmlparser_impl_ElementName_2_classLit;
}

function ElementName(){
}

_ = ElementName.prototype = new Object_0;
_.getClass$ = getClass_68;
_.typeId$ = 40;
_.camelCaseName = null;
_.custom = false;
_.fosterParenting = false;
_.group = 0;
_.name_0 = null;
_.scoping = false;
_.special = false;
var A, ABBR_0, ABS, ACRONYM, ADDRESS, ALTGLYPH, ALTGLYPHDEF, ALTGLYPHITEM, AND, ANIMATE, ANIMATECOLOR, ANIMATEMOTION, ANIMATETRANSFORM, ANIMATION, ANNOTATION, ANNOTATION_XML, APPLET, APPLY, APPROX, ARCCOS, ARCCOSH, ARCCOT, ARCCOTH, ARCCSC, ARCCSCH, ARCSEC, ARCSECH, ARCSIN, ARCSINH, ARCTAN, ARCTANH, AREA, ARG, ARTICLE, ASIDE, AUDIO, B, BASE_0, BASEFONT, BDO, BGSOUND, BIG, BLOCKQUOTE, BODY, BR, BUTTON, BVAR, CANVAS, CAPTION, CARD, CARTESIANPRODUCT, CEILING, CENTER, CI, CIRCLE, CITE_0, CLIPPATH, CN, CODE_0, CODOMAIN, COL, COLGROUP, COLOR_PROFILE_0, COMMAND, COMPLEXES, COMPOSE, CONDITION, CONJUGATE, COS, COSH, COT, COTH, CSC, CSCH, CSYMBOL, CURL, CURSOR_0, DATAGRID, DATATEMPLATE, DD, DECLARE_0, DEFINITION_SRC, DEFS, DEGREE, DEL, DESC, DETAILS, DETERMINANT, DFN, DIFF, DIR_0, DISCARD, DIV, DIVERGENCE, DIVIDE, DL, DOMAIN, DOMAINOFAPPLICATION, DT, ELEMENT_HASHES, ELEMENT_NAMES, ELLIPSE, EM, EMBED, EMPTYSET, EQ, EQUIVALENT, EULERGAMMA, EXISTS, EXP, EXPONENTIALE, FACTORIAL, FACTOROF, FALSE, FEBLEND, FECOLORMATRIX, FECOMPONENTTRANSFER, FECOMPOSITE, FECONVOLVEMATRIX, FEDIFFUSELIGHTING, FEDISPLACEMENTMAP, FEDISTANTLIGHT, FEFLOOD, FEFUNCA, FEFUNCB, FEFUNCG, FEFUNCR, FEGAUSSIANBLUR, FEIMAGE, FEMERGE, FEMERGENODE, FEMORPHOLOGY, FEOFFSET, FEPOINTLIGHT, FESPECULARLIGHTING, FESPOTLIGHT, FETILE, FETURBULENCE, FIELDSET, FIGURE, FILTER_0, FLOOR, FN, FONT, FONT_FACE, FONT_FACE_FORMAT, FONT_FACE_NAME, FONT_FACE_SRC, FONT_FACE_URI, FOOTER, FORALL, FOREIGNOBJECT, FORM_0, FRAME_0, FRAMESET, G, GCD, GEQ, GLYPH, GLYPHREF_0, GRAD, GT, H1, H2, H3, H4, H5, H6, HANDLER, HEAD, HEADER, HGROUP, HKERN, HR, HTML_0, I, IDENT, IFRAME, IMAGE, IMAGINARY, IMAGINARYI, IMG, IMPLIES, IN_0, INFINITY, INPUT, INS, INT, INTEGERS, INTERSECT, INTERVAL, INVERSE, ISINDEX, KBD, KEYGEN, LABEL_0, LAMBDA, LAPLACIAN, LCM, LEGEND, LEQ, LI, LIMIT, LINE, LINEARGRADIENT, LINK_0, LIST_0, LISTENER, LISTING, LN, LOG, LOGBASE, LOWLIMIT, LT, MACTION, MALIGNGROUP, MALIGNMARK, MAP, MARK, MARKER, MARQUEE, MASK_0, MATH, MATRIX, MATRIXROW, MAX_0, MEAN, MEDIAN, MENCLOSE, MENU, MERROR, META, METADATA, METER, MFENCED, MFRAC, MGLYPH, MI, MIN_0, MINUS, MISSING_GLYPH, MLABELEDTR, MMULTISCRIPTS, MN, MO, MODE_0, MOMENT, MOMENTABOUT, MOVER, MPADDED, MPATH, MPHANTOM, MPRESCRIPTS, MROOT, MROW, MS, MSPACE, MSQRT, MSTYLE, MSUB, MSUBSUP, MSUP, MTABLE, MTD, MTEXT, MTR, MUNDER, MUNDEROVER, NATURALNUMBERS, NAV, NEQ, NEST, NOBR, NOEMBED, NOFRAMES, NONE, NOSCRIPT, NOT, NOTANUMBER, NOTIN, NOTPRSUBSET, NOTSUBSET, OBJECT_0, OL, OPTGROUP, OPTION, OR, OTHERWISE, OUTERPRODUCT, OUTPUT, P, PARAM, PARTIALDIFF, PATH_0, PATTERN_0, PI, PIECE, PIECEWISE, PLAINTEXT, PLUS, POLYGON, POLYLINE, POWER, PRE, PREFETCH, PRIMES, PRODUCT, PROGRESS, PRSUBSET, Q, QUOTIENT, RADIALGRADIENT, RATIONALS, REAL, REALS, RECT, RELN, REM, ROOT, RP, RT_0, RUBY, RULE, S, SAMP, SCALARPRODUCT, SCRIPT, SDEV, SEC, SECH, SECTION, SELECT, SELECTOR, SEMANTICS, SEP, SET, SETDIFF, SIN, SINH, SMALL, SOLIDCOLOR, SOURCE, SPACER, SPAN_0, STOP, STRIKE, STRONG, STYLE_0, SUB, SUBSET, SUM, SUP, SVG, SWITCH, SYMBOL, TABLE, TAN, TANH, TBODY, TBREAK, TD, TENDSTO, TEXT_0, TEXTAREA, TEXTPATH, TFOOT, TH, THEAD, TIME, TIMES, TITLE_0, TR, TRANSPOSE, TREF, TRUE, TSPAN, TT, U, UL, UNION, UPLIMIT, USE, VAR, VARIANCE, VECTOR, VECTORPRODUCT, VIDEO, VIEW, VKERN, WBR, XMP, XOR;
function $clinit_126(){
  $clinit_126 = nullMethod;
  LT_GT = initValues(_3C_classLit, 47, -1, [60, 62]);
  LT_SOLIDUS = initValues(_3C_classLit, 47, -1, [60, 47]);
  RSQB_RSQB = initValues(_3C_classLit, 47, -1, [93, 93]);
  REPLACEMENT_CHARACTER_0 = initValues(_3C_classLit, 47, -1, [65533]);
  SPACE = initValues(_3C_classLit, 47, -1, [32]);
  LF = initValues(_3C_classLit, 47, -1, [10]);
  CDATA_LSQB = $toCharArray('CDATA[');
  OCTYPE = $toCharArray('octype');
  UBLIC = $toCharArray('ublic');
  YSTEM = $toCharArray('ystem');
  TITLE_ARR = initValues(_3C_classLit, 47, -1, [116, 105, 116, 108, 101]);
  SCRIPT_ARR = initValues(_3C_classLit, 47, -1, [115, 99, 114, 105, 112, 116]);
  STYLE_ARR = initValues(_3C_classLit, 47, -1, [115, 116, 121, 108, 101]);
  PLAINTEXT_ARR = initValues(_3C_classLit, 47, -1, [112, 108, 97, 105, 110, 116, 101, 120, 116]);
  XMP_ARR = initValues(_3C_classLit, 47, -1, [120, 109, 112]);
  TEXTAREA_ARR = initValues(_3C_classLit, 47, -1, [116, 101, 120, 116, 97, 114, 101, 97]);
  IFRAME_ARR = initValues(_3C_classLit, 47, -1, [105, 102, 114, 97, 109, 101]);
  NOEMBED_ARR = initValues(_3C_classLit, 47, -1, [110, 111, 101, 109, 98, 101, 100]);
  NOSCRIPT_ARR = initValues(_3C_classLit, 47, -1, [110, 111, 115, 99, 114, 105, 112, 116]);
  NOFRAMES_ARR = initValues(_3C_classLit, 47, -1, [110, 111, 102, 114, 97, 109, 101, 115]);
}

function $addAttributeWithValue(this$static){
  var val;
  this$static.metaBoundaryPassed && ($clinit_125() , META) == this$static.tagName && ($clinit_124() , CHARSET) == this$static.attributeName;
  if (this$static.attributeName) {
    val = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
    !this$static.endTag && this$static.html4 && this$static.html4ModeCompatibleWithXhtml1Schemata && $isCaseFolded(this$static.attributeName) && (val = newAsciiLowerCaseStringFromString(val));
    $addAttribute(this$static.attributes, this$static.attributeName, val, this$static.xmlnsPolicy);
    this$static.attributeName = null;
  }
}

function $addAttributeWithoutValue(this$static){
  this$static.metaBoundaryPassed && ($clinit_124() , CHARSET) == this$static.attributeName && ($clinit_125() , META) == this$static.tagName;
  if (this$static.attributeName) {
    if (this$static.html4) {
      $isBoolean(this$static.attributeName)?this$static.html4ModeCompatibleWithXhtml1Schemata?$addAttribute(this$static.attributes, this$static.attributeName, this$static.attributeName.local[0], this$static.xmlnsPolicy):$addAttribute(this$static.attributes, this$static.attributeName, '', this$static.xmlnsPolicy):$addAttribute(this$static.attributes, this$static.attributeName, '', this$static.xmlnsPolicy);
    }
     else {
      (($clinit_124() , SRC) == this$static.attributeName || HREF == this$static.attributeName) && $warn('Attribute \u201C' + this$static.attributeName.local[0] + '\u201D without an explicit value seen. The attribute may be dropped by IE7.');
      $addAttribute(this$static.attributes, this$static.attributeName, '', this$static.xmlnsPolicy);
    }
    this$static.attributeName = null;
  }
}

function $adjustDoubleHyphenAndAppendToLongStrBufAndErr(this$static, c){
  switch (this$static.commentPolicy.ordinal) {
    case 2:
      --this$static.longStrBufLen;
      $appendLongStrBuf(this$static, 32);
      $appendLongStrBuf(this$static, 45);
    case 0:
      $appendLongStrBuf(this$static, c);
      break;
    case 1:
      $fatal_1(this$static, 'The document is not mappable to XML 1.0 due to two consecutive hyphens in a comment.');
  }
}

function $appendLongStrBuf(this$static, c){
  var newBuf;
  if (this$static.longStrBufLen == this$static.longStrBuf.length) {
    newBuf = initDim(_3C_classLit, 47, -1, this$static.longStrBufLen + (this$static.longStrBufLen >> 1), 1);
    arraycopy(this$static.longStrBuf, 0, newBuf, 0, this$static.longStrBuf.length);
    this$static.longStrBuf = newBuf;
  }
  this$static.longStrBuf[this$static.longStrBufLen++] = c;
}

function $appendLongStrBuf_0(this$static, buffer, offset, length_0){
  var newBuf, reqLen;
  reqLen = this$static.longStrBufLen + length_0;
  if (this$static.longStrBuf.length < reqLen) {
    newBuf = initDim(_3C_classLit, 47, -1, reqLen + (reqLen >> 1), 1);
    arraycopy(this$static.longStrBuf, 0, newBuf, 0, this$static.longStrBuf.length);
    this$static.longStrBuf = newBuf;
  }
  arraycopy(buffer, offset, this$static.longStrBuf, this$static.longStrBufLen, length_0);
  this$static.longStrBufLen = reqLen;
}

function $appendSecondHyphenToBogusComment(this$static){
  switch (this$static.commentPolicy.ordinal) {
    case 2:
      $appendLongStrBuf(this$static, 32);
    case 0:
      $appendLongStrBuf(this$static, 45);
      break;
    case 1:
      $fatal_1(this$static, 'The document is not mappable to XML 1.0 due to two consecutive hyphens in a comment.');
  }
}

function $appendStrBuf(this$static, c){
  var newBuf;
  if (this$static.strBufLen == this$static.strBuf.length) {
    newBuf = initDim(_3C_classLit, 47, -1, this$static.strBuf.length + 1024, 1);
    arraycopy(this$static.strBuf, 0, newBuf, 0, this$static.strBuf.length);
    this$static.strBuf = newBuf;
  }
  this$static.strBuf[this$static.strBufLen++] = c;
}

function $attributeNameComplete(this$static){
  this$static.attributeName = nameByBuffer(this$static.strBuf, 0, this$static.strBufLen, this$static.namePolicy != ($clinit_115() , ALLOW));
  !this$static.attributes && (this$static.attributes = $HtmlAttributes(new HtmlAttributes, this$static.mappingLangToXmlLang));
  if ($contains(this$static.attributes, this$static.attributeName)) {
    $err('Duplicate attribute \u201C' + this$static.attributeName.local[0] + '\u201D.');
    this$static.attributeName = null;
  }
}

function $emitCarriageReturn(this$static, buf, pos){
  this$static.nextCharOnNewLine = true;
  this$static.lastCR = true;
  $flushChars(this$static, buf, pos);
  $characters(this$static.tokenHandler, LF, 0, 1);
  this$static.cstart = 2147483647;
}

function $emitCurrentTagToken(this$static, selfClosing, pos){
  var attrs;
  this$static.cstart = pos + 1;
  this$static.stateSave = 0;
  attrs = !this$static.attributes?($clinit_128() , EMPTY_ATTRIBUTES):this$static.attributes;
  this$static.endTag?$endTag(this$static.tokenHandler, this$static.tagName):$startTag(this$static.tokenHandler, this$static.tagName, attrs, selfClosing);
  this$static.tagName = null;
  this$static.newAttributesEachTime?(this$static.attributes = null):$clear_0(this$static.attributes, this$static.mappingLangToXmlLang);
  return this$static.stateSave;
}

function $emitDoctypeToken(this$static, pos){
  this$static.cstart = pos + 1;
  $doctype(this$static.tokenHandler, this$static.doctypeName, this$static.publicIdentifier, this$static.systemIdentifier, this$static.forceQuirks);
  this$static.doctypeName = null;
  this$static.publicIdentifier = null;
  this$static.systemIdentifier = null;
}

function $emitOrAppendOne(this$static, val, returnState){
  (returnState & -2) != 0?$appendLongStrBuf(this$static, val[0]):$characters(this$static.tokenHandler, val, 0, 1);
}

function $emitOrAppendTwo(this$static, val, returnState){
  if ((returnState & -2) != 0) {
    $appendLongStrBuf(this$static, val[0]);
    $appendLongStrBuf(this$static, val[1]);
  }
   else {
    $characters(this$static.tokenHandler, val, 0, 2);
  }
}

function $emitStrBuf(this$static){
  this$static.strBufLen > 0 && $characters(this$static.tokenHandler, this$static.strBuf, 0, this$static.strBufLen);
}

function $emptyAttributes(this$static){
  if (this$static.newAttributesEachTime) {
    return $HtmlAttributes(new HtmlAttributes, this$static.mappingLangToXmlLang);
  }
   else {
    return $clinit_128() , EMPTY_ATTRIBUTES;
  }
}

function $end(this$static){
  this$static.strBuf = null;
  this$static.longStrBuf = null;
  this$static.doctypeName = null;
  this$static.systemIdentifier != null && (this$static.systemIdentifier = null);
  this$static.publicIdentifier != null && (this$static.publicIdentifier = null);
  !!this$static.tagName && (this$static.tagName = null);
  !!this$static.attributeName && (this$static.attributeName = null);
  $endTokenization(this$static.tokenHandler);
  if (this$static.attributes) {
    $clear_0(this$static.attributes, this$static.mappingLangToXmlLang);
    this$static.attributes = null;
  }
}

function $endTagExpectationToArray(this$static){
  switch (this$static.endTagExpectation.group) {
    case 36:
      this$static.endTagExpectationAsArray = TITLE_ARR;
      return;
    case 31:
      this$static.endTagExpectationAsArray = SCRIPT_ARR;
      return;
    case 33:
      this$static.endTagExpectationAsArray = STYLE_ARR;
      return;
    case 30:
      this$static.endTagExpectationAsArray = PLAINTEXT_ARR;
      return;
    case 38:
      this$static.endTagExpectationAsArray = XMP_ARR;
      return;
    case 35:
      this$static.endTagExpectationAsArray = TEXTAREA_ARR;
      return;
    case 47:
      this$static.endTagExpectationAsArray = IFRAME_ARR;
      return;
    case 60:
      this$static.endTagExpectationAsArray = NOEMBED_ARR;
      return;
    case 26:
      this$static.endTagExpectationAsArray = NOSCRIPT_ARR;
      return;
    case 25:
      this$static.endTagExpectationAsArray = NOFRAMES_ARR;
      return;
    default:return;
  }
}

function $eof_0(this$static){
  var candidateArr, ch, i, returnState, state, val;
  state = this$static.stateSave;
  returnState = this$static.returnStateSave;
  eofloop: for (;;) {
    switch (state) {
      case 53:
      case 65:
        $characters(this$static.tokenHandler, LT_GT, 0, 1);
        break eofloop;
      case 4:
        $characters(this$static.tokenHandler, LT_GT, 0, 1);
        break eofloop;
      case 61:
        $characters(this$static.tokenHandler, LT_GT, 0, 1);
        break eofloop;
      case 37:
        $characters(this$static.tokenHandler, LT_SOLIDUS, 0, 2);
        $emitStrBuf(this$static);
        break eofloop;
      case 5:
        $characters(this$static.tokenHandler, LT_SOLIDUS, 0, 2);
        break eofloop;
      case 6:
        break eofloop;
      case 7:
      case 14:
      case 48:
        break eofloop;
      case 8:
        break eofloop;
      case 9:
      case 10:
        break eofloop;
      case 11:
      case 12:
      case 13:
        break eofloop;
      case 15:
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
        this$static.cstart = 1;
        break eofloop;
      case 59:
        $maybeAppendSpaceToBogusComment(this$static);
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
        this$static.cstart = 1;
        break eofloop;
      case 16:
        this$static.longStrBufLen = 0;
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
        this$static.cstart = 1;
        break eofloop;
      case 38:
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
        this$static.cstart = 1;
        break eofloop;
      case 39:
        if (this$static.index < 6) {
          this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
          this$static.cstart = 1;
        }
         else {
          this$static.doctypeName = '';
          this$static.systemIdentifier != null && (this$static.systemIdentifier = null);
          this$static.publicIdentifier != null && (this$static.publicIdentifier = null);
          this$static.forceQuirks = true;
          $emitDoctypeToken(this$static, 0);
          break eofloop;
        }

        break eofloop;
      case 30:
      case 32:
      case 35:
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
        this$static.cstart = 1;
        break eofloop;
      case 34:
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 2);
        this$static.cstart = 1;
        break eofloop;
      case 33:
      case 31:
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 1);
        this$static.cstart = 1;
        break eofloop;
      case 36:
        this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 3);
        this$static.cstart = 1;
        break eofloop;
      case 17:
      case 18:
        this$static.forceQuirks = true;
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 19:
        this$static.doctypeName = String(valueOf_0(this$static.strBuf, 0, this$static.strBufLen));
        this$static.forceQuirks = true;
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 40:
      case 41:
      case 20:
      case 62:
      case 64:
      case 21:
        this$static.forceQuirks = true;
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 22:
      case 23:
        this$static.forceQuirks = true;
        this$static.publicIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 24:
      case 25:
      case 63:
        this$static.forceQuirks = true;
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 26:
      case 27:
        this$static.forceQuirks = true;
        this$static.systemIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 28:
        this$static.forceQuirks = true;
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 29:
        $emitDoctypeToken(this$static, 0);
        break eofloop;
      case 42:
        (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
        state = returnState;
        continue;
      case 72:
        (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
        state = returnState;
        continue;
      case 44:
        outer: for (;;) {
          ++this$static.entCol;
          hiloop: for (;;) {
            if (this$static.hi == -1) {
              break hiloop;
            }
            if (this$static.entCol == ($clinit_131() , NAMES)[this$static.hi].length) {
              break hiloop;
            }
            if (this$static.entCol > NAMES[this$static.hi].length) {
              break outer;
            }
             else if (0 < NAMES[this$static.hi][this$static.entCol]) {
              --this$static.hi;
            }
             else {
              break hiloop;
            }
          }
          loloop: for (;;) {
            if (this$static.hi < this$static.lo) {
              break outer;
            }
            if (this$static.entCol == ($clinit_131() , NAMES)[this$static.lo].length) {
              this$static.candidate = this$static.lo;
              this$static.strBufMark = this$static.strBufLen;
              ++this$static.lo;
            }
             else if (this$static.entCol > NAMES[this$static.lo].length) {
              break outer;
            }
             else if (0 > NAMES[this$static.lo][this$static.entCol]) {
              ++this$static.lo;
            }
             else {
              break loloop;
            }
          }
          if (this$static.hi < this$static.lo) {
            break outer;
          }
          continue;
        }

        if (this$static.candidate == -1) {
          (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
          state = returnState;
          continue eofloop;
        }
         else {
          candidateArr = ($clinit_131() , NAMES)[this$static.candidate];
          if (candidateArr.length == 0 || candidateArr[candidateArr.length - 1] != 59) {
            if ((returnState & -2) != 0) {
              this$static.strBufMark == this$static.strBufLen?(ch = 0):(ch = this$static.strBuf[this$static.strBufMark]);
              if (ch >= 48 && ch <= 57 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122) {
                $appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen);
                state = returnState;
                continue eofloop;
              }
            }
          }
          val = VALUES_0[this$static.candidate];
          (val[0] & 64512) == 55296?$emitOrAppendTwo(this$static, val, returnState):((returnState & -2) != 0?$appendLongStrBuf(this$static, val[0]):$characters(this$static.tokenHandler, val, 0, 1) , undefined);
          if (this$static.strBufMark < this$static.strBufLen) {
            if ((returnState & -2) != 0) {
              for (i = this$static.strBufMark; i < this$static.strBufLen; ++i) {
                $appendLongStrBuf(this$static, this$static.strBuf[i]);
              }
            }
             else {
              $characters(this$static.tokenHandler, this$static.strBuf, this$static.strBufMark, this$static.strBufLen - this$static.strBufMark);
            }
          }
          state = returnState;
          continue eofloop;
        }

      case 43:
      case 46:
      case 45:
        if (!this$static.seenDigits) {
          $err('No digits after \u201C' + valueOf_0(this$static.strBuf, 0, this$static.strBufLen) + '\u201D.');
          (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
          state = returnState;
          continue;
        }

        $handleNcrValue(this$static, returnState);
        state = returnState;
        continue;
      case 0:
      default:break eofloop;
    }
  }
  $eof(this$static.tokenHandler);
  return;
}

function $err(){
  return;
}

function $fatal_1(this$static, message){
  var spe;
  spe = $SAXParseException(new SAXParseException, message, this$static);
  throw spe;
}

function $handleNcrValue(this$static, returnState){
  var ch, val;
  if (this$static.value <= 65535) {
    if (this$static.value >= 128 && this$static.value <= 159) {
      val = ($clinit_131() , WINDOWS_1252)[this$static.value - 128];
      (returnState & -2) != 0?$appendLongStrBuf(this$static, val[0]):$characters(this$static.tokenHandler, val, 0, 1);
    }
     else if (this$static.value == 12 && this$static.contentSpacePolicy != ($clinit_115() , ALLOW)) {
      this$static.contentSpacePolicy == ($clinit_115() , ALTER_INFOSET)?$emitOrAppendOne(this$static, SPACE, returnState):this$static.contentSpacePolicy == FATAL && $fatal_1(this$static, 'A character reference expanded to a form feed which is not legal XML 1.0 white space.');
    }
     else if (this$static.value == 0) {
      $emitOrAppendOne(this$static, REPLACEMENT_CHARACTER_0, returnState);
    }
     else if ((this$static.value & 63488) == 55296) {
      $emitOrAppendOne(this$static, REPLACEMENT_CHARACTER_0, returnState);
    }
     else {
      ch = this$static.value & 65535;
      this$static.value == 13 || (this$static.value <= 8 || this$static.value == 11 || this$static.value >= 14 && this$static.value <= 31?(ch = $errNcrControlChar(this$static, ch)):this$static.value >= 64976 && this$static.value <= 65007 || ((this$static.value & 65534) == 65534?(ch = $errNcrNonCharacter(this$static, ch)):this$static.value >= 127 && this$static.value <= 159 && $err('Character reference expands to a control character (' + $toUPlusString(this$static.value & 65535) + ').')));
      this$static.bmpChar[0] = ch;
      $emitOrAppendOne(this$static, this$static.bmpChar, returnState);
    }
  }
   else if (this$static.value <= 1114111) {
    (this$static.value & 65534) == 65534 && $err('Character reference expands to an astral non-character (' + $toUPlusString(this$static.value) + ').');
    this$static.astralChar[0] = 55232 + (this$static.value >> 10) & 65535;
    this$static.astralChar[1] = 56320 + (this$static.value & 1023) & 65535;
    $emitOrAppendTwo(this$static, this$static.astralChar, returnState);
  }
   else {
    $emitOrAppendOne(this$static, REPLACEMENT_CHARACTER_0, returnState);
  }
}

function $initDoctypeFields(this$static){
  this$static.doctypeName = '';
  this$static.systemIdentifier != null && (this$static.systemIdentifier = null);
  this$static.publicIdentifier != null && (this$static.publicIdentifier = null);
  this$static.forceQuirks = false;
}

function $maybeAppendSpaceToBogusComment(this$static){
  switch (this$static.commentPolicy.ordinal) {
    case 2:
      $appendLongStrBuf(this$static, 32);
      break;
    case 1:
      $fatal_1(this$static, 'The document is not mappable to XML 1.0 due to a trailing hyphen in a comment.');
  }
}

function $setStateAndEndTagExpectation(this$static, specialTokenizerState){
  var asArray;
  this$static.stateSave = specialTokenizerState;
  if (specialTokenizerState == 0) {
    return;
  }
  asArray = null.nullMethod();
  this$static.endTagExpectation = elementNameByBuffer(asArray, 0, null.nullField);
  $endTagExpectationToArray(this$static);
}

function $setStateAndEndTagExpectation_0(this$static, specialTokenizerState, endTagExpectation){
  this$static.stateSave = specialTokenizerState;
  this$static.endTagExpectation = endTagExpectation;
  $endTagExpectationToArray(this$static);
}

function $setXmlnsPolicy(this$static, xmlnsPolicy){
  if (xmlnsPolicy == ($clinit_115() , FATAL)) {
    throw $IllegalArgumentException(new IllegalArgumentException, "Can't use FATAL here.");
  }
  this$static.xmlnsPolicy = xmlnsPolicy;
}

function $start_0(this$static){
  this$static.confident = false;
  this$static.strBuf = initDim(_3C_classLit, 47, -1, 64, 1);
  this$static.longStrBuf = initDim(_3C_classLit, 47, -1, 1024, 1);
  this$static.html4 = false;
  this$static.metaBoundaryPassed = false;
  this$static.wantsComments = this$static.tokenHandler.wantingComments;
  !this$static.newAttributesEachTime && (this$static.attributes = $HtmlAttributes(new HtmlAttributes, this$static.mappingLangToXmlLang));
  this$static.strBufLen = 0;
  this$static.longStrBufLen = 0;
  this$static.stateSave = 0;
  this$static.lastCR = false;
  this$static.index = 0;
  this$static.forceQuirks = false;
  this$static.additional = 0;
  this$static.entCol = -1;
  this$static.firstCharKey = -1;
  this$static.lo = 0;
  this$static.hi = ($clinit_131() , NAMES).length - 1;
  this$static.candidate = -1;
  this$static.strBufMark = 0;
  this$static.prevValue = -1;
  this$static.value = 0;
  this$static.seenDigits = false;
  this$static.endTag = false;
  this$static.shouldSuspend = false;
  $initDoctypeFields(this$static);
  !!this$static.tagName && (this$static.tagName = null);
  !!this$static.attributeName && (this$static.attributeName = null);
  this$static.newAttributesEachTime && !!this$static.attributes && (this$static.attributes = null);
  $startTokenization(this$static.tokenHandler, this$static);
  this$static.alreadyComplainedAboutNonAscii = false;
  this$static.line = this$static.linePrev = 0;
  this$static.col = this$static.colPrev = 1;
  this$static.nextCharOnNewLine = true;
  this$static.prev = 0;
  this$static.alreadyWarnedAboutPrivateUseCharacters = false;
}

function $stateLoop(this$static, state, c, pos, buf, reconsume, returnState, endPos){
  var candidateArr, ch, e, folded, hilo, i, row, val;
  stateloop: for (;;) {
    switch (state) {
      case 0:
        dataloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 38:
              $flushChars(this$static, buf, pos);
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              this$static.additional = 0;
              $LocatorImpl(new LocatorImpl, this$static);
              returnState = state;
              state = 42;
              continue stateloop;
            case 60:
              $flushChars(this$static, buf, pos);
              state = 4;
              break dataloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 4:
        tagopenloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (c >= 65 && c <= 90) {
            this$static.endTag = false;
            this$static.strBuf[0] = c + 32 & 65535;
            this$static.strBufLen = 1;
            state = 6;
            break tagopenloop;
          }
           else if (c >= 97 && c <= 122) {
            this$static.endTag = false;
            this$static.strBuf[0] = c;
            this$static.strBufLen = 1;
            state = 6;
            break tagopenloop;
          }
          switch (c) {
            case 33:
              state = 16;
              continue stateloop;
            case 47:
              state = 5;
              continue stateloop;
            case 63:
              this$static.longStrBuf[0] = c;
              this$static.longStrBufLen = 1;
              state = 15;
              continue stateloop;
            case 62:
              $characters(this$static.tokenHandler, LT_GT, 0, 2);
              this$static.cstart = pos + 1;
              state = 0;
              continue stateloop;
            default:$characters(this$static.tokenHandler, LT_GT, 0, 1);
              this$static.cstart = pos;
              state = 0;
              reconsume = true;
              continue stateloop;
          }
        }

      case 6:
        tagnameloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              this$static.tagName = elementNameByBuffer(this$static.strBuf, 0, this$static.strBufLen);
              state = 7;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              this$static.tagName = elementNameByBuffer(this$static.strBuf, 0, this$static.strBufLen);
              state = 7;
              break tagnameloop;
            case 47:
              this$static.tagName = elementNameByBuffer(this$static.strBuf, 0, this$static.strBufLen);
              state = 48;
              continue stateloop;
            case 62:
              this$static.tagName = elementNameByBuffer(this$static.strBuf, 0, this$static.strBufLen);
              state = $emitCurrentTagToken(this$static, false, pos);
              if (this$static.shouldSuspend) {
                break stateloop;
              }

              continue stateloop;
            case 0:
              c = 65533;
            default:c >= 65 && c <= 90 && (c += 32);
              $appendStrBuf(this$static, c);
              continue;
          }
        }

      case 7:
        beforeattributenameloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 47:
              state = 48;
              continue stateloop;
            case 62:
              state = $emitCurrentTagToken(this$static, false, pos);
              if (this$static.shouldSuspend) {
                break stateloop;
              }

              continue stateloop;
            case 0:
              c = 65533;
            case 34:
            case 39:
            case 60:
            case 61:
            default:c >= 65 && c <= 90 && (c += 32);
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              state = 8;
              break beforeattributenameloop;
          }
        }

      case 8:
        attributenameloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $attributeNameComplete(this$static);
              state = 9;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              $attributeNameComplete(this$static);
              state = 9;
              continue stateloop;
            case 47:
              $attributeNameComplete(this$static);
              $addAttributeWithoutValue(this$static);
              state = 48;
              continue stateloop;
            case 61:
              $attributeNameComplete(this$static);
              state = 10;
              break attributenameloop;
            case 62:
              $attributeNameComplete(this$static);
              $addAttributeWithoutValue(this$static);
              state = $emitCurrentTagToken(this$static, false, pos);
              if (this$static.shouldSuspend) {
                break stateloop;
              }

              continue stateloop;
            case 0:
              c = 65533;
            case 34:
            case 39:
            case 60:
            default:c >= 65 && c <= 90 && (c += 32);
              $appendStrBuf(this$static, c);
              continue;
          }
        }

      case 10:
        beforeattributevalueloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 34:
              this$static.longStrBufLen = 0;
              state = 11;
              break beforeattributevalueloop;
            case 38:
              this$static.longStrBufLen = 0;
              state = 13;
              reconsume = true;
              continue stateloop;
            case 39:
              this$static.longStrBufLen = 0;
              state = 12;
              continue stateloop;
            case 62:
              $addAttributeWithoutValue(this$static);
              state = $emitCurrentTagToken(this$static, false, pos);
              if (this$static.shouldSuspend) {
                break stateloop;
              }

              continue stateloop;
            case 0:
              c = 65533;
            case 60:
            case 61:
            case 96:
              $errLtOrEqualsOrGraveInUnquotedAttributeOrNull(c);
            default:this$static.longStrBuf[0] = c;
              this$static.longStrBufLen = 1;
              state = 13;
              continue stateloop;
          }
        }

      case 11:
        attributevaluedoublequotedloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 34:
              $addAttributeWithValue(this$static);
              state = 14;
              break attributevaluedoublequotedloop;
            case 38:
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              this$static.additional = 34;
              $LocatorImpl(new LocatorImpl, this$static);
              returnState = state;
              state = 42;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 14:
        afterattributevaluequotedloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              state = 7;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              state = 7;
              continue stateloop;
            case 47:
              state = 48;
              break afterattributevaluequotedloop;
            case 62:
              state = $emitCurrentTagToken(this$static, false, pos);
              if (this$static.shouldSuspend) {
                break stateloop;
              }

              continue stateloop;
            default:state = 7;
              reconsume = true;
              continue stateloop;
          }
        }

      case 48:
        if (++pos == endPos) {
          break stateloop;
        }

        c = $checkChar(this$static, buf, pos);
        switch (c) {
          case 62:
            state = $emitCurrentTagToken(this$static, true, pos);
            if (this$static.shouldSuspend) {
              break stateloop;
            }

            continue stateloop;
          default:state = 7;
            reconsume = true;
            continue stateloop;
        }

      case 13:
        for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $addAttributeWithValue(this$static);
              state = 7;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              $addAttributeWithValue(this$static);
              state = 7;
              continue stateloop;
            case 38:
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              this$static.additional = 62;
              $LocatorImpl(new LocatorImpl, this$static);
              returnState = state;
              state = 42;
              continue stateloop;
            case 62:
              $addAttributeWithValue(this$static);
              state = $emitCurrentTagToken(this$static, false, pos);
              if (this$static.shouldSuspend) {
                break stateloop;
              }

              continue stateloop;
            case 0:
              c = 65533;
            case 60:
            case 34:
            case 39:
            case 61:
            case 96:
              $errUnquotedAttributeValOrNull(c);
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 9:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 47:
              $addAttributeWithoutValue(this$static);
              state = 48;
              continue stateloop;
            case 61:
              state = 10;
              continue stateloop;
            case 62:
              $addAttributeWithoutValue(this$static);
              state = $emitCurrentTagToken(this$static, false, pos);
              if (this$static.shouldSuspend) {
                break stateloop;
              }

              continue stateloop;
            case 0:
              c = 65533;
            case 34:
            case 39:
            case 60:
            default:$addAttributeWithoutValue(this$static);
              c >= 65 && c <= 90 && (c += 32);
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              state = 8;
              continue stateloop;
          }
        }

      case 16:
        markupdeclarationopenloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              this$static.longStrBuf[0] = c;
              this$static.longStrBufLen = 1;
              state = 38;
              break markupdeclarationopenloop;
            case 100:
            case 68:
              this$static.longStrBuf[0] = c;
              this$static.longStrBufLen = 1;
              this$static.index = 0;
              state = 39;
              continue stateloop;
            case 91:
              if (this$static.tokenHandler.inForeign) {
                this$static.longStrBuf[0] = c;
                this$static.longStrBufLen = 1;
                this$static.index = 0;
                state = 49;
                continue stateloop;
              }

            default:this$static.longStrBufLen = 0;
              state = 15;
              reconsume = true;
              continue stateloop;
          }
        }

      case 38:
        markupdeclarationhyphenloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 0:
              break stateloop;
            case 45:
              this$static.longStrBufLen = 0;
              state = 30;
              break markupdeclarationhyphenloop;
            default:state = 15;
              reconsume = true;
              continue stateloop;
          }
        }

      case 30:
        commentstartloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              $appendLongStrBuf(this$static, c);
              state = 31;
              continue stateloop;
            case 62:
              this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
              this$static.cstart = pos + 1;
              state = 0;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              state = 32;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              state = 32;
              break commentstartloop;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              state = 32;
              break commentstartloop;
          }
        }

      case 32:
        commentloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              $appendLongStrBuf(this$static, c);
              state = 33;
              break commentloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 33:
        commentenddashloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              $appendLongStrBuf(this$static, c);
              state = 34;
              break commentenddashloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              state = 32;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              state = 32;
              continue stateloop;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              state = 32;
              continue stateloop;
          }
        }

      case 34:
        commentendloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 62:
              this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 2);
              this$static.cstart = pos + 1;
              state = 0;
              continue stateloop;
            case 45:
              $adjustDoubleHyphenAndAppendToLongStrBufAndErr(this$static, c);
              continue;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $adjustDoubleHyphenAndAppendToLongStrBufAndErr(this$static, 10);
              state = 32;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $adjustDoubleHyphenAndAppendToLongStrBufAndErr(this$static, 10);
              state = 32;
              continue stateloop;
            case 33:
              $appendLongStrBuf(this$static, c);
              state = 36;
              continue stateloop;
            case 0:
              c = 65533;
            default:$adjustDoubleHyphenAndAppendToLongStrBufAndErr(this$static, c);
              state = 32;
              continue stateloop;
          }
        }

      case 35:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 62:
              this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
              this$static.cstart = pos + 1;
              state = 0;
              continue stateloop;
            case 45:
              $appendLongStrBuf(this$static, c);
              state = 33;
              continue stateloop;
            case 32:
            case 9:
            case 12:
              $appendLongStrBuf(this$static, c);
              continue;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              state = 32;
              continue stateloop;
          }
        }

      case 36:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 62:
              this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 3);
              this$static.cstart = pos + 1;
              state = 0;
              continue stateloop;
            case 45:
              $appendLongStrBuf(this$static, c);
              state = 33;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              state = 32;
              continue stateloop;
          }
        }

      case 31:
        if (++pos == endPos) {
          break stateloop;
        }

        c = $checkChar(this$static, buf, pos);
        switch (c) {
          case 45:
            $appendLongStrBuf(this$static, c);
            state = 34;
            continue stateloop;
          case 62:
            this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 1);
            this$static.cstart = pos + 1;
            state = 0;
            continue stateloop;
          case 13:
            this$static.nextCharOnNewLine = true;
            this$static.lastCR = true;
            $appendLongStrBuf(this$static, 10);
            state = 32;
            break stateloop;
          case 10:
            this$static.nextCharOnNewLine = true;
            $appendLongStrBuf(this$static, 10);
            state = 32;
            continue stateloop;
          case 0:
            c = 65533;
          default:$appendLongStrBuf(this$static, c);
            state = 32;
            continue stateloop;
        }

      case 49:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (this$static.index < 6) {
            if (c == CDATA_LSQB[this$static.index]) {
              $appendLongStrBuf(this$static, c);
            }
             else {
              state = 15;
              reconsume = true;
              continue stateloop;
            }
            ++this$static.index;
            continue;
          }
           else {
            this$static.cstart = pos;
            state = 50;
            reconsume = true;
            break;
          }
        }

      case 50:
        cdatasectionloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 93:
              $flushChars(this$static, buf, pos);
              state = 51;
              break cdatasectionloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 51:
        cdatarsqb: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 93:
              state = 52;
              break cdatarsqb;
            default:$characters(this$static.tokenHandler, RSQB_RSQB, 0, 1);
              this$static.cstart = pos;
              state = 50;
              reconsume = true;
              continue stateloop;
          }
        }

      case 52:
        if (++pos == endPos) {
          break stateloop;
        }

        c = $checkChar(this$static, buf, pos);
        switch (c) {
          case 62:
            this$static.cstart = pos + 1;
            state = 0;
            continue stateloop;
          default:$characters(this$static.tokenHandler, RSQB_RSQB, 0, 2);
            this$static.cstart = pos;
            state = 50;
            reconsume = true;
            continue stateloop;
        }

      case 12:
        attributevaluesinglequotedloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 39:
              $addAttributeWithValue(this$static);
              state = 14;
              continue stateloop;
            case 38:
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              this$static.additional = 39;
              $LocatorImpl(new LocatorImpl, this$static);
              returnState = state;
              state = 42;
              break attributevaluesinglequotedloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 42:
        if (++pos == endPos) {
          break stateloop;
        }

        c = $checkChar(this$static, buf, pos);
        if (c == 0) {
          break stateloop;
        }

        switch (c) {
          case 32:
          case 9:
          case 10:
          case 13:
          case 12:
          case 60:
          case 38:
            (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
            (returnState & -2) == 0 && (this$static.cstart = pos);
            state = returnState;
            reconsume = true;
            continue stateloop;
          case 35:
            $appendStrBuf(this$static, 35);
            state = 43;
            continue stateloop;
          default:if (c == this$static.additional) {
              (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
              state = returnState;
              reconsume = true;
              continue stateloop;
            }

            if (c >= 97 && c <= 122) {
              this$static.firstCharKey = c - 97 + 26;
            }
             else if (c >= 65 && c <= 90) {
              this$static.firstCharKey = c - 65;
            }
             else {
              (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
              (returnState & -2) == 0 && (this$static.cstart = pos);
              state = returnState;
              reconsume = true;
              continue stateloop;
            }

            $appendStrBuf(this$static, c);
            state = 72;
        }

      case 72:
        {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (c == 0) {
            break stateloop;
          }
          hilo = 0;
          if (c <= 122) {
            row = ($clinit_132() , HILO_ACCEL)[c];
            row != null && (hilo = row[this$static.firstCharKey]);
          }
          if (hilo == 0) {
            (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
            (returnState & -2) == 0 && (this$static.cstart = pos);
            state = returnState;
            reconsume = true;
            continue stateloop;
          }
          $appendStrBuf(this$static, c);
          this$static.lo = hilo & 65535;
          this$static.hi = hilo >> 16;
          this$static.entCol = -1;
          this$static.candidate = -1;
          this$static.strBufMark = 0;
          state = 44;
        }

      case 44:
        outer: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (c == 0) {
            break stateloop;
          }
          ++this$static.entCol;
          loloop: for (;;) {
            if (this$static.hi < this$static.lo) {
              break outer;
            }
            if (this$static.entCol == ($clinit_131() , NAMES)[this$static.lo].length) {
              this$static.candidate = this$static.lo;
              this$static.strBufMark = this$static.strBufLen;
              ++this$static.lo;
            }
             else if (this$static.entCol > NAMES[this$static.lo].length) {
              break outer;
            }
             else if (c > NAMES[this$static.lo][this$static.entCol]) {
              ++this$static.lo;
            }
             else {
              break loloop;
            }
          }
          hiloop: for (;;) {
            if (this$static.hi < this$static.lo) {
              break outer;
            }
            if (this$static.entCol == ($clinit_131() , NAMES)[this$static.hi].length) {
              break hiloop;
            }
            if (this$static.entCol > NAMES[this$static.hi].length) {
              break outer;
            }
             else if (c < NAMES[this$static.hi][this$static.entCol]) {
              --this$static.hi;
            }
             else {
              break hiloop;
            }
          }
          if (this$static.hi < this$static.lo) {
            break outer;
          }
          $appendStrBuf(this$static, c);
          continue;
        }

        if (this$static.candidate == -1) {
          (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
          (returnState & -2) == 0 && (this$static.cstart = pos);
          state = returnState;
          reconsume = true;
          continue stateloop;
        }
         else {
          candidateArr = ($clinit_131() , NAMES)[this$static.candidate];
          if (candidateArr.length == 0 || candidateArr[candidateArr.length - 1] != 59) {
            if ((returnState & -2) != 0) {
              this$static.strBufMark == this$static.strBufLen?(ch = c):(ch = this$static.strBuf[this$static.strBufMark]);
              if (ch == 61 || ch >= 48 && ch <= 57 || ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122) {
                $appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen);
                state = returnState;
                reconsume = true;
                continue stateloop;
              }
            }
          }
          val = VALUES_0[this$static.candidate];
          (val[0] & 64512) == 55296?$emitOrAppendTwo(this$static, val, returnState):((returnState & -2) != 0?$appendLongStrBuf(this$static, val[0]):$characters(this$static.tokenHandler, val, 0, 1) , undefined);
          if (this$static.strBufMark < this$static.strBufLen) {
            if ((returnState & -2) != 0) {
              for (i = this$static.strBufMark; i < this$static.strBufLen; ++i) {
                $appendLongStrBuf(this$static, this$static.strBuf[i]);
              }
            }
             else {
              $characters(this$static.tokenHandler, this$static.strBuf, this$static.strBufMark, this$static.strBufLen - this$static.strBufMark);
            }
          }
          (returnState & -2) == 0 && (this$static.cstart = pos);
          state = returnState;
          reconsume = true;
          continue stateloop;
        }

      case 43:
        if (++pos == endPos) {
          break stateloop;
        }

        c = $checkChar(this$static, buf, pos);
        this$static.prevValue = -1;
        this$static.value = 0;
        this$static.seenDigits = false;
        switch (c) {
          case 120:
          case 88:
            $appendStrBuf(this$static, c);
            state = 45;
            continue stateloop;
          default:state = 46;
            reconsume = true;
        }

      case 46:
        decimalloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          this$static.value < this$static.prevValue && (this$static.value = 1114112);
          this$static.prevValue = this$static.value;
          if (c >= 48 && c <= 57) {
            this$static.seenDigits = true;
            this$static.value *= 10;
            this$static.value += c - 48;
            continue;
          }
           else if (c == 59) {
            if (this$static.seenDigits) {
              (returnState & -2) == 0 && (this$static.cstart = pos + 1);
              state = 47;
              break decimalloop;
            }
             else {
              $err('No digits after \u201C' + valueOf_0(this$static.strBuf, 0, this$static.strBufLen) + '\u201D.');
              $appendStrBuf(this$static, 59);
              (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
              (returnState & -2) == 0 && (this$static.cstart = pos + 1);
              state = returnState;
              continue stateloop;
            }
          }
           else {
            if (this$static.seenDigits) {
              (returnState & -2) == 0 && (this$static.cstart = pos);
              state = 47;
              reconsume = true;
              break decimalloop;
            }
             else {
              $err('No digits after \u201C' + valueOf_0(this$static.strBuf, 0, this$static.strBufLen) + '\u201D.');
              (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
              (returnState & -2) == 0 && (this$static.cstart = pos);
              state = returnState;
              reconsume = true;
              continue stateloop;
            }
          }
        }

      case 47:
        $handleNcrValue(this$static, returnState);
        state = returnState;
        continue stateloop;
      case 45:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          this$static.value < this$static.prevValue && (this$static.value = 1114112);
          this$static.prevValue = this$static.value;
          if (c >= 48 && c <= 57) {
            this$static.seenDigits = true;
            this$static.value *= 16;
            this$static.value += c - 48;
            continue;
          }
           else if (c >= 65 && c <= 70) {
            this$static.seenDigits = true;
            this$static.value *= 16;
            this$static.value += c - 65 + 10;
            continue;
          }
           else if (c >= 97 && c <= 102) {
            this$static.seenDigits = true;
            this$static.value *= 16;
            this$static.value += c - 97 + 10;
            continue;
          }
           else if (c == 59) {
            if (this$static.seenDigits) {
              (returnState & -2) == 0 && (this$static.cstart = pos + 1);
              state = 47;
              continue stateloop;
            }
             else {
              $err('No digits after \u201C' + valueOf_0(this$static.strBuf, 0, this$static.strBufLen) + '\u201D.');
              $appendStrBuf(this$static, 59);
              (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
              (returnState & -2) == 0 && (this$static.cstart = pos + 1);
              state = returnState;
              continue stateloop;
            }
          }
           else {
            if (this$static.seenDigits) {
              (returnState & -2) == 0 && (this$static.cstart = pos);
              state = 47;
              reconsume = true;
              continue stateloop;
            }
             else {
              $err('No digits after \u201C' + valueOf_0(this$static.strBuf, 0, this$static.strBufLen) + '\u201D.');
              (returnState & -2) != 0?$appendLongStrBuf_0(this$static, this$static.strBuf, 0, this$static.strBufLen):$emitStrBuf(this$static);
              (returnState & -2) == 0 && (this$static.cstart = pos);
              state = returnState;
              reconsume = true;
              continue stateloop;
            }
          }
        }

      case 3:
        plaintextloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 5:
        if (++pos == endPos) {
          break stateloop;
        }

        c = $checkChar(this$static, buf, pos);
        switch (c) {
          case 62:
            this$static.cstart = pos + 1;
            state = 0;
            continue stateloop;
          case 13:
            this$static.nextCharOnNewLine = true;
            this$static.lastCR = true;
            this$static.longStrBuf[0] = 10;
            this$static.longStrBufLen = 1;
            state = 15;
            break stateloop;
          case 10:
            this$static.nextCharOnNewLine = true;
            this$static.longStrBuf[0] = 10;
            this$static.longStrBufLen = 1;
            state = 15;
            continue stateloop;
          case 0:
            c = 65533;
          default:c >= 65 && c <= 90 && (c += 32);
            if (c >= 97 && c <= 122) {
              this$static.endTag = true;
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              state = 6;
              continue stateloop;
            }
             else {
              this$static.longStrBuf[0] = c;
              this$static.longStrBufLen = 1;
              state = 15;
              continue stateloop;
            }

        }

      case 1:
        rcdataloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 38:
              $flushChars(this$static, buf, pos);
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              this$static.additional = 0;
              returnState = state;
              state = 42;
              continue stateloop;
            case 60:
              $flushChars(this$static, buf, pos);
              returnState = state;
              state = 61;
              continue stateloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 60:
        rawtextloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 60:
              $flushChars(this$static, buf, pos);
              returnState = state;
              state = 61;
              break rawtextloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 61:
        rawtextrcdatalessthansignloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 47:
              this$static.index = 0;
              this$static.strBufLen = 0;
              state = 37;
              break rawtextrcdatalessthansignloop;
            default:$characters(this$static.tokenHandler, LT_GT, 0, 1);
              this$static.cstart = pos;
              state = returnState;
              reconsume = true;
              continue stateloop;
          }
        }

      case 37:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (this$static.index < this$static.endTagExpectationAsArray.length) {
            e = this$static.endTagExpectationAsArray[this$static.index];
            folded = c;
            c >= 65 && c <= 90 && (folded += 32);
            if (folded != e) {
              this$static.html4 && (this$static.index > 0 || folded >= 97 && folded <= 122) && ($clinit_125() , IFRAME) != this$static.endTagExpectation;
              $characters(this$static.tokenHandler, LT_SOLIDUS, 0, 2);
              $emitStrBuf(this$static);
              this$static.cstart = pos;
              state = returnState;
              reconsume = true;
              continue stateloop;
            }
            $appendStrBuf(this$static, c);
            ++this$static.index;
            continue;
          }
           else {
            this$static.endTag = true;
            this$static.tagName = this$static.endTagExpectation;
            switch (c) {
              case 13:
                this$static.nextCharOnNewLine = true;
                this$static.lastCR = true;
                state = 7;
                break stateloop;
              case 10:
                this$static.nextCharOnNewLine = true;
              case 32:
              case 9:
              case 12:
                state = 7;
                continue stateloop;
              case 47:
                state = 48;
                continue stateloop;
              case 62:
                state = $emitCurrentTagToken(this$static, false, pos);
                if (this$static.shouldSuspend) {
                  break stateloop;
                }

                continue stateloop;
              default:$characters(this$static.tokenHandler, LT_SOLIDUS, 0, 2);
                $emitStrBuf(this$static);
                c == 0?($flushChars(this$static, buf, pos) , $zeroOriginatingReplacementCharacter(this$static.tokenHandler) , this$static.cstart = pos + 1 , undefined):(this$static.cstart = pos);
                state = returnState;
                continue stateloop;
            }
          }
        }

      case 15:
        boguscommentloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 62:
              this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
              this$static.cstart = pos + 1;
              state = 0;
              continue stateloop;
            case 45:
              $appendLongStrBuf(this$static, c);
              state = 59;
              break boguscommentloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 59:
        boguscommenthyphenloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 62:
              $maybeAppendSpaceToBogusComment(this$static);
              this$static.wantsComments && $comment(this$static.tokenHandler, this$static.longStrBuf, 0, this$static.longStrBufLen - 0);
              this$static.cstart = pos + 1;
              state = 0;
              continue stateloop;
            case 45:
              $appendSecondHyphenToBogusComment(this$static);
              continue boguscommenthyphenloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              state = 15;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              state = 15;
              continue stateloop;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              state = 15;
              continue stateloop;
          }
        }

      case 2:
        scriptdataloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 60:
              $flushChars(this$static, buf, pos);
              returnState = state;
              state = 53;
              break scriptdataloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 53:
        scriptdatalessthansignloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 47:
              this$static.index = 0;
              this$static.strBufLen = 0;
              state = 37;
              continue stateloop;
            case 33:
              $characters(this$static.tokenHandler, LT_GT, 0, 1);
              this$static.cstart = pos;
              state = 54;
              break scriptdatalessthansignloop;
            default:$characters(this$static.tokenHandler, LT_GT, 0, 1);
              this$static.cstart = pos;
              state = 2;
              reconsume = true;
              continue stateloop;
          }
        }

      case 54:
        scriptdataescapestartloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              state = 55;
              break scriptdataescapestartloop;
            default:state = 2;
              reconsume = true;
              continue stateloop;
          }
        }

      case 55:
        scriptdataescapestartdashloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              state = 58;
              break scriptdataescapestartdashloop;
            default:state = 2;
              reconsume = true;
              continue stateloop;
          }
        }

      case 58:
        scriptdataescapeddashdashloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              continue;
            case 60:
              $flushChars(this$static, buf, pos);
              state = 65;
              continue stateloop;
            case 62:
              state = 2;
              continue stateloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              state = 56;
              break scriptdataescapeddashdashloop;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              state = 56;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:state = 56;
              break scriptdataescapeddashdashloop;
          }
        }

      case 56:
        scriptdataescapedloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 45:
              state = 57;
              break scriptdataescapedloop;
            case 60:
              $flushChars(this$static, buf, pos);
              state = 65;
              continue stateloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 57:
        scriptdataescapeddashloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              state = 58;
              continue stateloop;
            case 60:
              $flushChars(this$static, buf, pos);
              state = 65;
              break scriptdataescapeddashloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              state = 56;
              continue stateloop;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              state = 56;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:state = 56;
              continue stateloop;
          }
        }

      case 65:
        scriptdataescapedlessthanloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 47:
              this$static.index = 0;
              this$static.strBufLen = 0;
              returnState = 56;
              state = 37;
              continue stateloop;
            case 83:
            case 115:
              $characters(this$static.tokenHandler, LT_GT, 0, 1);
              this$static.cstart = pos;
              this$static.index = 1;
              state = 66;
              break scriptdataescapedlessthanloop;
            default:$characters(this$static.tokenHandler, LT_GT, 0, 1);
              this$static.cstart = pos;
              reconsume = true;
              state = 56;
              continue stateloop;
          }
        }

      case 66:
        scriptdatadoubleescapestartloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (this$static.index < 6) {
            folded = c;
            c >= 65 && c <= 90 && (folded += 32);
            if (folded != SCRIPT_ARR[this$static.index]) {
              reconsume = true;
              state = 56;
              continue stateloop;
            }
            ++this$static.index;
            continue;
          }
          switch (c) {
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              state = 67;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
            case 47:
            case 62:
              state = 67;
              break scriptdatadoubleescapestartloop;
            default:reconsume = true;
              state = 56;
              continue stateloop;
          }
        }

      case 67:
        scriptdatadoubleescapedloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 45:
              state = 69;
              break scriptdatadoubleescapedloop;
            case 60:
              state = 68;
              continue stateloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              continue;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 69:
        scriptdatadoubleescapeddashloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              state = 70;
              break scriptdatadoubleescapeddashloop;
            case 60:
              state = 68;
              continue stateloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              state = 67;
              continue stateloop;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              state = 67;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:state = 67;
              continue stateloop;
          }
        }

      case 70:
        scriptdatadoubleescapeddashdashloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 45:
              continue;
            case 60:
              state = 68;
              break scriptdatadoubleescapeddashdashloop;
            case 62:
              state = 2;
              continue stateloop;
            case 0:
              $flushChars(this$static, buf, pos);
              $zeroOriginatingReplacementCharacter(this$static.tokenHandler);
              this$static.cstart = pos + 1;
              state = 67;
              continue stateloop;
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              state = 67;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:state = 67;
              continue stateloop;
          }
        }

      case 68:
        scriptdatadoubleescapedlessthanloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 47:
              this$static.index = 0;
              state = 71;
              break scriptdatadoubleescapedlessthanloop;
            default:reconsume = true;
              state = 67;
              continue stateloop;
          }
        }

      case 71:
        scriptdatadoubleescapeendloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (this$static.index < 6) {
            folded = c;
            c >= 65 && c <= 90 && (folded += 32);
            if (folded != SCRIPT_ARR[this$static.index]) {
              reconsume = true;
              state = 67;
              continue stateloop;
            }
            ++this$static.index;
            continue;
          }
          switch (c) {
            case 13:
              $emitCarriageReturn(this$static, buf, pos);
              state = 56;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
            case 47:
            case 62:
              state = 56;
              continue stateloop;
            default:reconsume = true;
              state = 67;
              continue stateloop;
          }
        }

      case 39:
        markupdeclarationdoctypeloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (this$static.index < 6) {
            folded = c;
            c >= 65 && c <= 90 && (folded += 32);
            if (folded == OCTYPE[this$static.index]) {
              $appendLongStrBuf(this$static, c);
            }
             else {
              state = 15;
              reconsume = true;
              continue stateloop;
            }
            ++this$static.index;
            continue;
          }
           else {
            state = 17;
            reconsume = true;
            break markupdeclarationdoctypeloop;
          }
        }

      case 17:
        doctypeloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          $initDoctypeFields(this$static);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              state = 18;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              state = 18;
              break doctypeloop;
            default:state = 18;
              reconsume = true;
              break doctypeloop;
          }
        }

      case 18:
        beforedoctypenameloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 62:
              this$static.forceQuirks = true;
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 0:
              c = 65533;
            default:c >= 65 && c <= 90 && (c += 32);
              this$static.strBuf[0] = c;
              this$static.strBufLen = 1;
              state = 19;
              break beforedoctypenameloop;
          }
        }

      case 19:
        doctypenameloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              this$static.doctypeName = String(valueOf_0(this$static.strBuf, 0, this$static.strBufLen));
              state = 20;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              this$static.doctypeName = String(valueOf_0(this$static.strBuf, 0, this$static.strBufLen));
              state = 20;
              break doctypenameloop;
            case 62:
              this$static.doctypeName = String(valueOf_0(this$static.strBuf, 0, this$static.strBufLen));
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 0:
              c = 65533;
            default:c >= 65 && c <= 90 && (c += 32);
              $appendStrBuf(this$static, c);
              continue;
          }
        }

      case 20:
        afterdoctypenameloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 62:
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 112:
            case 80:
              this$static.index = 0;
              state = 40;
              break afterdoctypenameloop;
            case 115:
            case 83:
              this$static.index = 0;
              state = 41;
              continue stateloop;
            default:this$static.forceQuirks = true;
              state = 29;
              continue stateloop;
          }
        }

      case 40:
        doctypeublicloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (this$static.index < 5) {
            folded = c;
            c >= 65 && c <= 90 && (folded += 32);
            if (folded != UBLIC[this$static.index]) {
              this$static.forceQuirks = true;
              state = 29;
              reconsume = true;
              continue stateloop;
            }
            ++this$static.index;
            continue;
          }
           else {
            state = 62;
            reconsume = true;
            break doctypeublicloop;
          }
        }

      case 62:
        afterdoctypepublickeywordloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              state = 21;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              state = 21;
              break afterdoctypepublickeywordloop;
            case 34:
              this$static.longStrBufLen = 0;
              state = 22;
              continue stateloop;
            case 39:
              this$static.longStrBufLen = 0;
              state = 23;
              continue stateloop;
            case 62:
              this$static.forceQuirks = true;
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            default:this$static.forceQuirks = true;
              state = 29;
              continue stateloop;
          }
        }

      case 21:
        beforedoctypepublicidentifierloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 34:
              this$static.longStrBufLen = 0;
              state = 22;
              break beforedoctypepublicidentifierloop;
            case 39:
              this$static.longStrBufLen = 0;
              state = 23;
              continue stateloop;
            case 62:
              this$static.forceQuirks = true;
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            default:this$static.forceQuirks = true;
              state = 29;
              continue stateloop;
          }
        }

      case 22:
        doctypepublicidentifierdoublequotedloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 34:
              this$static.publicIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              state = 24;
              break doctypepublicidentifierdoublequotedloop;
            case 62:
              this$static.forceQuirks = true;
              this$static.publicIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 24:
        afterdoctypepublicidentifierloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              state = 63;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              state = 63;
              break afterdoctypepublicidentifierloop;
            case 62:
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 34:
              this$static.longStrBufLen = 0;
              state = 26;
              continue stateloop;
            case 39:
              this$static.longStrBufLen = 0;
              state = 27;
              continue stateloop;
            default:this$static.forceQuirks = true;
              state = 29;
              continue stateloop;
          }
        }

      case 63:
        betweendoctypepublicandsystemidentifiersloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 62:
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 34:
              this$static.longStrBufLen = 0;
              state = 26;
              break betweendoctypepublicandsystemidentifiersloop;
            case 39:
              this$static.longStrBufLen = 0;
              state = 27;
              continue stateloop;
            default:this$static.forceQuirks = true;
              state = 29;
              continue stateloop;
          }
        }

      case 26:
        doctypesystemidentifierdoublequotedloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 34:
              this$static.systemIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              state = 28;
              continue stateloop;
            case 62:
              this$static.forceQuirks = true;
              this$static.systemIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 28:
        afterdoctypesystemidentifierloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 62:
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            default:this$static.forceQuirks = false;
              state = 29;
              break afterdoctypesystemidentifierloop;
          }
        }

      case 29:
        for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 62:
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            default:continue;
          }
        }

      case 41:
        doctypeystemloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          if (this$static.index < 5) {
            folded = c;
            c >= 65 && c <= 90 && (folded += 32);
            if (folded != YSTEM[this$static.index]) {
              this$static.forceQuirks = true;
              state = 29;
              reconsume = true;
              continue stateloop;
            }
            ++this$static.index;
            continue stateloop;
          }
           else {
            state = 64;
            reconsume = true;
            break doctypeystemloop;
          }
        }

      case 64:
        afterdoctypesystemkeywordloop: for (;;) {
          if (reconsume) {
            reconsume = false;
          }
           else {
            if (++pos == endPos) {
              break stateloop;
            }
            c = $checkChar(this$static, buf, pos);
          }
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              state = 25;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              state = 25;
              break afterdoctypesystemkeywordloop;
            case 34:
              this$static.longStrBufLen = 0;
              state = 26;
              continue stateloop;
            case 39:
              this$static.longStrBufLen = 0;
              state = 27;
              continue stateloop;
            case 62:
              this$static.forceQuirks = true;
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            default:this$static.forceQuirks = true;
              state = 29;
              continue stateloop;
          }
        }

      case 25:
        beforedoctypesystemidentifierloop: for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
            case 32:
            case 9:
            case 12:
              continue;
            case 34:
              this$static.longStrBufLen = 0;
              state = 26;
              continue stateloop;
            case 39:
              this$static.longStrBufLen = 0;
              state = 27;
              break beforedoctypesystemidentifierloop;
            case 62:
              this$static.forceQuirks = true;
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            default:this$static.forceQuirks = true;
              state = 29;
              continue stateloop;
          }
        }

      case 27:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 39:
              this$static.systemIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              state = 28;
              continue stateloop;
            case 62:
              this$static.forceQuirks = true;
              this$static.systemIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

      case 23:
        for (;;) {
          if (++pos == endPos) {
            break stateloop;
          }
          c = $checkChar(this$static, buf, pos);
          switch (c) {
            case 39:
              this$static.publicIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              state = 24;
              continue stateloop;
            case 62:
              this$static.forceQuirks = true;
              this$static.publicIdentifier = valueOf_0(this$static.longStrBuf, 0, this$static.longStrBufLen);
              $emitDoctypeToken(this$static, pos);
              state = 0;
              continue stateloop;
            case 13:
              this$static.nextCharOnNewLine = true;
              this$static.lastCR = true;
              $appendLongStrBuf(this$static, 10);
              break stateloop;
            case 10:
              this$static.nextCharOnNewLine = true;
              $appendLongStrBuf(this$static, 10);
              continue;
            case 0:
              c = 65533;
            default:$appendLongStrBuf(this$static, c);
              continue;
          }
        }

    }
  }
  $flushChars(this$static, buf, pos);
  this$static.stateSave = state;
  this$static.returnStateSave = returnState;
  return pos;
}

function $tokenizeBuffer(this$static, buffer){
  var pos, returnState, start, state;
  state = this$static.stateSave;
  returnState = this$static.returnStateSave;
  this$static.shouldSuspend = false;
  this$static.lastCR = false;
  start = buffer.start;
  pos = start - 1;
  switch (state) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 60:
    case 50:
    case 56:
    case 54:
    case 55:
    case 57:
    case 58:
    case 66:
    case 67:
    case 68:
    case 69:
    case 70:
    case 71:
      this$static.cstart = start;
      break;
    default:this$static.cstart = 2147483647;
  }
  pos = $stateLoop(this$static, state, 0, pos, buffer.buffer, false, returnState, buffer.end);
  pos == buffer.end?(buffer.start = pos):(buffer.start = pos + 1);
  return this$static.lastCR;
}

function $warn(){
  return;
}

function getClass_69(){
  return Lnu_validator_htmlparser_impl_Tokenizer_2_classLit;
}

function newAsciiLowerCaseStringFromString(str){
  var buf, c, i;
  if (str == null) {
    return null;
  }
  buf = initDim(_3C_classLit, 47, -1, str.length, 1);
  for (i = 0; i < str.length; ++i) {
    c = str.charCodeAt(i);
    c >= 65 && c <= 90 && (c += 32);
    buf[i] = c;
  }
  return String.fromCharCode.apply(null, buf);
}

function Tokenizer(){
}

_ = Tokenizer.prototype = new Object_0;
_.getClass$ = getClass_69;
_.typeId$ = 0;
_.additional = 0;
_.astralChar = null;
_.attributeName = null;
_.attributes = null;
_.bmpChar = null;
_.candidate = 0;
_.confident = false;
_.cstart = 0;
_.doctypeName = null;
_.endTag = false;
_.endTagExpectation = null;
_.endTagExpectationAsArray = null;
_.entCol = 0;
_.firstCharKey = 0;
_.forceQuirks = false;
_.hi = 0;
_.html4 = false;
_.html4ModeCompatibleWithXhtml1Schemata = false;
_.index = 0;
_.lastCR = false;
_.lo = 0;
_.longStrBuf = null;
_.longStrBufLen = 0;
_.mappingLangToXmlLang = 0;
_.metaBoundaryPassed = false;
_.newAttributesEachTime = false;
_.prevValue = 0;
_.publicIdentifier = null;
_.returnStateSave = 0;
_.seenDigits = false;
_.shouldSuspend = false;
_.stateSave = 0;
_.strBuf = null;
_.strBufLen = 0;
_.strBufMark = 0;
_.systemIdentifier = null;
_.tagName = null;
_.tokenHandler = null;
_.value = 0;
_.wantsComments = false;
var CDATA_LSQB, IFRAME_ARR, LF, LT_GT, LT_SOLIDUS, NOEMBED_ARR, NOFRAMES_ARR, NOSCRIPT_ARR, OCTYPE, PLAINTEXT_ARR, REPLACEMENT_CHARACTER_0, RSQB_RSQB, SCRIPT_ARR, SPACE, STYLE_ARR, TEXTAREA_ARR, TITLE_ARR, UBLIC, XMP_ARR, YSTEM;
function $clinit_127(){
  $clinit_127 = nullMethod;
  $clinit_126();
}

function $ErrorReportingTokenizer(this$static, tokenHandler){
  $clinit_127();
  this$static.contentSpacePolicy = ($clinit_115() , ALTER_INFOSET);
  this$static.commentPolicy = ALTER_INFOSET;
  this$static.xmlnsPolicy = ALTER_INFOSET;
  this$static.namePolicy = ALTER_INFOSET;
  this$static.tokenHandler = tokenHandler;
  this$static.newAttributesEachTime = false;
  this$static.bmpChar = initDim(_3C_classLit, 47, -1, 1, 1);
  this$static.astralChar = initDim(_3C_classLit, 47, -1, 2, 1);
  this$static.tagName = null;
  this$static.attributeName = null;
  this$static.doctypeName = null;
  this$static.publicIdentifier = null;
  this$static.systemIdentifier = null;
  this$static.attributes = null;
  this$static.contentNonXmlCharPolicy = ALTER_INFOSET;
  return this$static;
}

function $checkChar(this$static, buf, pos){
  var c, intVal;
  this$static.linePrev = this$static.line;
  this$static.colPrev = this$static.col;
  if (this$static.nextCharOnNewLine) {
    ++this$static.line;
    this$static.col = 1;
    this$static.nextCharOnNewLine = false;
  }
   else {
    ++this$static.col;
  }
  c = buf[pos];
  !this$static.confident && !this$static.alreadyComplainedAboutNonAscii && c > 127 && (this$static.alreadyComplainedAboutNonAscii = true);
  switch (c) {
    case 0:
    case 9:
    case 13:
    case 10:
      break;
    case 12:
      if (this$static.contentNonXmlCharPolicy == ($clinit_115() , FATAL)) {
        $fatal_1(this$static, 'This document is not mappable to XML 1.0 without data loss due to ' + $toUPlusString(c) + ' which is not a legal XML 1.0 character.');
      }
       else {
        this$static.contentNonXmlCharPolicy == ALTER_INFOSET && (c = buf[pos] = 32);
        $warn('This document is not mappable to XML 1.0 without data loss due to ' + $toUPlusString(c) + ' which is not a legal XML 1.0 character.');
      }

      break;
    default:if ((c & 64512) == 56320) {
        if ((this$static.prev & 64512) == 55296) {
          intVal = (this$static.prev << 10) + c + -56613888;
          (intVal >= 983040 && intVal <= 1048573 || intVal >= 1048576 && intVal <= 1114109) && (!this$static.alreadyWarnedAboutPrivateUseCharacters && (this$static.alreadyWarnedAboutPrivateUseCharacters = true) , undefined);
        }
      }
       else if (c < 32 || (c & 65534) == 65534) {
        switch (this$static.contentNonXmlCharPolicy.ordinal) {
          case 1:
            $fatal_1(this$static, 'Forbidden code point ' + $toUPlusString(c) + '.');
            break;
          case 2:
            c = buf[pos] = 65533;
          case 0:
            $err('Forbidden code point ' + $toUPlusString(c) + '.');
        }
      }
       else 
        c >= 127 && c <= 159 || c >= 64976 && c <= 65007?$err('Forbidden code point ' + $toUPlusString(c) + '.'):c >= 57344 && c <= 63743 && (!this$static.alreadyWarnedAboutPrivateUseCharacters && (this$static.alreadyWarnedAboutPrivateUseCharacters = true) , undefined);
  }
  this$static.prev = c;
  return c;
}

function $errLtOrEqualsOrGraveInUnquotedAttributeOrNull(c){
  switch (c) {
    case 61:
      return;
    case 60:
      return;
    case 96:
      return;
  }
}

function $errNcrControlChar(this$static, ch){
  switch (this$static.contentNonXmlCharPolicy.ordinal) {
    case 1:
      $fatal_1(this$static, 'Character reference expands to a control character (' + $toUPlusString(this$static.value & 65535) + ').');
      break;
    case 2:
      ch = 65533;
    case 0:
      $err('Character reference expands to a control character (' + $toUPlusString(this$static.value & 65535) + ').');
  }
  return ch;
}

function $errNcrNonCharacter(this$static, ch){
  switch (this$static.contentNonXmlCharPolicy.ordinal) {
    case 1:
      $fatal_1(this$static, 'Character reference expands to a non-character (' + $toUPlusString(this$static.value & 65535) + ').');
      break;
    case 2:
      ch = 65533;
    case 0:
      $err('Character reference expands to a non-character (' + $toUPlusString(this$static.value & 65535) + ').');
  }
  return ch;
}

function $errUnquotedAttributeValOrNull(c){
  switch (c) {
    case 60:
      return;
    case 96:
      return;
    case 65533:
      return;
    default:return;
  }
}

function $flushChars(this$static, buf, pos){
  var currCol, currLine;
  if (pos > this$static.cstart) {
    currLine = this$static.line;
    currCol = this$static.col;
    this$static.line = this$static.linePrev;
    this$static.col = this$static.colPrev;
    $characters(this$static.tokenHandler, buf, this$static.cstart, pos - this$static.cstart);
    this$static.line = currLine;
    this$static.col = currCol;
  }
  this$static.cstart = 2147483647;
}

function $getColumnNumber(this$static){
  if (this$static.col > 0) {
    return this$static.col;
  }
   else {
    return -1;
  }
}

function $getLineNumber(this$static){
  if (this$static.line > 0) {
    return this$static.line;
  }
   else {
    return -1;
  }
}

function $toUPlusString(c){
  var hexString;
  hexString = toPowerOfTwoString(c, 4);
  switch (hexString.length) {
    case 1:
      return 'U+000' + hexString;
    case 2:
      return 'U+00' + hexString;
    case 3:
      return 'U+0' + hexString;
    default:return 'U+' + hexString;
  }
}

function getClass_70(){
  return Lnu_validator_htmlparser_impl_ErrorReportingTokenizer_2_classLit;
}

function ErrorReportingTokenizer(){
}

_ = ErrorReportingTokenizer.prototype = new Tokenizer;
_.getClass$ = getClass_70;
_.typeId$ = 0;
_.alreadyComplainedAboutNonAscii = false;
_.alreadyWarnedAboutPrivateUseCharacters = false;
_.col = 0;
_.colPrev = 0;
_.line = 0;
_.linePrev = 0;
_.nextCharOnNewLine = false;
_.prev = 0;
function $clinit_128(){
  $clinit_128 = nullMethod;
  EMPTY_ATTRIBUTENAMES = initDim(_3Lnu_validator_htmlparser_impl_AttributeName_2_classLit, 60, 13, 0, 0);
  EMPTY_STRINGS = initDim(_3Ljava_lang_String_2_classLit, 56, 1, 0, 0);
  EMPTY_ATTRIBUTES = $HtmlAttributes(new HtmlAttributes, 0);
}

function $HtmlAttributes(this$static, mode){
  $clinit_128();
  this$static.mode = mode;
  this$static.length_0 = 0;
  this$static.names = initDim(_3Lnu_validator_htmlparser_impl_AttributeName_2_classLit, 60, 13, 5, 0);
  this$static.values = initDim(_3Ljava_lang_String_2_classLit, 56, 1, 5, 0);
  this$static.xmlnsLength = 0;
  this$static.xmlnsNames = EMPTY_ATTRIBUTENAMES;
  this$static.xmlnsValues = EMPTY_STRINGS;
  return this$static;
}

function $addAttribute(this$static, name_0, value, xmlnsPolicy){
  var newLen, newNames, newValues;
  name_0 == ($clinit_124() , ID);
  if (name_0.xmlns) {
    if (this$static.xmlnsNames.length == this$static.xmlnsLength) {
      newLen = this$static.xmlnsLength == 0?2:this$static.xmlnsLength << 1;
      newNames = initDim(_3Lnu_validator_htmlparser_impl_AttributeName_2_classLit, 60, 13, newLen, 0);
      arraycopy(this$static.xmlnsNames, 0, newNames, 0, this$static.xmlnsNames.length);
      this$static.xmlnsNames = newNames;
      newValues = initDim(_3Ljava_lang_String_2_classLit, 56, 1, newLen, 0);
      arraycopy(this$static.xmlnsValues, 0, newValues, 0, this$static.xmlnsValues.length);
      this$static.xmlnsValues = newValues;
    }
    this$static.xmlnsNames[this$static.xmlnsLength] = name_0;
    this$static.xmlnsValues[this$static.xmlnsLength] = value;
    ++this$static.xmlnsLength;
    switch (xmlnsPolicy.ordinal) {
      case 1:
        throw $SAXException(new SAXException, 'Saw an xmlns attribute.');
      case 2:
        return;
    }
  }
  if (this$static.names.length == this$static.length_0) {
    newLen = this$static.length_0 << 1;
    newNames = initDim(_3Lnu_validator_htmlparser_impl_AttributeName_2_classLit, 60, 13, newLen, 0);
    arraycopy(this$static.names, 0, newNames, 0, this$static.names.length);
    this$static.names = newNames;
    newValues = initDim(_3Ljava_lang_String_2_classLit, 56