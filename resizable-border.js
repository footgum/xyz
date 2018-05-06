(function() {
	var isResizing = false;
	var lastDownX = 0;
	
	var container = document.getElementById("container"),
		left = document.getElementById("left_panel"),
		right = document.getElementById("right_panel"),
		handle = document.getElementById("drag");
		
	var clientX = localStorage.getItem('borderPosition') || 200;
	var offsetRight = container.clientWidth - (clientX - container.offsetLeft);

	left.style.right = offsetRight + "px"; 
	right.style.width = offsetRight + "px"; 

	handle.onmousedown = function(e) {
		isResizing = true;
		lastDownX = e.clientX;
	};

	document.onmousemove = function(e) {
		// we don't want to do anything if we aren't resizing.
		if (!isResizing) {
			return;
		}

		var offsetRight = container.clientWidth - (e.clientX - container.offsetLeft);

		left.style.right = offsetRight + "px"; 
		right.style.width = offsetRight + "px"; 
	}

	document.onmouseup = function(e) {
		// stop resizing
		if (isResizing) {
			isResizing = false;
			localStorage.setItem('borderPosition', e.clientX);
		}
	}
})();