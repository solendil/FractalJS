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

var escape = 4;	// square of escape distance

var typeid;		// type of fractal
var fractalFunction;	// the fractal function used

var desc;

//-------- private methds

var logBase = 1.0 / Math.log(2.0);
var logHalfBase = Math.log(0.5)*logBase;

// core fractal functions
var fractalFunctionList = {
	'mandelsmooth' : function(cx,cy) {
		var znx=0, zny=0, sqx=0, sqy=0, i=0, j=0;
		for(;i<desc.iter && sqx+sqy<=escape; ++i) {
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
		for(;i<desc.iter && sqx+sqy<=escape; ++i) {
			zny = (znx+znx)*zny + cy;
			znx = sqx-sqy + cx;
			sqx = znx*znx;
			sqy = zny*zny;
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
			if (++i>=desc.iter)
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
			if (++i>=desc.iter)
				break;
			sqx = zx*zx;
			sqy = zy*zy;
			if (sqx+sqy>escape)
				break;
		}
		return i;
	},
	// tippetts
	3 : function(cx,cy) {
		var zx=0, zy=0, sqx=0, sqy=0, i=0;
		for(;i<desc.iter && sqx+sqy<=escape; ++i) {
			zx = sqx-sqy+cx;
			zy = (zx+zx)*zy+cy;
			sqx = zx*zx;
			sqy = zy*zy;
		}
		return i;
	},
	// Julia Set A
	4 : function(cx,cy) {
		var znx=cx, zny=cy, sqx=cx*cx, sqy=cy*cy, i=0, j=0;
		for(;i<desc.iter && sqx+sqy<=escape; ++i) {
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
		for(;i<desc.iter && sx+sy<=escape; ++i) {
			xp1 = x*x-y*y+c+p*xm1;
			yp1 = 2*x*y+p*ym1;
			sx = xp1*xp1;
			sy = yp1*yp1;
			xm1=x; ym1=y;
			x=xp1; y=yp1;
		}
		return i;
	},


};

//-------- public methods

return {

drawTileOnBuffer: function(tile) {
	//console.log("draw", tile, desc)
	//console.log(fractalFunction)
	var frame = tile.frame;
	var py = desc.pymin+tile.y1*desc.pixelOnP;
	var dx = 0;
	for (var sy=tile.y1; sy<=tile.y2; sy++) {
		var px = desc.pxmin+tile.x1*desc.pixelOnP;
		for (var sx=tile.x1; sx<=tile.x2; sx++) {
			var piter = fractalFunction(px, py);
			if (piter==desc.iter)
				frame[dx++] = 0;
			else
				frame[dx++] = piter;
			px += desc.pixelOnP;
		}
		py += desc.pixelOnP;
	}
},

drawSuperTileOnBuffer: function(tile) {
	//console.log("super",tile)
	var sup = 16;
	var quincunx = false;
	var sss = desc.pixelOnP/6
	//console.log(fractalFunction)
	var frame = tile.frame;
	var py = desc.pymin+tile.y1*desc.pixelOnP;
	var dx = 0;
	for (var sy=tile.y1; sy<=tile.y2; sy++) {
		var px = desc.pxmin+tile.x1*desc.pixelOnP;
		for (var sx=tile.x1; sx<=tile.x2; sx++) {
			var itersum = 0
			if (quincunx) {
				// quincunx
				itersum += fractalFunction(px+0*sss,py+0*sss);
				itersum += fractalFunction(px+1*sss,py+2*sss);
				itersum += fractalFunction(px+2*sss,py-1*sss);
				itersum += fractalFunction(px-1*sss,py-2*sss);
				itersum += fractalFunction(px-2*sss,py-1*sss);
				var piter = itersum/5;
			} else if (sup==1) {
				var piter = fractalFunction(px, py);
			} else {
				for (var ss=0; ss<sup; ss++) {
					itersum += fractalFunction(px+Math.random()*desc.pixelOnP, py+Math.random()*desc.pixelOnP);
				}
				var piter = itersum/sup;
			}
			//console.log(px, py, piter)
			if (piter==desc.iter)
				frame[dx++] = 0;
			else
				frame[dx++] = piter;
			px += desc.pixelOnP;
		}
		py += desc.pixelOnP;
	}
},

drawSubTileOnBuffer: function(tile) {
	var res=4;
	var py = desc.pymin+(tile.y1+res/2)*desc.pixelOnP;
	var index = 0
	for (var y=0; y<tile.height; y+=res) {
		var px = desc.pxmin+(tile.x1+res/2)*desc.pixelOnP;
		var lineindex = index
		for (var x=0; x<tile.width; x+=res) {
			var piter = fractalFunction(px, py);
			var color = piter==desc.iter?0:piter;
			for (var sx=0; sx<res && x+sx<tile.width; sx++)
				tile.frame[index++] = color
			px += desc.pixelOnP*res;
		}
		for (var sy=1; sy<res && y+sy<tile.height; sy++)
			for (var tx=0; tx<tile.width; tx++)
				tile.frame[index++] = tile.frame[lineindex+tx]
		py += desc.pixelOnP*res;
	}
},

	setDesc: function(other) {
		desc=other;
		fractalFunction = fractalFunctionList[desc.typeid];
	}

};

//-------- constructor
})({});

onmessage = function(param) {
	var data = param.data
	if (!data)
		console.error(param);
	if (data.action === "setDesc") {
		engine.setDesc(data.desc);
	} else if (data.action === "draw") {
		if (data.quality==200) engine.drawTileOnBuffer(data.tile)
		else if (data.quality==100) engine.drawSubTileOnBuffer(data.tile)
		else if (data.quality==300) engine.drawSuperTileOnBuffer(data.tile)
		else throw "invalid drawing quality"
		//setTimeout(function() {
		postMessage({
			action:"endTile",
			quality:data.quality,
			tile:param.data.tile,
			frameId:param.data.frameId,
			finished:param.data.finished
		})
		//},0);
	} else {
		throw "invalid worker message";
	}
};
//-------- end of actual worker code

}.toString(),
')()' ], { type: 'application/javascript' } ) );
return blobURL;
})();
