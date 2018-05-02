
(function (markdownTest) {
	markdownTest.test = function() {
		var html = `<pre>function MyClass() {
   var privateValue = 'secret';

   function privateMethod() { }

   this.aMethod = function() {
     // privateValue and privateMethod are accessible here.
     return privateValue;
   }
};</pre><br><br>
<span>Some text</span>
<br>
<strong>Some strong text</strong>
<br>
<pre>git fetch origin master:master</pre>`

		var html2 = '<pre>f</pre><br><pre>a</pre>';

	//
		var markdownText = markdown.htmlToMarkdown(html);
		console.log(markdownText);
	}
}(window.markdownTest = window.markdownTest || {}));