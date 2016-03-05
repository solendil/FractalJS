/*
 * The controller:
 * - capture events related to the canvas and modify the view accordingly
 * - loads the URL parameters and updates the URL in relatime
 */
FractalJS.Controller = function(fractal, model) {
"use strict";

//-------- private members

var ZOOM  = 0.3; // 1+
var SCALE = 0.1; // 1+
var SHEAR = 0.1;
var ANGLE = Math.PI/18;
var PAN   = 0.095;

//-------- shortcuts

var canvas = fractal.params.canvas;
var params = fractal.params.controller;
var events = fractal.events;
var camera = model.camera;

//-------- public members

this.url = new FractalJS.Url(model, fractal);

//-------- event catchers

/*
 * This section of code manipulates a lot of geometry on both the screen space and
 * complex. Some conventions help to make te code readable:
 *   v : vector
 *   p : point
 *   s : screen space
 *   c : complex space
 */

// transforms the viewport
var transformViewport = function(type, value) {
	var matrix = model.camera.transformViewport(type, value);
	fractal.draw("user.control", {matrix:matrix});
	events.send("user.control");
};

// pan the screen by the given ration of its resolution
var pan = function(ratiox, ratioy) {
	var vsx = ratiox * camera.width, vsy = -ratioy * camera.height;
	var pc1 = camera.S2C(0,0), pc2 = camera.S2C(vsx,vsy); // [pc1,pc2] is the movement vector on C
	camera.setXYW(camera.x - (pc2.x - pc1.x), camera.y - (pc2.y - pc1.y));
	fractal.draw("user.control",{x:vsx,y:vsy,mvt:"pan"});
	events.send("user.control");
};

// zoom the screen at the given screen point, using the given delta ratio
var zoom = function(psx, psy, delta) {
	// test if we're at the maximum possible resolution (1.11e-15/pixel)
	console.log(delta)
	var extent = Math.min(camera.width, camera.height);
	var limit = extent*1.11e-15;
	if (camera.w<=limit && delta < 1) {
		events.send("zoom.limit.reached");
		return;
	}

	var pc00 = camera.S2C(0,0);
	var pc = camera.S2C(psx,psy);				// complex point under mouse
	var vc = {x:camera.x-pc.x, y:camera.y-pc.y};   // vector to complex point at center
	camera.setXYW(pc.x+vc.x*delta, pc.y+vc.y*delta, camera.w*delta); // adjust camera using scaled vector
	var ps00A = camera.C2S(pc00.x,pc00.y);

	var vector = {x:ps00A.x*delta, y:ps00A.y*delta, z:1/delta, mvt:delta<1?"zoomin":"zoomout", sx:psx,sy:psy};
	fractal.draw("user.control",vector);
	events.send("user.control");
};

var keymap = []; // Or you could call it "key"

if (params.keyboardControl) {
	document.onkeyup = function(e) {
	    e = e || window.event;
	    keymap[e.keyCode] = false;
	};
	document.onkeydown = function(e) {
	    e = e || window.event;
	    keymap[e.keyCode] = true;
	    var keyCode = (typeof e.which == "number") ? e.which : e.keyCode;
	    var modifier = 1;
	    if (event.getModifierState("Shift")) modifier = 1/10;
		switch (keyCode) {
			case 107: zoom(canvas.width/2, canvas.height/2, 1/(1+ZOOM*modifier)); break; // key +, zoom in
			case 109: zoom(canvas.width/2, canvas.height/2, 1+ZOOM*modifier); break;  // key -, zoom out
			case 86 : // key V, reset viewport
				camera.resetViewport();
				fractal.draw("init");
				events.send("user.control");
				break;
			case 37: // left arrow
				if (keymap[82]===true) // R
					transformViewport("rotate", -ANGLE*modifier);
				else if (keymap[83]===true) // S
					transformViewport("scaleX", 1+SCALE*modifier);
				else if (keymap[72]===true) // H
					transformViewport("shearX", SHEAR*modifier);
				else
					pan(PAN*modifier, 0);
				break;
			case 39: // right arrow
				if (keymap[82]===true) // R
					transformViewport("rotate", ANGLE*modifier);
				else if (keymap[83]===true) // S
					transformViewport("scaleX", 1/(1+SCALE*modifier));
				else if (keymap[72]===true) // H
					transformViewport("shearX", -SHEAR*modifier);
				else
					pan(-PAN*modifier, 0);
				break;
			case 38: // up arrow
				if (keymap[83]===true) // S
					transformViewport("scaleY", 1/(1+SCALE*modifier));
				else if (keymap[72]===true) // H
					transformViewport("shearY", -SHEAR*modifier);
				else
					pan(0, -PAN*modifier);
				break;
			case 40: // down arrow
				if (keymap[83]===true) // S
					transformViewport("scaleY", 1+SCALE*modifier);
				else if (keymap[72]===true) // H
					transformViewport("shearY", SHEAR*modifier);
				else
					pan(0, PAN*modifier);
				break;
		}
	};
}

if (params.mouseControl) {

	var isDragging;			// is the user dragging ?
	var dragX, dragY;		// start dragging point
	var ldragX, ldragY;		// last dragging point
	var camStart;			// start camera

	canvas.onmousedown = function(e) {
		if (!e) e = window.event;
		if (e.button !== 0)
			return;
		isDragging = true;
		dragX = ldragX = e.screenX;
		dragY = ldragY = e.screenY;
		if (e.button !== 0)
			return;
		camStart = model.camera.clone();
	};

	window.addEventListener("mouseup", function(e) {
		if (!e) e = window.event;
		isDragging = false;
	});

	window.addEventListener("mousemove", function(e) {
		if (!e) e = window.event;
		if (isDragging) {
			var vsx = e.screenX - dragX; // since beginning
			var vsy = e.screenY - dragY;
			var pc1 = camStart.S2C(0,0), pc2 = camStart.S2C(vsx,vsy); // [pc1,pc2] is the movement vector on C
			camera.setXYW(camStart.x - (pc2.x - pc1.x), camStart.y - (pc2.y - pc1.y));
			var vsxr = e.screenX - ldragX; // relative to last frame
			var vsyr = e.screenY - ldragY;
			fractal.draw("user.control",{x:vsxr,y:vsyr,mvt:"pan"});
			events.send("user.control");
			ldragX = e.screenX;
			ldragY = e.screenY;
		}
	});


	var wheelFunction = function(e) {
		if (!e) e = window.event;
		e.preventDefault();
		var modifier = e.shiftKey?1/10:1;
		var delta = e.deltaY || e.wheelDelta; // IE11 special
		zoom(e.clientX, e.clientY, delta>0?1+ZOOM*modifier:1/(1+ZOOM*modifier));
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
