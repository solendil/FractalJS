/*
 * The controller:
 * - capture events related to the canvas and modify the view accordingly
 * - loads the URL parameters and updates the URL in relatime
 */
FractalJS.Controller = function(fractal, model) {
"use strict";

//-------- private members

var zoomFactor = 1.3;
var angle = Math.PI/180;

var isDragging;			// is the user dragging ?
var dragX, dragY;		// start dragging point
var dragStartDesc;		// start fractal description
var ldragX, ldragY;		// last dragging point

//-------- shortcuts

var canvas = fractal.params.canvas;
var params = fractal.params.controller;
var events = fractal.events;

//-------- public members

this.url = new FractalJS.Url(model, fractal);

//-------- event catchers

var rotate = function(angle) {
	model.camera.angle += angle;
	model.camera.project();
	fractal.draw("user.control");
};

var pan = function(x, y) {
	var cam = model.camera;
	var deltax = x * cam.width * cam.pixelOnP;
	var deltay = y * cam.height * cam.pixelOnP;
	var screenx = x * cam.width;
	var screeny = y * cam.height;
	cam.setXYW(cam.x - deltax, cam.y - deltay);
	fractal.draw("user.control",{x:screenx,y:-screeny,mvt:"pan"});
	events.send("user.control");
};

var zoom = function(x, y, delta) {
	var cam = model.camera;

	// test if we're at the maximum possible resolution (1.11e-15/pixel)
	var sminExtent = Math.min(cam.width, cam.height);
	var limit = sminExtent*1.11e-15;
	if (cam.w<=limit && delta < 0) {
		events.send("zoom.limit.reached");
		return;
	}

	var origin = cam.S2C(0,0), startRatio = cam.pixelOnP;
	var z = cam.S2C(x,y);					// complex point under mouse
	var vec = {x:cam.x-z.x, y:cam.y-z.y};   // vector to complex point at center
	var zoom =delta<0?1/zoomFactor:zoomFactor; // zoom multiplicator according to movement
	cam.setXYW(z.x+vec.x*zoom, z.y+vec.y*zoom, cam.w*zoom); // adjust camera using scaled vector
	var dest = cam.S2C(0,0);
	var vector = {x:(origin.x-dest.x)/startRatio, y:-(origin.y-dest.y)/startRatio,
		z:1/zoom, mvt:delta<0?"zoomin":"zoomout", sx:x,sy:y};
	fractal.draw("user.control",vector);
	events.send("user.control");
};

if (params.keyboardControl) {
	var panRatio = 0.095;
	document.onkeydown = function(e) {
	    e = e || window.event;
		console.log(e);
	    var keyCode = (typeof e.which == "number") ? e.which : e.keyCode;
		switch (keyCode) {
			case 107: zoom(canvas.width/2, canvas.height/2, -1); break; // key +, zoom in
			case 109: zoom(canvas.width/2, canvas.height/2, 1); break;  // key -, zoom out
			case 37: pan(panRatio, 0); break; // left arrow
			case 38: pan(0, -panRatio); break; // up arrow
			case 39: pan(-panRatio, 0); break; // right arrow
			case 40: pan(0, panRatio); break; // down arrow
			case 82: rotate(angle); break; // R
			case 84: rotate(-angle); break; // T
		}
	};
}

if (params.mouseControl) {

	canvas.onmousedown = function(e) {
		if (!e) e = window.event;
		if (e.button !== 0)
			return;
		isDragging = true;
		dragX = ldragX = e.screenX;
		dragY = ldragY = e.screenY;
		if (e.button !== 0)
			return;
		dragStartDesc = model.camera.clone();
	};

	window.addEventListener("mouseup", function(e) {
		if (!e) e = window.event;
		isDragging = false;
	});

	window.addEventListener("mousemove", function(e) {
		if (!e) e = window.event;
		if (isDragging) {
			var vecx = e.screenX-dragX;
			var vecy = e.screenY-dragY;
			var vecpx = vecx*dragStartDesc.pixelOnP;
			var vecpy = vecy*dragStartDesc.pixelOnP;
			model.camera.setXYW(dragStartDesc.x-vecpx, dragStartDesc.y+vecpy);

			var vfx = e.screenX - ldragX;
			var vfy = e.screenY - ldragY;
			var vector = {x:vfx,y:vfy,mvt:"pan"};
			fractal.draw("user.control",vector);
			events.send("user.control");
			ldragX = e.screenX;
			ldragY = e.screenY;
		}
	});

	var wheelFunction = function(e) {
		if (!e) e = window.event;
		e.preventDefault();
	  var delta = e.deltaY || e.wheelDelta; // IE11 special
		zoom(e.clientX, e.clientY, delta);
	};

	// IE11 special
	if ("onwheel" in canvas)
		canvas.onwheel = wheelFunction;
	else
		canvas.onmousewheel = wheelFunction;

}

if (params.fitToWindow) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	model.resize();
	window.onresize = function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		fractal.resize();
		fractal.draw("init");
	};
}

//-------- constructor & jquery callbacks

events.on("iter.change", this.url.update);
events.on("user.control", this.url.update);
events.on("api.change", this.url.update);

};
