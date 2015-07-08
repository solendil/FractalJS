/*
 * The main fractal module:
 * - receives one single object describing a fractal to display/manipulate
 * - provides additional methods and callbacks
 * - configuration object:

{
    canvas : <DOM canvas node>		// mandatory canvas
    fractalDesc	: <JSON object>		// mandatory fractal description (see engine.js)
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

if (!params.colormap) 
	params.colormap = FractalJS.Colormap({
      	typeid:0,
      	resolution:1000,
		buffer:FractalJS.Colormapbuilder().fromId(1000, 0)
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

draw: function() {
	renderer.draw();
},

refreshColormap: function() {
	renderer.refreshColormap();
},

setColorDesc: function(cmap) {
	var res = renderer.setColorDesc(cmap);
	events.send("api.change");
	return res;
},

getColorDesc: function() {
	return renderer.getColorDesc();
},

events: events,

};	
};

