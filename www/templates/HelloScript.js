Aria.tplScriptDefinition( {
  $classpath : 'templates.HelloScript',

	$prototype : {
			onContinue : function(){
			Aria.loadTemplate({
				classpath:"templates.Thanks",
				div:"myContainer",
				data:{
				msg:"Hello World, this is AriaTemplates!"
				}
	});			
	}
		
	  }
});