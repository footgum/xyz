(function (markdownToHtmlTest) {

	var assertEquals = function(expected, real) {
		if (expected === real)
			console.log('OK');
		else
			console.log(`Error. Expected ${expected}, but was ${real}`);
	}
	
	markdownToHtmlTest.test = function() {
		var markdownText = `\`function MyClass() {
   var privateValue = 'secret';

   function privateMethod() { }

   this.aMethod = function() {
     // privateValue and privateMethod are accessible here.
     return privateValue;
   }
};\`

Some text
*Some strong text*
\`git fetch origin master:master\``;;

		var html = markdownToHtml.convert(markdownText);
		
		var expectedHtml = `<pre>function MyClass() {
   var privateValue = 'secret';

   function privateMethod() { }

   this.aMethod = function() {
     // privateValue and privateMethod are accessible here.
     return privateValue;
   }
};</pre>
<br>

<br>
<span>Some text</span>
<br>
<strong>Some strong text</strong>
<br>
<pre>git fetch origin master:master</pre>`

		assertEquals(expectedHtml, html);
		
		markdownText = 'Обновить мастер, находясь в это время в *другой* ветке';
		html = markdownToHtml.convert(markdownText);
		expectedHtml = '<span>Обновить мастер, находясь в это время в </span><strong>другой</strong><span> ветке</span>';
		assertEquals(expectedHtml, html);
	}
}(window.markdownToHtmlTest = window.markdownToHtmlTest || {}));