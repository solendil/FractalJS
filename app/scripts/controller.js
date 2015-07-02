FractalJS.Controller = function(renderer, canvas, params) {

//-------- private members

var zoomFactor = 1.3;

var isDragging;			// is the user dragging ?
var dragX, dragY;		// start dragging point
var dragStartDesc;		// start fractal description
var ldragX, ldragY;		// last dragging point

var callbacks = {		// external callbacks
	"mouse.control":[],
};

//-------- event catchers

if (params.mouseControl) {

	canvas.onmousedown = function(e) {
		if (!e) e = window.event;
		isDragging = true;
		dragX = ldragX = e.screenX;
		dragY = ldragY = e.screenY;
		dragStartDesc = renderer.getFractalDesc();
	};

	window.onmouseup = function(e) {
		if (!e) e = window.event;
		isDragging = false;
	};

	window.onmousemove = function(e) {
		if (!e) e = window.event;
		if (isDragging) {
			var vecx = e.screenX-dragX;
			var vecy = e.screenY-dragY;
			var vecpx = vecx*dragStartDesc.pixelOnP;
			var vecpy = vecy*dragStartDesc.pixelOnP;
			var c = {x:dragStartDesc.x-vecpx, y:dragStartDesc.y-vecpy};
			renderer.setFractalDesc(c);

	        var vfx = e.screenX - ldragX;
	        var vfy = e.screenY - ldragY;  
	        var vector = {x:vfx,y:vfy,mvt:"pan"};     
			renderer.draw(vector);
			FractalJS.util.callbackHelp(callbacks["mouse.control"], vector);

	        ldragX = e.screenX;
	        ldragY = e.screenY;
		}
	};

	var wheelFunction = function(e) {
		if (!e) e = window.event;
		var mousex = e.clientX;
		var mousey = e.clientY;

	    var startDesc = renderer.getFractalDesc();
	    var c = renderer.getFractalDesc();

		// zoom in place, two steps : 
		// 1) translate complex point under mouse to center
		// 2) zoom, and translate back by the zoomed vector
		// should happen in only one step if I could figure out the math :-)
		var pax = (mousex - c.swidth/2)*c.pixelOnP;
		var pay = (mousey - c.sheight/2)*c.pixelOnP;
		c.x += pax;
		c.y += pay;
		c = renderer.setFractalDesc(c);
	    var vector = {sx:mousex,sy:mousey};

	    var delta = e.deltaY || e.wheelDelta; // IE11 special

	    if(delta > 0) {
	        c.w /= zoomFactor;
			c.x -= pax / zoomFactor;
			c.y -= pay / zoomFactor;
	        vector.z = 1 * zoomFactor;
	        vector.mvt = "zoomin";
	    } else {
	        c.w *= zoomFactor;
			c.x -= pax * zoomFactor;
			c.y -= pay * zoomFactor;
	        vector.z = 1 / zoomFactor;
	        vector.mvt = "zoomout";
	    }
	    var endDesc = renderer.setFractalDesc(c);

	    // computes the movement vector, then redraws
	    vector.x = (startDesc.pxmin - endDesc.pxmin) / startDesc.pixelOnP;
	    vector.y = (startDesc.pymin - endDesc.pymin) / startDesc.pixelOnP;
		renderer.draw(vector);
		FractalJS.util.callbackHelp(callbacks["mouse.control"], vector);

		e.preventDefault();
	};

	// IE11 special
	if ("onwheel" in canvas) 
		canvas.onwheel = wheelFunction
	else 
		canvas.onmousewheel = wheelFunction

}

if (params.fitToWindow) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	renderer.resize();
	window.onresize = function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		renderer.resize();
		renderer.draw();
	};
}

//-------- private methods


//-------- public methods

return {

on: function(event, callback) {
	callbacks[event].push(callback);
}

};

};
