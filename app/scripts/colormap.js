define(["util"], function(util) {
"use strict";

/*
 * The colormap:
 * - is an array of colors of a specific size (resolution), plus a ratio and an offset
 * - allows a double value to be quickly mapped to a color
 * - has a specific "zero" color
 */
return function(params) {

//-------- private members

var buffer = params.buffer;
var zerocolor = params.zerocolor;
var offset = params.offset;
var modulo = params.modulo;
var factor = resolution/modulo;

//-------- public methods

return {

getColorForIter: function(iter) {
	if (iter===0)
		return zerocolor;
	var res = buffer[Math.trunc(iter*factor%resolution)];
	return res;
},

};

};
});

