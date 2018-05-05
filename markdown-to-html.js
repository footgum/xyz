(function (markdownToHtml) {

function LinkHandler() {
	
	var openingTagIndex = 0;
	var closingTagIndex = 0;
	var OPENING_TAG = '[http';
	var CLOSING_TAG = ']';
	
	var buffer = '';
	
	
	this.openingTagSubstitution = function() { 
		return '';
	}
	
	this.isClosingTagReached = function() {
		return CLOSING_TAG.length == closingTagIndex;
	}
	
	this.handleChar = function(ch) {
		if (CLOSING_TAG.charAt(closingTagIndex) == ch) {
			closingTagIndex++;
			
			if (this.isClosingTagReached()) {
				return `<a href="http${buffer}">http${buffer}</a>`;
			}
			else
				return '';
		}
		
		buffer += ch;
		
		return '';
	}
	
	this.reset = function() {
		openingTagIndex = 0;
		closingTagIndex = 0;
		buffer = '';
	}
	
	this.checkForPossibleOpeningTag = function(ch) {
		if (OPENING_TAG.charAt(openingTagIndex) == ch) {
			openingTagIndex++;
			return true;
		}
		openingTagIndex = 0;
		return false;
	}
	
	this.isFullOpeningTagFound = function() {
		return OPENING_TAG.length == openingTagIndex;
	}
}

function CodeBlockHandler() {
	
	var openingTagIndex = 0;
	var closingTagIndex = 0;
	var OPENING_TAG = '`';
	var CLOSING_TAG = '`';
	
	var OPENING_TAG_SUBSTITUTION = '<pre>';
	var CLOSING_TAG_SUBSTITUTION = '</pre>';
	
	var entityMap = {
	  '&': '&amp;',
	  '<': '&lt;',
	  '>': '&gt;',
	  '"': '&quot;'
	};

	function escapeHtml(string) {
	  return String(string).replace(/[&<>"'`=\/]/g, function (s) {
		return entityMap[s];
	  });
	}
	
	this.openingTagSubstitution = function() { 
		return OPENING_TAG_SUBSTITUTION;
	}
	
	this.isClosingTagReached = function() {
		return CLOSING_TAG.length == closingTagIndex;
	}
	
	this.handleChar = function(ch) {
		if (CLOSING_TAG.charAt(closingTagIndex) == ch) {
			closingTagIndex++;
		
			if (this.isClosingTagReached())
				return CLOSING_TAG_SUBSTITUTION;
			else
				return '';
		}
		
		return entityMap[ch] || ch;
		
		/*switch (ch) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			default: return ch;
		}*/
	}
	
	this.reset = function() {
		openingTagIndex = 0;
		closingTagIndex = 0;
	}
	
	this.checkForPossibleOpeningTag = function(ch) {
		if (OPENING_TAG.charAt(openingTagIndex) == ch) {
			openingTagIndex++;
			return true;
		}
		openingTagIndex = 0;
		return false;
	}
	
	this.isFullOpeningTagFound = function() {
		return OPENING_TAG.length == openingTagIndex;
	}
}

function StrongHandler() {
	
	var openingTagIndex = 0;
	var closingTagIndex = 0;
	var OPENING_TAG = '*';
	var CLOSING_TAG = '*';
	
	var OPENING_TAG_SUBSTITUTION = '<strong>';
	var CLOSING_TAG_SUBSTITUTION = '</strong>';
	
	this.openingTagSubstitution = function() { 
		return OPENING_TAG_SUBSTITUTION;
	}
	
	this.isClosingTagReached = function() {
		return CLOSING_TAG.length == closingTagIndex;
	}
	
	this.handleChar = function(ch) {
		if (CLOSING_TAG.charAt(closingTagIndex) == ch) {
			closingTagIndex++;
		
			if (this.isClosingTagReached())
				return CLOSING_TAG_SUBSTITUTION;
			else
				return '';
		}
		
		var result = '';
		
		result += ch;
		return result;
	}
	
	this.reset = function() {
		openingTagIndex = 0;
		closingTagIndex = 0;
	}
	
	this.checkForPossibleOpeningTag = function(ch) {
		if (OPENING_TAG.charAt(openingTagIndex) == ch) {
			openingTagIndex++;
			return true;
		}
		openingTagIndex = 0;
		return false;
	}
	
	this.isFullOpeningTagFound = function() {
		return OPENING_TAG.length == openingTagIndex;
	}
}

function LineBreakHandler() {
	
	var openingTagIndex = 0;
	var OPENING_TAG = '\n';
	
	this.openingTagSubstitution = function() { 
		return '\n<br>\n';
	}
	
	this.isClosingTagReached = function() {
		return true;
	}
	
	this.handleChar = function(ch) {
		return ch;
	}
	
	this.reset = function() {
		openingTagIndex = 0;
	}
	
	this.checkForPossibleOpeningTag = function(ch) {
		if (OPENING_TAG.charAt(openingTagIndex) == ch) {
			openingTagIndex++;
			return true;
		}
		openingTagIndex = 0;
		return false;
	}
	
	this.isFullOpeningTagFound = function() {
		return OPENING_TAG.length == openingTagIndex;
	}
}


	
	markdownToHtml.convert = function(html) {
		
		var OMIT_CHARACTERS = '\r';
		var allHandlers = [new CodeBlockHandler(),
						   new LineBreakHandler(),
						   new StrongHandler(),
						   new LinkHandler()];
		var candidateHandlers = allHandlers;
		var currentHandler = null;
		
		var weAreCurrentlyInPlainText = false;
		var buffer = '';
		var result = '';
		for (var i = 0; i < html.length; i++) {
			var ch = html.charAt(i);
			if (OMIT_CHARACTERS.indexOf(ch) != -1)
				break;
			
			buffer += ch;

			if (currentHandler != null) {
				result += currentHandler.handleChar(ch);
				if (currentHandler.isClosingTagReached()) {
					currentHandler.reset();
					currentHandler = null;
					candidateHandlers = allHandlers;
					buffer = '';
				}
				continue;
			}
			
			let tmpHandlers = [];
			for (var j = 0; j < candidateHandlers.length; j++) {
				var candidateHandler = candidateHandlers[j];
				if (candidateHandler.checkForPossibleOpeningTag(ch)) {
					if (candidateHandler.isFullOpeningTagFound()) {
						currentHandler = candidateHandler;
						if (weAreCurrentlyInPlainText)
							result += '</span>';
						weAreCurrentlyInPlainText = false;
						result += currentHandler.openingTagSubstitution();
						if (currentHandler.isClosingTagReached()) {
							currentHandler.reset();
							currentHandler = null;
							candidateHandlers = allHandlers;
							buffer = '';
						}
						break;
					}
					else
						tmpHandlers.push(candidateHandler);
				}
			}
			
			if (currentHandler != null || buffer.length == 0)
				continue;
			
			if (tmpHandlers.length == 0) {
				if (!weAreCurrentlyInPlainText) {
					weAreCurrentlyInPlainText = true;
					result += '<span>';
				}
				if (candidateHandlers.length > 0)
					result += buffer;
				else
					result += ch;
				buffer = '';
				candidateHandlers = allHandlers;
			}
			else
				candidateHandlers = tmpHandlers;
		}
		
		if (weAreCurrentlyInPlainText)
			result += '</span>';
		return result;
	}
}(window.markdownToHtml = window.markdownToHtml || {}));