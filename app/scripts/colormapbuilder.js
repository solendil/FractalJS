/*
 * The color map builder generates colormaps from a variety of means including:
 * - stops
 */
FractalJS.Colormapbuilder = function(params) {
"use strict";
 
//-------- public methods

return {

fromstops: function(params) {

var stops;
var resolution = params.resolution;
var buffer = new Int32Array(resolution);

var buildStops = function(params) {
	if (params.constructor === Array) {
		stops = params;
		return;
	}
	stops = [];
	var tstops = params.split(";");
	for (var i in tstops) {
		var tstop = tstops[i];
		var items = tstop.split("#");
		var index = Number(items[0]);
		var red = parseInt(items[1].substring(0,2),16);
		var green = parseInt(items[1].substring(2,4),16);
		var blue = parseInt(items[1].substring(4,6),16);
		stops.push({
			index:index,r:red,g:green,b:blue
		});
	}

};

var copyStop = function(stop, offset) {
	return {
		index:stop.index+(offset?offset:0), 
		r:stop.r,
		g:stop.g,
		b:stop.b
	};
};

var buildBuffer = function() {
	var i;
	var byteBuffer = new Uint8Array(buffer.buffer); // create an 8-bit view on the buffer
	
	//console.log(offset)
	var gstops = [];
	for (i in stops) {
		var stop = copyStop(stops[i], 0);
		stop.index = stop.index%1;
		gstops.push(stop);
	}
	gstops.sort(function(a,b){return a.index-b.index;});
	gstops.push(copyStop(gstops[0], +1));
	gstops.splice(0, 0, copyStop(gstops[gstops.length-2], -1));
	//console.log(gstops);
	var fstops=gstops;

	var stopAindex = 0;
	var stopBindex = 1;
	var stopA = fstops[stopAindex];
	var stopB = fstops[stopBindex];
	var stopRange = stopB.index-stopA.index;
	//console.log("stops", stopAindex, stopBindex);
	//console.log("stoprange", stopRange);
	
	var bufferIndex = 0;
	for (i=0; i<resolution; i++) {
		var x01 = i/resolution;
		//console.log("-----------", i, x01);
		if (x01>=stopB.index) { 
			//console.log("swap")
			stopAindex++;
			stopBindex++;
			stopA = fstops[stopAindex];
			stopB = fstops[stopBindex];
			stopRange = stopB.index-stopA.index;
			//console.log("stopindeices", stopAindex, stopBindex);
			//console.log("stoprange", stopRange);
		}
		
		var stopdelta = (x01-stopA.index) / stopRange;
		//console.log("delta", stopdelta);

		var r = stopA.r + (stopB.r - stopA.r)*stopdelta;
		var g = stopA.g + (stopB.g - stopA.g)*stopdelta;
		var b = stopA.b + (stopB.b - stopA.b)*stopdelta;
		//var rgb = util.hsv_to_rgb(h, s, v);
		//console.log("rgb",r,g,b);
		byteBuffer[bufferIndex++] = r;
		byteBuffer[bufferIndex++] = g;
		byteBuffer[bufferIndex++] = b;
		byteBuffer[bufferIndex++] = 255 ;
	}
};

buildStops(params.stops);
buildBuffer();

return FractalJS.Colormap({buffer:buffer});

}

};

};


