define(["jquery", "util"], function($, util) {
"use strict";

/*
 * The controller:
 * - capture events related to the canvas and modify the view accordingly
 */
return function(renderer, canvas, params) {

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

	$(canvas).mousedown(function(e) {
		isDragging = true;
		dragX = ldragX = e.screenX;
		dragY = ldragY = e.screenY;
		dragStartDesc = renderer.getFractalDesc();
	});

	$(window).mouseup(function(e) {
		isDragging = false;
	});

	$(window).mousemove(function(e) {
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
			util.callbackHelp(callbacks["mouse.control"], vector);

	        ldragX = e.screenX;
	        ldragY = e.screenY;
		}
	});

	$(canvas).bind('wheel', function(e){
		//console.log(e)
		var mousex = e.originalEvent.clientX;
		var mousey = e.originalEvent.clientY;

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

	    if(e.originalEvent.deltaY > 0) {
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
		util.callbackHelp(callbacks["mouse.control"], vector);
	});

}

if (params.fitToWindow) {
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	renderer.resize();
	$(window).resize(function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		renderer.resize();
		renderer.draw();
	});
}

//-------- private methods


//-------- public methods

return {

on: function(event, callback) {
	callbacks[event].push(callback);
}

};

};
});