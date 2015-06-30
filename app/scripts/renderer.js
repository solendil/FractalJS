define(["engine", "palette", "util"], function(Engine, Palette, util) {
"use strict";

/*
 * The renderer:
 * - knows a fractal engine, a palette and a canvas
 * - can draw a frame, knows the movement vector if applicable
 * - splits renderings into "draw items", can cancel frames
 */
return function(params) {

//-------- private members

var canvas, context;	// the canvas on which to display 
var imageData, idata32; // canvas backbuffer and view as 32bit-int array
var engine;				// the fractal engine
var palette; 			// palette

var drawList = [];		// list of remaining items to be drawn 
var nextCallback;		// id of the next callback for the draw list

var callbacks = {		// external callbacks
	"frame.end":[],
	"frame.start":[],
	"iter.change":[]
};

var public_methods;
var startFrameMs;

//-------- constructor

canvas = params.canvas;
context = canvas.getContext("2d");
imageData = context.createImageData(canvas.width, canvas.height);
idata32 = new Uint32Array(imageData.data.buffer);

params.fractalDesc.swidth = canvas.width;
params.fractalDesc.sheight = canvas.height;

engine = new Engine(params.fractalDesc);
palette = new Palette(params.palette);

//-------- private methods

var callbackNewFrame = function() {
	startFrameMs = performance.now();
	util.callbackHelp(callbacks["frame.start"], function() {
		return {fractalDesc:engine.getFractalDesc()};
	});
};

var callbackEndFrame = function() {
	var endFrameMs = performance.now();
	util.callbackHelp(callbacks["frame.end"], function() {
		return {
			fractalDesc : engine.getFractalDesc(),
			buffer : engine.getBuffer(),
			time: endFrameMs-startFrameMs,
		};
	});
	// frame is finished; analyze buffer to auto-adjust iteration count
	// algorithm:
	// - we compute the percentage of pixels in the set/pixels on the screen
	// - the fringe is the band of pixels whose iteration is in the 10% upper
	// - we compute the percentage of pixels in the fringe/pixels in the set
	// - if set is big enough (>1%) and fringe is big vs set (>1%) increase iterations
	// - if set is big enough (>1%) and fringe is small vs set (<0.2%) decrease iterations
	var i, iter;
	var buffer = engine.getBuffer();
	var fractalDesc = engine.getFractalDesc();
	var minIter = 1e12, maxIter = -1;
	var nb = 0, nbInSet = 0;
	for (i=0; i<buffer.length; i++) {
		nb++;
		iter = buffer[i];
		if (iter===0) {
			nbInSet++;
			continue;
		}
		if (iter>maxIter) maxIter=iter;
		if (iter<minIter) minIter=iter;
	}
	var iterRange = maxIter-minIter;
	var fringe10p = fractalDesc.iter - Math.ceil(iterRange/10);
	var nbFringe10p = 0;
	for (i=0; i<buffer.length; i++) {
		iter = buffer[i];
		if (iter===0) 
			continue;
		if (iter>=fringe10p) 
			nbFringe10p++;
	}	
	var percInSet = 100.0*nbInSet/nb;
 	var percFringe10p = 100.0*nbFringe10p/nbInSet;
	if (percInSet > 1 && percFringe10p>1) {
		engine.setFractalDesc({iter:fractalDesc.iter*1.5});
		public_methods.draw();
		util.callbackHelp(callbacks["iter.change"])
	}
	if (percInSet > 1 && percFringe10p<0.2) {
		engine.setFractalDesc({iter:fractalDesc.iter/1.5});
		// public_methods.draw();
		util.callbackHelp(callbacks["iter.change"])
	}
};

var callbackInterruptFrame = function() {
};

// TODO : insert this in the drawing queue ?
var drawPalette = function() {
	var iterbuffer = engine.getBuffer();
	var limit = canvas.height*canvas.width;
	for (var i=0; i<limit; i++) 
		idata32[i] = palette.getColorForIter(iterbuffer[i]);
	context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
};

var drawItem = function() {
	var tile = drawList.shift();

	var iterbuffer = engine.drawTile(tile);
	for (var sy=tile.y1; sy<tile.y2; sy++) {
		var dx = sy*canvas.width+tile.x1;
		for (var sx=tile.x1; sx<tile.x2; sx++) {
			var iter = iterbuffer[dx];
			var color = palette.getColorForIter(iter);
			idata32[dx++] = color;
		}
	}
	
	context.putImageData(imageData, 
		0, 0, tile.x1, tile.y1, 
		tile.x2-tile.x1, tile.y2-tile.y1);
	
	if (drawList.length>0) {
		nextCallback = setTimeout(drawItem,0);
	} else {
		callbackEndFrame();
	}
};

//-------- public methods

public_methods = {

drawPalette: function() {
	drawPalette();
},

draw: function(vector) {
	// if a frame is being drawn, cancel next callback, empty draw list
	if (drawList.length!==0) {
		clearTimeout(nextCallback);
		drawList.length = 0;
		callbackInterruptFrame();
	}

	callbackNewFrame();

	// if a movement vector is provided, zoom/pan the current canvas accordingly to provide a quick first picture
	if (vector) {
		var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		// TODO : cache to improve speed
		var newCanvas = $("<canvas>")
		    .attr("width", imageData.width)
		    .attr("height", imageData.height)[0];
		newCanvas.getContext("2d").putImageData(imageData, 0, 0);
		context.scale(vector.z, vector.z);
		context.translate(vector.x, vector.y);
		context.drawImage(newCanvas,0,0);	
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	// generate tiles in drawList
	var tilesNb = Math.sqrt(params.renderer.numberOfTiles);
	var tilewidth = canvas.width/tilesNb;
	var tileheight = canvas.height/tilesNb;
	var id = 0;
	for (var i=0; i<tilesNb; i++) {
		for (var j=0; j<tilesNb; j++) {
			var tile = {
				i:i,j:j,id:id++,
				// TODO : Math.round? We must have overlapping pixels
				x1:Math.round(j*canvas.width/tilesNb),
				x2:Math.round((j+1)*canvas.width/tilesNb),
				y1:Math.round(i*canvas.height/tilesNb),
				y2:Math.round((i+1)*canvas.height/tilesNb),
			};
			if (vector && (vector.mvt=="zoomin" || vector.mvt=="zoomout")) {
				tile.x = (tile.x1+tile.x2)/2; // center of tile
				tile.y = (tile.y1+tile.y2)/2;
				tile.dx = vector.sx-tile.x; // distance to zoom point
				tile.dy = vector.sy-tile.y;
				tile.dist = tile.dx*tile.dx + tile.dy*tile.dy;
			}
			if (vector && vector.mvt=="pan") {
				tile.prio = 0;
				if (vector.x>0 && tile.x1<vector.x) {
					tile.prio = 1;
				}
				if (vector.x<0 && tile.x2>canvas.width+vector.x) {
					tile.prio = 1;
				}
				if (vector.y>0 && tile.y1<vector.y) {
					tile.prio = 1;
				}
				if (vector.y<0 && tile.y2>canvas.height+vector.y) {
					tile.prio = 1;
				}
			}
			drawList.push(tile);
		}
	}

	// prioritize tiles according to movement
	if (vector && vector.mvt=="pan") {
		drawList.sort(function(t1,t2){
			return t2.prio - t1.prio;
		});
	}
	if (vector && vector.mvt=="zoomin") {
		drawList.sort(function(t1,t2){
			return t1.dist - t2.dist;
		});
	}
	if (vector && vector.mvt=="zoomout") {
		drawList.sort(function(t1,t2){
			return t2.dist - t1.dist;
		});
	}

	// call first item in drawList
	nextCallback = setTimeout(drawItem,0);	
},

resize: function() {
	engine.setFractalDesc({
		swidth: canvas.width, 
		sheight: canvas.height
	});
	imageData = context.createImageData(canvas.width, canvas.height);
	idata32 = new Uint32Array(imageData.data.buffer);
},

setFractalDesc: function (desc) {
	var res = engine.setFractalDesc(desc);
	return res;
},

getFractalDesc: function () {
	return engine.getFractalDesc();
},

getPalette: function () {
	return palette;
},

on: function(event, callback) {
	callbacks[event].push(callback);
}

};

return public_methods;

};
});