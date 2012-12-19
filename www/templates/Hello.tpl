{Template {
    $classpath:'templates.Hello',
	 $hasScript:true
}}
  {macro main()}
      <h1>Welcome to Hybrid iOS Demo</h1>
	  <input type="button" value="Continue" {on click onContinue/}>
  {/macro}
{/Template}