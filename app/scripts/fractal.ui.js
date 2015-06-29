define(["jquery", "palette.ui"], 
function($, PaletteUi) {
"use strict";

/*
 * The fractal UI:
 */
return function(fractal) {

//-------- private members

// presets for fractal type
var typeList = {
	"mandel" : {
		type:'mandel',
		x:-0.7, 
		y:0.0, 
		w:2.5, 
		i:50
	},
	"mandelsmooth" : {
		type:'mandelsmooth',
		x:-0.7, 
		y:0.0, 
		w:2.5, 
		i:50
	},
	"mandel3" : {
		type:'mandel3',
		x:0.0, 
		y:0.0, 
		w:3.0, 
		i:50
	},
	"burningship" : {
		type:'burningship',
		x:-0.2, 
		y:-0.7, 
		w:2.5, 
		i:50
	}
};

var paletteui = new PaletteUi(
	fractal, 
	fractal.getPalette(), 
	document.getElementById("palettecanvas"));

//-------- private methods

var updateUrl = function() {
	var json = {fractalDesc:{},palette:{}};
	var desc = fractal.getFractalDesc();
	json.fractalDesc={
		type:desc.type,
		x:desc.x,
		y:desc.y,
		w:desc.w,
		iter:desc.iter
	};
	var pal = fractal.getPalette().getShortDesc();
	json.palette={
		offset:pal.offset,
		modulo:pal.modulo,
		stops:pal.stops
	};
	var string = JSON.stringify(json);
	//console.log(string.length, string);
	var encoded = encodeURIComponent(string);
	//console.log(encoded.length, encoded);
	document.location.hash="/desc.v1/"+encoded;
};

var readUrl = function() {
	var url = document.location.hash;
	console.log(url);
	if (url.startsWith("#/desc.v1/")) {
		var encoded = url.substring("#/desc.v1/".length);
		var decoded = decodeURIComponent(encoded);
		var obj = JSON.parse(decoded);
		fractal.setFractalDesc(obj.fractalDesc);
		fractal.getPalette().setShortDesc(obj.palette);
		
		console.log(encoded);
		console.log(decoded);
		console.log("---",obj);
		
	}
};

//-------- constructor & jquery callbacks

// is there's a readable hash URL, load it
readUrl();

// PANELS

$(".menuitem").click(function(e) {
	var selected = $(this).hasClass("selected");
	$(".menuitem").removeClass("selected");
	$(".pane").addClass("hidden");
	if (selected) {
		$(this).removeClass("selected");
	} else {
		var menuName = $(this).attr("menu-name");
		$(this).addClass("selected");
		var pane = $(".pane[menu-name='"+menuName+"']");
		pane.removeClass("hidden");
		if (menuName=="color")
			paletteui.resize();
	}
});

// FRACTAL TYPE buttons 

var desc = fractal.getFractalDesc();
$(".changetype[type-name='"+desc.type+"']").addClass("selected");

$(".changetype").click(function(e) {
	var type = $(this).attr("type-name");
	fractal.setFractalDesc(typeList[type]);
	fractal.draw();
	$(".changetype").removeClass("selected");
	$(".changetype[type-name='"+type+"']").addClass("selected");
});

fractal.on("palette.change", function(e) {
	updateUrl();
});

fractal.on("mouse.control", function(e) {
	// make the fractal type menu disappear on mouse control
	if ($(".menuitem[menu-name='type']").hasClass("selected")) {
		$(".menuitem").removeClass("selected");
		$(".pane").addClass("hidden");
	}
	// update the URL
	updateUrl();
});


//-------- public methods

return {


};

};
});