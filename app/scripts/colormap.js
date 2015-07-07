/*
 * The color map:
 * - is an array of colors whose size is the "resolution"
 * - a fractal iteration number is mapped onto this array according to 
 *   the "offset" (range [0..1[) and the "density" (range [0.1..10[)
 * - is created from the different palette builders
 */
FractalJS.Colormap = function(params) {
"use strict";

//-------- private members

var buffer = new Int32Array(params.buffer);
var offset = params.offset || 0.0;
var density = params.density || 1;
var resolution = buffer.length;
var factor;

//-------- private methds

var project = function() {
	factor = resolution/density;
};

//-------- constructor

project();

//-------- public methods

return {

getColorForIter: function(iter) {
	if (iter===0)
		return 0xFF000000;
	var res = buffer[Math.trunc((iter*density+offset*resolution)%resolution)];
	return res;
},

buffer: function() {
	return buffer;
},

getDesc: function() {
	return {
		offset:offset,
		density:density
	};
},

setDesc: function(cmap) {
	//console.log("set ", cmap)
	if (cmap.offset)
		offset = cmap.offset;
	if (cmap.density)
		density = cmap.density;
	project();
}

};

};


