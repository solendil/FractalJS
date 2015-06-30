define([], function() {
"use strict";

/*
 * The fractal engine:
 * - knows complex plane (P) and screen (S) size, coordinates and transforms
 * - handles the computation backbuffer
 * - performs fractal computations in tiles
 */
return function(desc) {

//-------- private members

var x, y;		// coordinates of the center of S on P
var w;			// minimum extent of P displayed on S (height or width)
var iter;		// maximum number of iterations
var escape = 4;	// square of escape distance
var type;		// type of fractal

var swidth, sheight;	// S width & height
var pixelOnP;			// size of one pixel on P
var pxmin, pymin;		// upper-left displayed coordinate of P

var frame;				// the computation backbuffer 
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
	'mandel' : function(cx,cy) {
		var znx=0, zny=0, sqx=0, sqy=0, i=0, j=0;
		for(;i<iter && sqx+sqy<=escape; ++i) {
			zny = (znx+znx)*zny + cy;
			znx = sqx-sqy + cx;
			sqx = znx*znx;
			sqy = zny*zny;
		}
		return i;	
	},
	'mandel3' : function(cx,cy) {
		var zx=0, zy=0, i=0, znx, zny;
		while (true) {
			znx = zx*zx*zx-3*zx*zy*zy+cx;
			zny = 3*zx*zx*zy-zy*zy*zy+cy;
			zx = znx;
			zy = zny;
			if (++i>=iter)
				break;
			if (zx*zx+zy*zy>escape)
				break;
		}		
		return i;
	},
	'burningship' : function(cx,cy) {
		var zx=0, zy=0, i=0, znx, zny;
		while (true) {
			znx = zx*zx-zy*zy+cx;
			zny = 2*zx*zy+cy;
			zx = Math.abs(znx);
			zy = Math.abs(zny);
			if (++i>=iter)
				break;
			if (zx*zx+zy*zy>escape)
				break;
		}		
		return i;
	}
};
fractalFunction = fractalFunctionList.mandel; //default

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
	if (desc.type) {
		if (!(desc.type in fractalFunctionList))
			throw "Invalid fractal function " + desc.type;
		type = desc.type;
		fractalFunction = fractalFunctionList[type];
	}
	if (desc.swidth) {
		swidth = desc.swidth;
		sheight = desc.sheight;
		frame = new Float32Array(swidth*sheight);
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
		type:type,
	};
	return res;
},

drawTile: function(tile) {
	var py = pymin+tile.y1*pixelOnP;
	for (var sy=tile.y1; sy<tile.y2; sy++) {
		var px = pxmin+tile.x1*pixelOnP;
		var dx = sy*swidth+tile.x1;
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
	return frame;	
},

getBuffer: function() {
	return frame;
},

};

//-------- constructor
publicMethods.setFractalDesc(desc);
return publicMethods;

};
});

