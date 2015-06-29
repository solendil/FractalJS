define(["jquery"], 
function($) {
"use strict";

/*
 * The fractal UI:
 */
return function(f) {

//-------- private members

//-------- jquery callbacks

// make debug menu visible 
$(".menuitem[menu-name='debug']").removeClass("hidden");

// open a selected menu
var openMenu = 'debug'; // debug
$(".menuitem[menu-name='"+openMenu+"']").addClass("selected");
$(".pane[menu-name='"+openMenu+"']").removeClass("hidden");


// DEBUG text
f.on("frame.start", function(e) {
	var text = 
		"x:"+e.fractalDesc.x+"<br />"+
		"y:"+e.fractalDesc.y+"<br />"+
		"w:"+e.fractalDesc.w+"<br />";
	$(".debug .pos").html(text);
});

// analyze buffer
f.on("frame.end", function(e) {
	var i, iter;
	var buffer = e.buffer;
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
	var percInSet = Number(100.0*nbInSet/nb).toFixed(2);
	var iterRange = maxIter-minIter;

	var fringe10p = Math.ceil(e.fractalDesc.iter - iterRange/10);
	var fringe10wp = Math.floor(e.fractalDesc.iter*0.9);
	var nbFringe10p = 0;
	var nbFringe10wp = 0;
	for (i=0; i<buffer.length; i++) {
		iter = buffer[i];
		if (iter===0) 
			continue;
		if (iter>=fringe10p) 
			nbFringe10p++;
		if (iter>=fringe10wp) 
			nbFringe10wp++;
	}	
	var percFringe10p = Number(100.0*nbFringe10p/nb).toFixed(2);
	var percFringe10wp = Number(100.0*nbFringe10wp/nb).toFixed(2);

	var percFringe10pS = Number(100.0*nbFringe10p/nbInSet).toFixed(2);
	var percFringe10wpS = Number(100.0*nbFringe10wp/nbInSet).toFixed(2);

	var mpixps = Number(e.buffer.length / (e.time/1000) / 1000000).toFixed(3);

	var text =
		"Iterations : "+minIter+" to "+maxIter+" - range "+iterRange+" - maxIter "+e.fractalDesc.iter+"<br>"+
		"Fringe 10% &nbsp;: limit "+fringe10p +" nb "+nbFringe10p +" (<b>"+percFringe10p+"%</b> of screen, <b>"+percFringe10pS+"%</b> of set)<br>"+
		"Fringe 10W% : limit "     +fringe10wp+" nb "+nbFringe10wp+" (<b>"+percFringe10wp+"%</b> of screen, <b>"+percFringe10wpS+"%</b> of set)<br>"+
		"Pixels "+nb+", in set "+nbInSet+" -- <b>"+percInSet+"%</b><br>"+
		"Time "+Math.round(e.time)+"ms, "+mpixps+" Mpixel/s<br/>";
	$(".debug .frame").html(text);	
});

//-------- private methods

//-------- public methods

return {


};

};
});