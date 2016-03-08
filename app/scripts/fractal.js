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
		keyboardControl : true,		// allow keyboard navigation in canvas
		fitToWindow : false,		// fit the canvas to the window
	}
}

 */
FractalJS.create = function(params) {
"use strict";

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

var model = new FractalJS.Model(params);

// define default values
params.renderer = util.defaultProps(params.renderer, {
	numberOfTiles: 1,
	drawAfterInit: true
});
params.controller = util.defaultProps(params.controller, {
	mouseControl: true,
	keyboardControl: true,
	touchControl: true,
	fitToWindow: false
});

// instanciate controller, read and set URL
controller = new FractalJS.Controller(this, model);
var urlParams = controller.url.read();
if (urlParams) {
	params.fractalDesc = urlParams[0];
	params.colorDesc = urlParams[1];
}

model.setFractalDesc(params.fractalDesc);

// define default palette if not set
if (!params.colorDesc) {
	params.colorDesc = {typeId:0, resolution:1000, buffer:FractalJS.Colormapbuilder().fromId(1000, 0)};
}

// instanciate renderer and set startup params
renderer = new FractalJS.Renderer(this, model);
renderer.setColorDesc(params.colorDesc);

// draw if required
if (params.renderer.drawAfterInit)
	renderer.draw("init");

//-------- public API

this.setFractalDesc = function (desc) {
	if ("x" in desc)
		model.camera.setXYW(desc.x, desc.y, desc.w);
	if ("iter" in desc)
		model.iter = desc.iter;
	if ("typeId" in desc)
		model.typeId = desc.typeId;
	if ("smooth" in desc)
		model.smooth = desc.smooth;
};

this.resetViewport = function (desc) {
	model.camera.resetViewport();
};

this.getModel = function () {
	return model;
};

this.draw= function(reason,vector) {
	renderer.draw(reason,vector);
};

this.resize= function(width, height) {
	model.resizeCanvas(width, height);
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
