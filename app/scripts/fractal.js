/*
 * The main fractal module:
 * - receives one single object describing a fractal to display/manipulate
 * - provides additional methods and callbacks
 * - configuration object:

{
    canvas : <DOM canvas node>		// mandatory canvas
    fractalDesc	: <JSON object>		// mandatory fractal description (see engine.js)
    palette : {						// the default palette object
		stops : [
			{index:0,r:0,g:0,b:0},
			{index:0.5,r:255,g:255,b:255},
		],
		resolution : 100,
		offset : 0,
		modulo : 0
    }
    renderer : {
		numberOfTiles : 1,			// number of tiles to draw (approximate)
		drawAfterInit : true,		// should the fractal be drawn after init
    },
	controller : {
		mouseControl : true,		// allow mouse navigation in canvas
		fitToWindow : false,		// fit the canvas to the window
	}    
}

 */
FractalJS.create = function(params) {
"use strict";

//-------- private members

var renderer, controller;
var util = FractalJS.util;
var events = FractalJS.Events();

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

renderer = new FractalJS.Renderer(params, events);

controller = new FractalJS.Controller(renderer, params.canvas, params.controller, events);

if (params.renderer.drawAfterInit)
	renderer.draw();

//-------- private methods


//-------- public methods

return {

setFractalDesc: function (desc) {
	var res = renderer.setFractalDesc(desc);
	events.send("api.change");
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

events: events,

};	
};

