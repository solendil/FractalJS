define(["util"], function(util) {
"use strict";

return function(fractal, palette, canvas) {

//-------- private members

var parentNode = canvas.parentNode;
var loopExtent = 0.2;  // extent of palette looping on left and right for representation
var isDragging;
var dragX, dragY;
var startOffset, startModulo;

//-------- private methds

var zotocv = function(zo) {
	var width = canvas.width;
	var usableWidth = canvas.width/(1+loopExtent*2);
	var offset = usableWidth*loopExtent;
	return Math.round(offset+zo*usableWidth);
};

var draw = function() {
	//console.log("draw", canvas.width)

	var ctx = canvas.getContext("2d");
	var imageData = ctx.createImageData(canvas.width, 1);
	var idata32 = new Uint32Array(imageData.data.buffer);
	var buffer = palette.getState().buffer;
	
	for (var x = 0; x<canvas.width; x++) {
		var ix = ((1+2*loopExtent)*x/canvas.width)-loopExtent;
		var index = buffer.length*ix;
		index = (index+buffer.length) % buffer.length;
		//console.log(x,index)
		idata32[x] = buffer[index|0];
	}
	//console.log(idata32.length, idata32)
	
	ctx.lineWidth = 1;
	ctx.strokeStyle = '#000';

	for (var y=0; y<canvas.height; y++)
		ctx.putImageData(imageData, 0, y, 0, 0, canvas.width, 1);

	var x1 = zotocv(0.0)+0.5;
	var x2 = zotocv(1.0)+0.5;

	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.strokeStyle="#CCC";
	ctx.stroke();
	ctx.moveTo(x1,0);
	ctx.lineTo(x1,canvas.height/3);
	ctx.moveTo(x1,2*canvas.height/3);
	ctx.lineTo(x1,canvas.height);
	ctx.stroke();
	ctx.moveTo(x2,0);
	ctx.lineTo(x2,canvas.height/3);
	ctx.moveTo(x2,2*canvas.height/3);
	ctx.lineTo(x2,canvas.height);
	ctx.stroke();

	// draw stops
	var stopsdiv = $("#palette_stops");

	var stops = palette.getState().stops;
	for (var i in stops) {
		var stop = stops[i];
		var canvasx = zotocv(stop.index);
		//console.log(stop.index, canvasx)
		/*
		ctx.beginPath();
		ctx.arc(canvasx, canvas.height/2, 10, 0, 2 * Math.PI, false);
		ctx.fillStyle = 'green';
		ctx.fill();
		ctx.lineWidth = 5;
		ctx.strokeStyle = '#000000';
		ctx.stroke();
		*/
		var stopdiv = $("<div class='palette_stop'>&nbsp;</div>");
		stopsdiv.append(stopdiv);
		//console.log(stopdiv, stopdiv.width(), stopdiv.height());
		stopdiv.offset({
			left:canvasx-stopdiv.width()/2, 
			top:canvas.height/2-stopdiv.height()/2
		});
	}
};

var resize = function() {
	canvas.width = $(parentNode).width();
	//console.log("size palette", canvas.width)
	canvas.height = 50;
	if (canvas.width!==0)
		draw();
};

//-------- constructor

// SIZE
$(window).resize(function() {
	resize();
});

$(function() {resize();});

$(canvas).mousedown(function(e) {
	isDragging = true;
	dragX = e.screenX;
	dragY = e.screenY;
	startOffset = palette.getState().offset;
	startModulo = palette.getState().modulo;
});

// DRAG MECHANISM
$(window).mouseup(function(e) {
	isDragging = false;
});

$(window).mousemove(function(e) {
	if (isDragging) {
		var vecx = e.screenX-dragX;
		var vecy = e.screenY-dragY;

		var offsetx = vecx/canvas.width;
		var offsety = fractal.getFractalDesc().iter * vecy/(canvas.height*10);

		//console.log(offsety, startModulo+offsety)

		palette.setState({
			offset:startOffset+offsetx,
			modulo:startModulo+offsety
		});
		palette.build();
		draw();
		fractal.drawPalette();
	}
});

//-------- public methods

return {

resize: function() {
	resize();
}

};

};
});

