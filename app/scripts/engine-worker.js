/*
 * The fractal engine:
 * - knows complex plane (P) and screen (S) size, coordinates and transforms
 * - handles the computation backbuffer
 * - performs fractal computations in tiles
 */
FractalJS.EngineWorker = function() {
"use strict";
	return new Worker(FractalJS.EngineWorkerBlob);
};

// the web worker is defined as a blob, thank to
// http://stackoverflow.com/questions/5408406/web-workers-without-a-separate-javascript-file
FractalJS.EngineWorkerBlob = (function() {
"use strict";
var blobURL = URL.createObjectURL( new Blob([ '(',
function(){

//-------- start of actual worker code
var engine = (function(desc) {


//-------- private members

var x, y;		// coordinates of the center of S on P
var w;			// minimum extent of P displayed on S (height or width)
var iter;		// maximum number of iterations
var escape = 4;	// square of escape distance
var typeid;		// type of fractal

var swidth, sheight;	// S width & height
var pixelOnP;			// size of one pixel on P
var pxmin, pymin;		// upper-left displayed coordinate of P

var fractalFunction;	// the fractal function used

//-------- private methds

var project = function() {
	var sminExtent = Math.min(swidth, sheight);

	// precision limit is ten times the nb of pixels times double precision
	var limit = sminExtent*1.11e-15;
	if (w<limit)
		w = limit;

	pixelOnP = w/sminExtent;
	pxmin = x - swidth/2 * pixelOnP;
	pymin = y - sheight/2 * pixelOnP;
};

var logBase = 1.0 / Math.log(2.0);
var logHalfBase = Math.log(0.5)*logBase;

// TODO add string identifiers as a complement to int identifiers for fractal
// types.
var fractalFunctionList = {
	'mandelsmooth' : function(cx,cy) {
		var znx=0, zny=0, sqx=0, sqy=0, i=0, j=0;
		for(;i<iter && sqx+sqy<=escape; ++i) {
			zny = (znx+znx)*zny + cy;
			znx = sqx-sqy + cx;
			sqx = znx*znx;
			sqy = zny*zny;
		}
		for(j=0;j<4; ++j) {
			zny = (znx+znx)*zny + cy;
			znx = sqx-sqy + cx;
			sqx = znx*znx;
			sqy = zny*zny;
		}

		var res = 5 + i - logHalfBase - Math.log(Math.log(sqx+sqy))*logBase;
		return res;
		//return i;
	},
	// mandelbrot
	0 : function(cx,cy) {
		var znx=0, zny=0, sqx=0, sqy=0, i=0, j=0;
		for(;i<iter && sqx+sqy<=escape; ++i) {
			zny = (znx+znx)*zny + cy;
			znx = sqx-sqy + cx;
			sqx = znx*znx;
			sqy = zny*zny;
		}
		return i;
	},
	// Julia Set A
	4 : function(cx,cy) {
		var znx=cx, zny=cy, sqx=cx*cx, sqy=cy*cy, i=0, j=0;
		for(;i<iter && sqx+sqy<=escape; ++i) {
			zny = (znx+znx)*zny + 0.15;
			znx = sqx-sqy -0.79;
			sqx = znx*znx;
			sqy = zny*zny;
		}
		return i;
	},
	// Phoenix Set
	5 : function(cx,cy) {
		var x=-cy, y=cx, xm1=0, ym1=0;
		var sx=0, sy=0, i=0;
		var c=0.5667, p=-0.5;
		for(;i<iter && sx+sy<=escape; ++i) {
			xp1 = x*x-y*y+c+p*xm1;
			yp1 = 2*x*y+p*ym1;
			sx = xp1*xp1;
			sy = yp1*yp1;
			xm1=x; ym1=y;
			x=xp1; y=yp1;
		}
		return i;
	},
	// tippetts
	3 : function(cx,cy) {
		var zx=0, zy=0, sqx=0, sqy=0, i=0;
		for(;i<iter && sqx+sqy<=escape; ++i) {
			zx = sqx-sqy+cx;
			zy = (zx+zx)*zy+cy;
			sqx = zx*zx;
			sqy = zy*zy;
		}
		return i;
	},
	// multibrot3
	1 : function(cx,cy) {
		var zx=0, zy=0, sqx=0, sqy=0, i=0, znx, zny;
		while (true) {
			znx = sqx*zx-3*zx*sqy+cx;
			zny = 3*sqx*zy-sqy*zy+cy;
			zx = znx;
			zy = zny;
			if (++i>=iter)
				break;
			sqx = zx*zx;
			sqy = zy*zy;
			if (sqx+sqy>escape)
				break;
		}
		return i;
	},
	// burningship
	2 : function(cx,cy) {
		var zx=0, zy=0, sqx=0, sqy=0, i=0, znx, zny;
		while (true) {
			zny = (zx+zx)*zy+cy;
			znx = sqx-sqy+cx;
			zx = Math.abs(znx);
			zy = Math.abs(zny);
			if (++i>=iter)
				break;
			sqx = zx*zx;
			sqy = zy*zy;
			if (sqx+sqy>escape)
				break;
		}
		return i;
	}
};
fractalFunction = fractalFunctionList[0];

//-------- public methods

var publicMethods = {

setFractalDesc: function(desc) {
	if ('x' in desc)
		x = desc.x;
	if ('y' in desc)
		y = desc.y;
	if (desc.w)
		w = desc.w;
	if (desc.i)
		iter = Math.round(desc.i);
	if (desc.iter)
		iter = Math.round(desc.iter);
	if ('typeid' in desc && desc.typeid!==undefined) {
		typeid = desc.typeid;
		fractalFunction = fractalFunctionList[typeid];
		//console.log(desc, desc.typeid, typeid, fractalFunction)
	}
	if (desc.swidth) {
		swidth = desc.swidth;
		sheight = desc.sheight;
	}
	project();
	var res = this.getFractalDesc();
	//console.log(res);
	return res;
},

getFractalDesc: function() {
	var res = {
		x:x, y:y, w:w, iter:iter,
		testx:x, testy:y,
		pixelOnP:pixelOnP,
		swidth:swidth, sheight:sheight,
		pxmin:pxmin, pymin:pymin,
		typeid:typeid
	};
	return res;
},

drawTileOnBuffer: function(tile) {
	//console.log(fractalFunction)
	var frame = tile.frame;
	var py = pymin+tile.y1*pixelOnP;
	var dx = 0;
	for (var sy=tile.y1; sy<tile.y2; sy++) {
		var px = pxmin+tile.x1*pixelOnP;
		for (var sx=tile.x1; sx<tile.x2; sx++) {
			var piter = fractalFunction(px, py);
			//console.log(px, py, piter)
			if (piter==iter)
				frame[dx++] = 0;
			else
				frame[dx++] = piter;
			px += pixelOnP;
		}
		py += pixelOnP;
	}
},

};

//-------- constructor
publicMethods.setFractalDesc(desc);
return publicMethods;
})({});

onmessage = function(param) {
	if (param.data.action === "setDesc") {
		//console.log(engine.getFractalDesc())
		engine.setFractalDesc(param.data.desc);
		//console.log(engine.getFractalDesc())
	} else if (param.data.action === "draw") {
		var startTime = new Date().getTime();
		engine.drawTileOnBuffer(param.data.tile);
		var endTime = new Date().getTime();
		postMessage({
			action:"endFrame",
			tile:param.data.tile,
			frameId:param.data.frameId,
			finished:param.data.finished
		});
	} else {
		throw "invalid worker message";
	}
};
//-------- end of actual worker code

}.toString(),
')()' ], { type: 'application/javascript' } ) );
return blobURL;
})();
