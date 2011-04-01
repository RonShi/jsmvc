//steal/js demoself/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('demoself/scripts/build.html',{to: 'demoself'});
});
