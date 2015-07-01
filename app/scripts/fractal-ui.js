FractalJS.FractalUI = function(fractal) {
"use strict";

//-------- private members

//-------- private methods

var updateUrl = function() {
	var desc = fractal.getFractalDesc();

	// create a buffer and two views on it to store fractal parameters
	var buffer = new ArrayBuffer(32);
	var intArray = new Uint16Array(buffer);
	var doubleArray = new Float64Array(buffer);
	intArray[0] = 1; // version number
	intArray[1] = desc.iter;
	doubleArray[1] = desc.x;
	doubleArray[2] = desc.y;
	doubleArray[3] = desc.w;

	// encode as base64 and put in the URL
	// https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string/11562550#11562550
	var base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
	base64String = base64String.split("/").join("*");
	base64String = base64String.split("=").join("_");

	document.location.hash="A"+base64String;
	//console.log("Updating URL", {x:desc.x,y:desc.y,w:desc.w,iter:desc.iter});
};

var readUrl = function() {
	// http://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
	function _base64ToArrayBuffer(base64) {
	    var binary_string =  window.atob(base64);
	    var len = binary_string.length;
	    var bytes = new Uint8Array( len );
	    for (var i = 0; i < len; i++)        {
	        bytes[i] = binary_string.charCodeAt(i);
	    }
	    return bytes.buffer;
	}
	try {
		var url = document.location.hash;
		if (url.startsWith("#A")) {
			var base64String = url.substr(2);
			base64String = base64String.split("*").join("/");
			base64String = base64String.split("_").join("=");

			var buffer = _base64ToArrayBuffer(base64String);
			var intArray = new Uint16Array(buffer);
			var doubleArray = new Float64Array(buffer);

			var desc = {
				x:doubleArray[1],
				y:doubleArray[2],
				w:doubleArray[3],
				iter:intArray[1]
			};

			console.log("Initialization", desc);
			fractal.setFractalDesc(desc);
		}
	} catch(e) {
		console.error("Could not initialize view");
	}
};

//-------- constructor & jquery callbacks

// is there's a readable hash URL, load it
readUrl();

fractal.on("mouse.control", updateUrl);
fractal.on("iter.change", updateUrl);

//-------- public methods

return {


};

};
