define(["util"], function(util) {
"use strict";

/*
 * The palette:
 * - is a looping gradient in the range [0,1[
 * - the gradient is mapped to fractal iterations using a resolution and an offset
 * - there must be at least one stop, a stop is an index and an RGB color
 */
return function(params) {

//-------- private members

var stops;
var resolution = params.resolution;
var buffer = new Int32Array(resolution);

var offset = params.offset;
var modulo = params.modulo;
var factor;			// factor for projection iteration -> color space

var callbacks = {		// external callbacks
	"palette.change":[],
};

//-------- private methds

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
		var stop = copyStop(stops[i], offset);
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

var project = function() {
	factor = resolution/modulo;
	//console.log(factor, resolution, modulo)
};

//-------- constructor

buildStops(params.stops);
buildBuffer();
project();

//-------- public methods

return {

getColorForIter: function(iter) {
	if (iter===0)
		// TODO paletize this color
		return 0xFF000000;
	//var res = buffer[iter%resolution];
	//console.log(iter, factor, resolution, )
	var res = buffer[Math.trunc(iter*factor%resolution)];
	return res;
},

// what a mess...
getState: function() {
	return {buffer:buffer, stops:stops, offset:offset, modulo:modulo};
},

setShortDesc: function(state) {
	if (state.offset)
		offset = state.offset;
	if (state.modulo)
		modulo = state.modulo;
	buildStops(state.stops);
	buildBuffer();
	project();
},

getShortDesc: function() {
	var short="";
	for (var i in stops) {
		var stop = stops[i];
		short += stop.index;
		short += util.getHashColor(stop.r, stop.g, stop.b);
		short += ";";
	}
	return {modulo:modulo, offset:offset, stops:short.slice(0,-1)};
},

setState: function(state) {
	if (state.offset)
		offset = state.offset;
	if (state.modulo)
		modulo = state.modulo;
	util.callbackHelp(callbacks["palette.change"]);
	project();
},

build: function(state) {
	buildBuffer();
},

on: function(event, callback) {
	callbacks[event].push(callback);
}


};

};
});

