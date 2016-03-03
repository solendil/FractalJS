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

//-------- private methods

/*
 * If first letter of URL hash is an 'A'
 * Decode rest of hash using base64, build three arrays on the buffer:
 *   Uint8Array, Uint16Array, Float64Array
 * --bytes ------ array -------------	usage --------------------
 *   0,1          Uint16Array[0]		version of hash
 *   2,3          Uint16Array[1]		number of iterations
 *   4            Uint8Array[4]	    type of fractal
 *   5            Uint8Array[5]	    type of gradient
 *   6,7          Uint16Array[3]		color offset (times 10000)
 *   8-15         Float64Array[1]		x
 *   16-23        Float64Array[2]		y
 *   24-31        Float64Array[3]		w (extent)
 *   32-35        Float32Array[8]		color density (if present, 20 if not)
 *   36           Uint8Array[36]    flags (if present, 0 if not)
 *                                  0x00000001 : smooth shading
 *   37-39        reserved
 */
var updateUrl = function() {
	var color = fractal.getColorDesc();
	// create a buffer and two views on it to store fractal parameters
	var buffer = new ArrayBuffer(40);
	var byteArray = new Uint8Array(buffer);
	var intArray = new Uint16Array(buffer);
	var doubleArray = new Float64Array(buffer);
	var floatArray = new Float32Array(buffer);
	intArray[0] = 1; // version number
	intArray[1] = model.iter;
	byteArray[4] = model.typeId;
	byteArray[5] = color.typeId;
	intArray[3] = color.offset*10000;
	doubleArray[1] = model.camera.x;
	doubleArray[2] = -model.camera.y;
	doubleArray[3] = model.camera.w;
	floatArray[8] = color.density;
	var flags = model.smooth?1:0;
	byteArray[36] = flags;
	// encode as base64 and put in the URL
	// https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string/11562550#11562550
	var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
	base64String = base64String.split("/").join("*");
	base64String = base64String.split("=").join("_");
	history.replaceState("", "", "#A"+base64String);
	//document.location.hash="A"+base64String;
	//console.log("Updating URL", {x:desc.x,y:desc.y,w:desc.w,iter:desc.iter});
};

//-------- event catchers

var rotate = function(angle) {
	model.camera.angle += angle;
	model.camera.project();
	fractal.draw("user.control");
}

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
		z:1/zoom, mvt:delta<0?"zoomin":"zoomout", sx:x,sy:y}
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

//-------- public methods

this.readUrl = function() {
	try {
		var url = document.location.hash;
		if (url.startsWith("#A")) {
			var base64String = url.substr(2);
			base64String = base64String.split("*").join("/");
			base64String = base64String.split("_").join("=");

			var buffer = FractalJS.util.base64ToArrayBuffer(base64String);
			var byteArray = new Uint8Array(buffer);
			var intArray = new Uint16Array(buffer);
			var doubleArray = new Float64Array(buffer);
			var floatArray = new Float32Array(buffer);

			var flags = byteArray[36];
			var desc = {
				x:doubleArray[1],
				y:-doubleArray[2],
				w:doubleArray[3],
				iter:intArray[1],
				typeId:byteArray[4],
				smooth:flags&0x1==1
			};

			var color = {
				offset:intArray[3]/10000.0,
				density:byteArray.length>32?floatArray[8]:20,
				typeId:byteArray[5],
				resolution:1000,
				buffer:FractalJS.Colormapbuilder().fromId(1000, byteArray[5]),
			};

			return [desc,color];
		}
	} catch(e) {
		console.error("Could not read URL");
		console.error(e);
	}
};

//-------- constructor & jquery callbacks

events.on("iter.change", updateUrl);
events.on("user.control", updateUrl);
events.on("api.change", updateUrl);

};
