/*
* The camera projects screen space on complex space and vice-versa
*/
FractalJS.Url = function(model, fractal){
"use strict";

	var util = FractalJS.util;

	this.update = function() {
		try {
			var args = [];
			var color = fractal.getColorDesc();
			args.push(["t",model.typeId]);
			args.push(["x",model.camera.x]);
			args.push(["y",model.camera.y]);
			args.push(["w",model.camera.w]);
			args.push(["i",model.iter]);
			args.push(["fs",model.smooth?1:0]);
			args.push(["ct",color.typeId]);
			args.push(["co",color.offset*100]);
			args.push(["cd",+color.density.toFixed(2)]);
			if (!model.camera.viewportMatrix.isIdentity()) {
				args.push(["va",model.camera.viewportMatrix.a.toFixed(4)]);
				args.push(["vb",model.camera.viewportMatrix.b.toFixed(4)]);
				args.push(["vc",model.camera.viewportMatrix.c.toFixed(4)]);
				args.push(["vd",model.camera.viewportMatrix.d.toFixed(4)]);
			}
			var str = "";
			for (var i in args) {
				var arg = args[i];
				str += "&" + arg[0] + "_" + arg[1];
			}
			history.replaceState("", "", "#B"+str.substr(1));
		} catch(e) {
			console.error("Could not set URL");
			console.error(e);
		}
	};

	this.read = function() {
	var desc, color;
	try {
		var url = document.location.hash;
		if (url.startsWith("#A")) {
			var base64String = url.substr(2);
			base64String = base64String.split("*").join("/");
			base64String = base64String.split("_").join("=");
			var buffer = FractalJS.util.base64ToArrayBuffer(base64String);
			var byteArray = new Uint8Array(buffer);
			var intArray = new Uint16Array(buffer);
			var doubleArray = new Float64Array(buffer);
			var floatArray = new Float32Array(buffer);
			var flags = byteArray[36];
			desc = {
				x:doubleArray[1],
				y:-doubleArray[2],
				w:doubleArray[3],
				iter:intArray[1],
				typeId:byteArray[4],
				smooth:flags&0x1==1
			};
			color = {
				offset:intArray[3]/10000.0,
				density:byteArray.length>32?floatArray[8]:20,
				typeId:byteArray[5],
				resolution:1000,
				buffer:FractalJS.Colormapbuilder().fromId(1000, byteArray[5]),
			};
			return [desc,color];
		} else if (url.startsWith("#B")) {
			var str = url.substr(2);
			var tuples = str.split("&");
			var map = {};
			for (var i in tuples) {
				var tuple = tuples[i].split("_");
				map[tuple[0]] = tuple[1];
			}
			desc = {
				x:parseFloat(map.x),
				y:parseFloat(map.y),
				w:parseFloat(map.w),
				iter:parseInt(map.i),
				typeId:parseInt(map.t),
				smooth:map.fs==1,
			};
			if ("va" in map) {
				desc.viewport = new util.Matrix(parseFloat(map.va),parseFloat(map.vb),
					parseFloat(map.vc),parseFloat(map.vd),0,0);
			}
			color = {
				offset:parseInt(map.co)/100.0,
				density:parseFloat(map.cd),
				typeId:parseInt(map.ct),
				resolution:1000,
				buffer:FractalJS.Colormapbuilder().fromId(1000, parseInt(map.ct)),
			};
			return [desc,color];
		}
	} catch(e) {
		console.error("Could not read URL");
		console.error(e);
	} finally {}
	};


};