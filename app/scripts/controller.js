/*
 * The controller:
 * - capture events related to the canvas and modify the view accordingly
 * - loads the URL parameters and updates the URL in relatime
 */
FractalJS.Controller = function(renderer, canvas, params, events) {
"use strict";

//-------- private members

var zoomFactor = 1.3;

var isDragging;			// is the user dragging ?
var dragX, dragY;		// start dragging point
var dragStartDesc;		// start fractal description
var ldragX, ldragY;		// last dragging point

var initFromUrl = false;

//-------- private methods

/*
 * If first letter of URL hash is an 'A'
 * Decode rest of hash using base64, build three arrays on the buffer:
 *   Uint8Array, Uint16Array, Float64Array
 * --bytes ------ array -------------	usage --------------------
 *   0,1          Uint16Array[0]		version of hash
 *   2,3          Uint16Array[1]		number of iterations
 *   4            Uint8Array[4]	        type of fractal
 *   5            Uint8Array[5]	        type of gradient
 *   6,7          Uint16Array[3]		color offset (times 10000)
 *   8-15         Float64Array[1]		x 
 *   16-23        Float64Array[2]		y
 *   24-31        Float64Array[3]		w (extent) 
 *   32-35        Float32Array[8]		color density (if present, 20 if not)
 *   36-39        reserved
 */
var updateUrl = function() {
	var desc = renderer.getFractalDesc();
	var color = renderer.getColorDesc();
	//console.log(color)

	// create a buffer and two views on it to store fractal parameters
	var buffer = new ArrayBuffer(40);
	var byteArray = new Uint8Array(buffer);
	var intArray = new Uint16Array(buffer);
	var doubleArray = new Float64Array(buffer);
	var floatArray = new Float32Array(buffer);
	intArray[0] = 1; // version number
	intArray[1] = desc.iter;
	byteArray[4] = desc.typeid;
	byteArray[5] = color.typeid;
	intArray[3] = color.offset*10000;
	doubleArray[1] = desc.x;
	doubleArray[2] = desc.y;
	doubleArray[3] = desc.w;
	floatArray[8] = color.density;

	// encode as base64 and put in the URL
	// https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string/11562550#11562550
	var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
	base64String = base64String.split("/").join("*");
	base64String = base64String.split("=").join("_");

	history.replaceState("", "", "#A"+base64String);
	//document.location.hash="A"+base64String;
	//console.log("Updating URL", {x:desc.x,y:desc.y,w:desc.w,iter:desc.iter});
};

var readUrl = function() {
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

			var desc = {
				x:doubleArray[1],
				y:doubleArray[2],
				w:doubleArray[3],
				iter:intArray[1],
				typeid:byteArray[4],
			};

			var color = {
				offset:intArray[3]/10000.0,
				density:byteArray.length>32?floatArray[8]:20,
				typeid:byteArray[5],
				resolution:1000,
				buffer:FractalJS.Colormapbuilder().fromId(1000, byteArray[5]),
			};

			//console.log("Initialization", desc, color);
			renderer.setFractalDesc(desc);
			renderer.setColorDesc(color);
			initFromUrl=true;
		}
	} catch(e) {
		console.error("Could not read URL");
		console.error(e);
	}
};

//-------- event catchers

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
		dragStartDesc = renderer.getFractalDesc();
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
			var c = {x:dragStartDesc.x-vecpx, y:dragStartDesc.y-vecpy};
			renderer.setFractalDesc(c);

	        var vfx = e.screenX - ldragX;
	        var vfy = e.screenY - ldragY;  
	        var vector = {x:vfx,y:vfy,mvt:"pan"};     
			renderer.draw(vector);
			events.send("mouse.control");
	        ldragX = e.screenX;
	        ldragY = e.screenY;
		}
	});

	var wheelFunction = function(e) {
		if (!e) e = window.event;
		e.preventDefault();
	    var delta = e.deltaY || e.wheelDelta; // IE11 special
		var mousex = e.clientX;
		var mousey = e.clientY;

	    var startDesc = renderer.getFractalDesc();
	    var c = renderer.getFractalDesc();

	    // test if we're at the maximum possible resolution (1.11e-15/pixel)
		var sminExtent = Math.min(c.swidth, c.sheight);
		var limit = sminExtent*1.11e-15; 
		if (c.w<=limit && delta > 0) {
			events.send("zoom.limit.reached");
			return;
		}

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
		events.send("mouse.control");
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
	renderer.resize();
	window.onresize = function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		renderer.resize();
		renderer.draw();
	};
}

//-------- constructor & jquery callbacks

readUrl();
events.on("iter.change", updateUrl);
events.on("mouse.control", updateUrl);
events.on("api.change", updateUrl);

return {
	initFromUrl:initFromUrl,
};

};
