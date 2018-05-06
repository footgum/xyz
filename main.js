
(function() {
	document.onkeypress = function(e) {
		if (e.keyCode === 13 && document.getElementById('editPanelDiv') == null) {
			edit();
		}
	}
	
	document.onkeydown = function(e) {
		var editPanelDiv = document.getElementById('editPanelDiv');
		if (e.keyCode === 27 && editPanelDiv != null) {
			editPanelDiv.insertAdjacentHTML('afterend', editPanelDiv.oldHTML);
			editPanelDiv.parentNode.removeChild(editPanelDiv);
		}
	}
})();

(function (editPanel) {
	editPanel.showEdit = function(event, showEditButton) {
		event.preventDefault();
		var editPanelDiv = showEditButton.parentNode.parentNode;
		editPanelDiv.previewSubPanel.style.display = 'none';
		editPanelDiv.editSubPanel.style.display = 'block';
	}
	
	editPanel.showPreview = function(event, showPreviewButton) {
		event.preventDefault();
		var editPanelDiv = showPreviewButton.parentNode.parentNode;
		var html = markdownToHtml.convert(editPanelDiv.textarea.value);
		editPanelDiv.previewSubPanel.innerHTML = html;
		editPanelDiv.previewSubPanel.style.display = 'block';
		editPanelDiv.editSubPanel.style.display = 'none';
	}
	
	editPanel.saveChanges = function(event, saveChangesButton) {
		event.preventDefault();
		var editPanelDiv = saveChangesButton.parentNode.parentNode;
		var html = markdownToHtml.convert(editPanelDiv.textarea.value);

		editPanelDiv.insertAdjacentHTML('afterend', html);
		editPanelDiv.parentNode.removeChild(editPanelDiv);
	}
	
	editPanel.cancel = function(event, cancelButton) {
		event.preventDefault();
		var editPanelDiv = cancelButton.parentNode.parentNode;
		editPanelDiv.insertAdjacentHTML('afterend', editPanelDiv.oldHTML);
		editPanelDiv.parentNode.removeChild(editPanelDiv);
	}
	
	editPanel.onTextareaInput = function(editPanelDiv) {
		editPanelDiv.textarea.style.height = 'auto';
		editPanelDiv.textarea.style.height = (editPanelDiv.textarea.scrollHeight + 10) + 'px';
		editPanelDiv.previewSubPanel.style.height = Math.max(
		editPanelDiv.previewSubPanel.offsetHeight, editPanelDiv.textarea.scrollHeight + 10) + 'px';
		editPanelDiv.editSubPanel.style.height = Math.max(
		editPanelDiv.previewSubPanel.offsetHeight, editPanelDiv.textarea.scrollHeight + 10) + 'px';
	}
	
	editPanel.init = function() {
		var editPanelDiv = document.getElementById('editPanelTemplate').cloneNode(true);
		editPanelDiv.id = 'editPanelDiv';
		var previewSubPanel = firstChildNode(editPanelDiv);
		var editSubPanel = nextElement(previewSubPanel);
		var textarea = firstChildNode(editSubPanel);
		
		var selectionHtml = getSelectionHtml();
		var selectionMarkdown = markdown.htmlToMarkdown(selectionHtml);
		textarea.value = selectionMarkdown;
		editPanelDiv.textarea = textarea;
		editPanelDiv.previewSubPanel = previewSubPanel;
		editPanelDiv.editSubPanel = editSubPanel;
		editPanelDiv.oldHTML = selectionHtml;
		editPanelDiv.style.display = 'block';
		return editPanelDiv;
	}
}(window.editPanel = window.editPanel || {}));

  function getSelectionHtml() {
    var html = "";
	var sel = window.getSelection();
	if (sel.rangeCount) {
	    var range = sel.getRangeAt(0);
		
		var node = getElement(range.startContainer);
		var weAreBeyondSelection = false;
		do {
			html += node.outerHTML;
			
			if (weAreBeyondSelection && node.tagName == 'BR')
				break;
			else if (node === getElement(range.endContainer))
			    weAreBeyondSelection = true;
			else
				html += '\n';
			node = nextElement(node);
		} while (node);
		
		node = previousElement(getElement(range.startContainer));
		while (node) {
			if (node.tagName == 'BR')
				break;
			html = node.outerHTML + '\n' + html;
			node = previousElement(node);
		}
	}
    return html;
  }
  
  function deleteSelectedNodes() {
    var html = "";
	var sel = window.getSelection();
	if (sel.rangeCount) {
	    var range = sel.getRangeAt(0);
		
		var weAreBeyondEndContainer = false;
		var nodesToRemove = [];
		var node = getElement(range.startContainer);
		do {
			nodesToRemove.push(node);
			if (weAreBeyondEndContainer && node.tagName == 'BR')
				break;
			else if (node === getElement(range.endContainer))
			    weAreBeyondEndContainer = true;
			node = nextElement(node);
		} while (node);
		
		node = previousElement(getElement(range.startContainer));
		while (node) {
			if (node.tagName == 'BR')
				break;
			if (node.tagName != 'DIV')
				nodesToRemove.push(node);
			node = previousElement(node);
		}
		
		nodesToRemove.forEach(e => e.parentNode.removeChild(e));
	}
    return html;
  }
  
  function moveSelectionToNode(node) {
	
  }
  
  function getElement(node) {
      return node.nodeType == 1 ? node : node.parentNode;
  }
  
  function nextElement(node) {
      do {
	      node = node.nextSibling;
	  } while (node && node.nodeType != 1);
	  return node;
  }
  
  function previousElement(node) {
      do {
	      node = node.previousSibling;
	  } while (node && node.nodeType != 1);
	  return node;
  }
  
  function firstChildNode(parent) {
      var node = parent.firstChild;
	  while (node && node.nodeType != 1) {
	      node = node.nextSibling;
	  }
	  return node;
  }
  
  function state2() {
      if (document.state)
	      return document.state;
	  document.state = {};
	  return document.state;
  }
  
	function onTextareaInput() {
		this.style.height = 'auto';
		this.style.height = (this.scrollHeight + 10) + 'px';
	}
	
	function initTextarea(textarea, editPanelDiv) {
		textarea.setAttribute('style', 'height:' + (textarea.scrollHeight + 10) + 'px;overflow-y:hidden;');
		textarea.addEventListener('input', function() { editPanel.onTextareaInput(editPanelDiv); }, false);
	}
  
  function edit() {
	var state = state2();
	var selection = window.getSelection();
	var range = selection.getRangeAt(0);
	var node = getElement(range.startContainer);
	state.nodesInEdit = [];
	state.nodesInEdit.push(node);

	var editPanelDiv = editPanel.init();
	
	node.parentNode.insertBefore(editPanelDiv, node);
	deleteSelectedNodes();

	initTextarea(editPanelDiv.textarea, editPanelDiv);
	editPanelDiv.previewSubPanel.style.height = Math.max(
		editPanelDiv.previewSubPanel.offsetHeight, editPanelDiv.editSubPanel.offsetHeight) + 'px';
	editPanelDiv.editSubPanel.style.height = Math.max(
		editPanelDiv.previewSubPanel.offsetHeight, editPanelDiv.editSubPanel.offsetHeight) + 'px';
  }