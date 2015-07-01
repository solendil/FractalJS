FractalJS.create = function(params) {
	"use strict";

//-------- check browser version

if (!document.addEventListener) {
	console.error("This browser cannot run FractalJS");
}

//-------- private members

var renderer, controller;
var util = FractalJS.util;

//-------- constructor

if (!params.canvas || !params.canvas.width)
	throw "Canvas is not set";
if (!params.fractalDesc) 
	throw "Fractal Description is not set";

if (!params.palette) 
	params.palette = {
		stops : [
			{index:0,r:0,g:0,b:0},
			{index:0.5,r:255,g:255,b:255},
		],
    };

params.palette = util.defaultProps(params.palette, {
	stops: [],
	resolution: 1000,
	offset: 0,
	modulo: 50,
});

params.renderer = util.defaultProps(params.renderer, {
	numberOfTiles: 1,
	drawAfterInit: true
});

params.controller = util.defaultProps(params.controller, {
	mouseControl: true,
	fitToWindow: false
});

renderer = new FractalJS.Renderer(params);

controller = new FractalJS.Controller(renderer, params.canvas, params.controller);

if (params.renderer.drawAfterInit)
	renderer.draw();

//-------- private methods


//-------- public methods

return {

setFractalDesc: function (desc) {
	var res = renderer.setFractalDesc(desc);
	return res;
},

getFractalDesc: function () {
	return renderer.getFractalDesc();
},

getPalette: function () {
	return renderer.getPalette();
},

draw: function() {
	renderer.draw();
},

drawPalette: function() {
	renderer.drawPalette();
},

on: function(event, callback) {
	if (event=="frame.end" || event=="frame.start" || event=="iter.change" )
		renderer.on(event, callback);
	else if (event=="mouse.control" )
		controller.on(event, callback);
	else if (event=="palette.change" )
		renderer.getPalette().on(event, callback);
	else
		throw "Unknown event " + event;
}

};	
};

