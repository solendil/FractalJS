/*
 * The Model of the fractal engine, ie the central place where data is
 * stored and shared between components.
 */
FractalJS.Model = function(canvas){
"use strict";

	this.canvas = canvas;
	this.camera = new FractalJS.Camera();
	this.camera.setSize(canvas.width, canvas.height);

	this.resize = function() {
		this.camera.setSize(this.canvas.width, this.canvas.height);
	};

	this.getWorkerModel = function() {
		var res = this.camera.getWorkerModel();
		res.smooth = this.smooth;
		res.typeId = this.typeId;
		res.iter   = this.iter;
		return res;
	};

	this.setFractalDesc = function (desc) {
		if ("x" in desc)
			this.camera.setXYW(desc.x, desc.y, desc.w);
		if ("iter" in desc)
			this.iter = desc.iter;
		if ("typeId" in desc)
			this.typeId = desc.typeId;
		if ("smooth" in desc)
			this.smooth = desc.smooth;
		if ("angle" in desc || "scaleX" in desc )
			this.camera.setViewport(desc.angle, desc.scaleX);
		if ("viewport" in desc && desc.viewport !== undefined) {
			this.camera.viewportMatrix = desc.viewport;
			this.camera.project();
		}
	};

};
