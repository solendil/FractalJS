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
this.params = params;
this.events = FractalJS.Events();

//-------- constructor

// check parameters
if (!params.canvas || !params.canvas.width)
	throw "Canvas is not set";
if (!params.fractalDesc)
	throw "Fractal Description is not set";

// define default values
params.renderer = util.defaultProps(params.renderer, {
	numberOfTiles: 1,
	drawAfterInit: true
});
params.controller = util.defaultProps(params.controller, {
	mouseControl: true,
	fitToWindow: false
});

// instanciate controller, read and set URL
controller = new FractalJS.Controller(this);
var urlParams = controller.readUrl();
if (urlParams) {
	params.fractalDesc = urlParams[0]
	params.colorDesc = urlParams[1]
}

// define default palette if not set
if (!params.colorDesc) {
	params.colorDesc = {typeid:0, resolution:1000, buffer:FractalJS.Colormapbuilder().fromId(1000, 0)};
}

// instanciate renderer and set startup params
renderer = new FractalJS.Renderer(this);
renderer.setColorDesc(params.colorDesc);
renderer.setFractalDesc(params.fractalDesc);

// draw if required
if (params.renderer.drawAfterInit)
	renderer.draw();

//-------- public API

this.setFractalDesc = function (desc, nofire) {
	renderer.setFractalDesc(desc);
	if (!nofire)
		this.events.send("api.change");
};

this.getFractalDesc= function () {
	return renderer.getFractalDesc();
};

this.draw= function(vector) {
	renderer.draw(vector);
};

this.resize= function() {
	renderer.resize();
};

this.refreshColormap= function() {
	renderer.drawColors();
};

this.setColorDesc= function(cmap) {
	var res = renderer.setColorDesc(cmap);
	this.events.send("api.change");
	return res;
};

this.getColorDesc= function() {
	return renderer.getColorDesc();
};

};
