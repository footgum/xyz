
function CodeBlockHandler() {
	
	var openingTagIndex = 0;
	var closingTagIndex = 0;
	var OPENING_TAG = '<pre>';
	var CLOSING_TAG = '</pre>';
	
	var OPENING_TAG_SUBSTITUTION = '`';
	var CLOSING_TAG_SUBSTITUTION = '`';
	
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

function StrongHandler() {
	
	var openingTagIndex = 0;
	var closingTagIndex = 0;
	var OPENING_TAG = '<strong>';
	var CLOSING_TAG = '</strong>';
	
	var OPENING_TAG_SUBSTITUTION = '*';
	var CLOSING_TAG_SUBSTITUTION = '*';
	
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

function PlainTextHandler() {
	
	var openingTagIndex = 0;
	var closingTagIndex = 0;
	var OPENING_TAG = '<span>';
	var CLOSING_TAG = '</span>';
	
	var OPENING_TAG_SUBSTITUTION = '';
	var CLOSING_TAG_SUBSTITUTION = '';
	
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
	var OPENING_TAG = '<br>';
	
	this.openingTagSubstitution = function() { 
		return '\n';
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

(function (markdown) {
	
	markdown.htmlToMarkdown = function(html) {
		
		var OMIT_CHARACTERS = '\n \t';
		var allHandlers = [new CodeBlockHandler(), 
		                   new PlainTextHandler(),
						   new LineBreakHandler(),
						   new StrongHandler()];
		var candidateHandlers = allHandlers;
		var currentHandler = null;
		
		var buffer = '';
		var result = '';
		for (var i = 0; i < html.length; i++) {
			var ch = html.charAt(i);
			if (currentHandler == null && OMIT_CHARACTERS.indexOf(ch) != -1)
				ch = '';
			
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
			
			if (currentHandler != null)
				continue;
			
			if (tmpHandlers.length == 0) {
				if (candidateHandlers.length > 0)
					result += buffer;
				buffer = '';
				candidateHandlers = allHandlers;
			}
			else
				candidateHandlers = tmpHandlers;
		}
		return result;
	}
}(window.markdown = window.markdown || {}));