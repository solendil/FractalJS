/*
 * The color map builder generates colormaps from a variety of means including:
 * - stops
 */
FractalJS.Colormapbuilder = function(params) {
"use strict";
 
var standardGradients = {
	0:"0#080560;0.2#2969CB;0.40#F1FEFE;0.60#FCA425;0.85#000000",
	1:"0.0775#78591e;0.55#d6e341", // gold
	2:"0#0000FF;0.33#FFFFFF;0.66#FF0000", // bleublancrouge
	3:"0.08#09353e;0.44#1fc3e6;0.77#08173e", // night			
	4:"0#000085;0.25#fffff5;0.5#ffb500;0.75#9c0000", // defaultProps 	
	5:"0#000000;0.25#000000;0.5#7f7f7f;0.75#ffffff;0.975#ffffff", // emboss		

	// flatUI palettes (http://designmodo.github.io/Flat-UI/)
	10:"0#000000;0.25#16A085;0.5#FFFFFF;0.75#16A085", // green sea	
	11:"0#000000;0.25#27AE60;0.5#FFFFFF;0.75#27AE60", // nephritis
	12:"0#000000;0.25#2980B9;0.5#FFFFFF;0.75#2980B9", // nephritis
	13:"0#000000;0.25#8E44AD;0.5#FFFFFF;0.75#8E44AD", // wisteria	
	14:"0#000000;0.25#2C3E50;0.5#FFFFFF;0.75#2C3E50", // midnight blue	
	15:"0#000000;0.25#F39C12;0.5#FFFFFF;0.75#F39C12", // orange
	16:"0#000000;0.25#D35400;0.5#FFFFFF;0.75#D35400", // pumpkin	
	17:"0#000000;0.25#C0392B;0.5#FFFFFF;0.75#C0392B", // pmoegranate
	18:"0#000000;0.25#BDC3C7;0.5#FFFFFF;0.75#BDC3C7", // silver
	19:"0#000000;0.25#7F8C8D;0.5#FFFFFF;0.75#7F8C8D", // asbestos

};

var fromstops = function(resolution, stops) {


var buffer = new Int32Array(resolution);
var indices=[], reds=[], greens=[], blues=[];

var buildStops = function(params) {
	var stops = params.split(";");
	for (var i in stops) {
		var stop = stops[i];
		var items = stop.split("#");
		indices.push(Number(items[0]));
		reds.push(parseInt(items[1].substring(0,2),16));
		greens.push(parseInt(items[1].substring(2,4),16));
		blues.push(parseInt(items[1].substring(4,6),16));
	}
	//console.log(indices, reds, greens, blues)
};

var buildBuffer = function() {
	// loop first stop to end
	indices.push(indices[0]+1);
	reds.push(reds[0]);
	greens.push(greens[0]);
	blues.push(blues[0]);
	//console.log(indices, reds, greens, blues)

	var interR = FractalJS.util.createInterpolant(indices, reds);
	var interG = FractalJS.util.createInterpolant(indices, greens);
	var interB = FractalJS.util.createInterpolant(indices, blues);

	var byteBuffer = new Uint8Array(buffer.buffer); // create an 8-bit view on the buffer
	var bufferIndex = 0;
	for (var i=0; i<resolution; i++) {
		var index = i/resolution;
		if (index<indices[0]) index+=1;
		byteBuffer[bufferIndex++] = interR(index);
		byteBuffer[bufferIndex++] = interG(index);
		byteBuffer[bufferIndex++] = interB(index);
		byteBuffer[bufferIndex++] = 255 ;
	}
};

buildStops(stops);
buildBuffer();

return buffer;
};

//-------- public methods

return {

getStandardGradients: function() {return standardGradients;},

fromId: function(resolution, id) {
	return fromstops(resolution, standardGradients[id]);
},

// with cubic interpolation
fromstops: function(resolution, stops) {
	return fromstops(resolution, stops);
},

};

};


