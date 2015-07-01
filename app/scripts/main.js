require(["fractal", "fractal-ui"], function(Fractal, FractalUI) {
	"use strict";
	var f = new Fractal({
		canvas:document.getElementById("maincanvas"),
		fractalDesc:{
			type:'mandel',
			x:-0.7, 
			y:0.0, 
			w:2.5, 
			i:50
		},
		palette:{
			resolution:500,
			stops:"0#080560;0.2#2969CB;0.40#F1FEFE;0.60#FCA425;0.85#000000"
		},
		renderer:{
			numberOfTiles:100,
			drawAfterInit:false,  // postpone first drawing after UI is initialized
		},
		controller:{
			fitToWindow:true
		}
	});
	var ui = new FractalUI(f);
	f.draw();
});