 FractalJS.Renderer = function(canvas, params, events) {
"use strict";

//-------- private members

var util 		= FractalJS.util;
var that		= this;

// the canvas on which to display, its context, backbuffer and view as int32
var context  	= canvas.getContext("2d");	
var imageData;
var idata32; 

// colormap is defined later
var colormap 	= null;

// internal state for tiling
var tiles=[];

var drawList = [];		// list of remaining items to be drawn 
var nextCallback;		// id of the next callback for the draw list

var public_methods;
var startFrameMs;


var frameId = 0;
var nbOfThreads = 4;
var workers = [];

//-------- constructor

if ("hardwareConcurrency" in navigator) {
	nbOfThreads = navigator.hardwareConcurrency;
	console.log("FractalJS will use all " + nbOfThreads + " cores");
} else {
	console.log("FractalJS will use the default " + nbOfThreads + " threads");
}
for (var i=0; i<nbOfThreads; i++)
	workers.push(FractalJS.EngineWorker());

//-------- public methods

this.resize = function() {
	// send message to workers
	this.setFractalDesc({
			swidth: canvas.width, 
			sheight: canvas.height
		});
	for (var w in workers) 
		workers[w].postMessage({action:"setDesc",desc:{
			swidth: canvas.width, 
			sheight: canvas.height
		}})	;
	// resize temp buffers
	imageData = context.createImageData(canvas.width, canvas.height);
	idata32 = new Uint32Array(imageData.data.buffer);
	// reset tiles
	var tilesNb = Math.sqrt(params.numberOfTiles);
	var tilewidth = canvas.width/tilesNb;
	var tileheight = canvas.height/tilesNb;
	var id = 0;
	tiles.length=0;
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
			tile.x = (tile.x1+tile.x2)/2; // center of tile
			tile.y = (tile.y1+tile.y2)/2;
			tile.width = tile.x2-tile.x1;
			tile.height = tile.y2-tile.y1;
			tile.frame = new Float32Array(tile.width*tile.height);
			tile.indexScreen = tile.y1*canvas.width+tile.x1;
			tiles.push(tile);
		}
	}	
};

// fractal description/projection is temporarily implemented in renderer  
var fractalDesc = {};
var project = function() {
	var sminExtent = Math.min(fractalDesc.swidth, fractalDesc.sheight);
	// precision limit is ten times the nb of pixels times double precision
	var limit = sminExtent*1.11e-15; 
	if (fractalDesc.w<limit)
		fractalDesc.w = limit; 
	fractalDesc.pixelOnP = fractalDesc.w/sminExtent;
	fractalDesc.pxmin = fractalDesc.x - fractalDesc.swidth/2 * fractalDesc.pixelOnP;
	fractalDesc.pymin = fractalDesc.y - fractalDesc.sheight/2 * fractalDesc.pixelOnP;
};

this.setFractalDesc = function (desc) {
	//console.log("setDesc",desc)
	if ('x' in desc)
		fractalDesc.x = desc.x;
	if ('y' in desc)
		fractalDesc.y = desc.y;
	if (desc.w)
		fractalDesc.w = desc.w;
	if (desc.i)
		fractalDesc.iter = Math.round(desc.i);
	if (desc.iter)
		fractalDesc.iter = Math.round(desc.iter);
	if ('typeid' in desc) 
		fractalDesc.typeid = desc.typeid;
	if (desc.swidth) {
		fractalDesc.swidth = desc.swidth;
		fractalDesc.sheight = desc.sheight;
	}
	project();
	for (var w in workers) 
		workers[w].postMessage({action:"setDesc",desc:desc});
	//console.log("returning",fractalDesc)
	return this.getFractalDesc();
};

this.getFractalDesc = function () {
	var res = {
		x:fractalDesc.x, y:fractalDesc.y, w:fractalDesc.w, iter:fractalDesc.iter,
		pixelOnP:fractalDesc.pixelOnP, 
		swidth:fractalDesc.swidth, sheight:fractalDesc.sheight,
		pxmin:fractalDesc.pxmin, pymin:fractalDesc.pymin,
		type:fractalDesc.type,typeid:fractalDesc.typeid
	};
	return res;
};

this.setColorDesc = function(desc) {
	if (!colormap) {
		colormap = FractalJS.Colormap(desc);
	} else
		return colormap.setDesc(desc);
};

this.getColorDesc = function() {
	return colormap.getDesc();
};

this.drawColors = function() {
	refreshColormap();
};

this.draw = function(vector) {
	// if a frame is being drawn, cancel next callback, empty draw list
	if (drawList.length!==0) {
		clearTimeout(nextCallback);
		drawList.length = 0;
	}

	startFrameMs = performance.now();
	frameId++;
	events.send("frame.start", function() {
		return {fractalDesc:fractalDesc};
	});

	// if a movement vector is provided, zoom/pan the current canvas accordingly to provide a quick first picture
	if (vector) {
		var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		// TODO : cache to improve speed
		// http://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
		var div = document.createElement('div');
		div.innerHTML = "<canvas width='"+imageData.width+"' "+
			"height='"+imageData.height+"'> </canvas>";
		var newCanvas = div.firstChild;

		newCanvas.getContext("2d").putImageData(imageData, 0, 0);
		context.scale(vector.z, vector.z);
		context.translate(vector.x, vector.y);
		context.drawImage(newCanvas,0,0);	
		context.setTransform(1, 0, 0, 1, 0, 0);
	}

	// push tiles in drawList
	var tile;
	for (var i in tiles) {
		tile = tiles[i];
		if (vector && (vector.mvt=="zoomin" || vector.mvt=="zoomout")) {
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

	// dispatch first items of the drawList to all workers
	for (var w in workers) {
		tile = drawList.shift();
		workers[w].postMessage({action:"draw", frameId:frameId, tile:tile});
	}
};

//-------- private methods

var endOfFrame = function() {
	var endFrameMs = performance.now();
	events.send("frame.end", function() {
		return {
			fractalDesc : fractalDesc,
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
	//var buffer = engine.getBuffer();
	var minIter = 1e12, maxIter = -1;
	var nb = 0, nbInSet = 0;
	var tile;
	for (var ti in tiles) {
		tile = tiles[ti];
		for (i=0; i<tile.frame.length; i++) {
			nb++;
			iter = tile.frame[i];
			if (iter===0) {
				nbInSet++;
				continue;
			}
			if (iter>maxIter) maxIter=iter;
			if (iter<minIter) minIter=iter;
		}
	}
	var iterRange = maxIter-minIter;
	var fringe10p = fractalDesc.iter - Math.ceil(iterRange/10);
	var nbFringe10p = 0;
	for (ti in tiles) {
		tile = tiles[ti];
		for (i=0; i<tile.frame.length; i++) {
			iter = tile.frame[i];
			if (iter===0) 
				continue;
			if (iter>=fringe10p) 
				nbFringe10p++;
		}	
	}
	var percInSet = 100.0*nbInSet/nb;
 	var percFringe10p = 100.0*nbFringe10p/nbInSet;
	if (percInSet > 1 && percFringe10p>1) {
		that.setFractalDesc({iter:fractalDesc.iter*1.5});
		that.draw();
		events.send("iter.change");
	}
	if (percInSet > 1 && percFringe10p<0.2) {
		that.setFractalDesc({iter:fractalDesc.iter/1.5});
		// public_methods.draw();
		events.send("iter.change");
	}
};

var refreshColormap = function() {
	var start = performance.now();
	// Performing the colormap refresh in place instead of calling the colormap
	// object brings a 5x performance in Chrome (25ms instead of 150).
	var cmap = colormap.getDesc();
	var buffer=cmap.buffer, offset=cmap.offset*buffer.length, 
		density=cmap.density, resolution=buffer.length;
	for (var ti in tiles) {
		var tile = tiles[ti];
		var indexscreen = tile.indexScreen;
		var index = 0;
		for (var y=0; y<tile.height; y++) {
			for (var x=0; x<tile.width; x++) {
				var iter = tile.frame[index++];
				if (iter===0)
					idata32[indexscreen] = 0xFF000000;
				else
					idata32[indexscreen] = buffer[~~((iter*density+offset)%resolution)];
				indexscreen++;
			}
			indexscreen += canvas.width-tile.width;
		}
	}
	context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
	var end = performance.now();
	//console.log("colormap refreshed in ", (end-start))
};

var workerMessage = function(param) {
	if (param.data.action === "endFrame") {
		if (param.data.frameId != frameId) 
			return; // frame has changed, drop this result

		// replace original tile by the one coming from worker
		var incid = param.data.tile.id;
		var tile = param.data.tile;
		tiles[incid] = tile;

		// paint on canvas
		var tileIndex = 0;
		var bufferIndex = 0;
		for (var ty=0; ty<tile.height; ty++) {
			bufferIndex = (ty+tile.y1)*canvas.width+tile.x1;
			for (var tx=0; tx<tile.width; tx++) {
				var iter = tile.frame[tileIndex++];
				var color = colormap.getColorForIter(iter);
				idata32[bufferIndex++] = color;
			}
		}
		
		context.putImageData(imageData, 0, 0, tile.x1, tile.y1, 
			tile.x2-tile.x1, tile.y2-tile.y1);

		// set this worker to another task
		if (drawList.length>0) {
			tile = drawList.shift();
			var message = {
				action:"draw", 
				frameId:frameId, 
				tile:tile
			};
			if (drawList.length===0) {
				message.finished=true;
			}
			// why is it called "target" when it's the source ?
			param.target.postMessage(message);
		}

		// this mechanism looks fragile...
		if (param.data.finished)
			endOfFrame();
	}
};

for (var w in workers) 
	workers[w].onmessage = workerMessage;


};
