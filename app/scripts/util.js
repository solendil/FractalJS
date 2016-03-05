/*
 * Definition of the FractalJS global object that contains all the rest
 */
window.FractalJS = window.FractalJS || {};

/*
 * Some global initialization methods (polyfills)
 * Some static utility methods
 */
FractalJS.util = (function(){
"use strict";

//-------- polyfills

Math.trunc = Math.trunc || function(x) {
  return x < 0 ? Math.ceil(x) : Math.floor(x);
};

if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

if ("performance" in window === false) {
	window.performance = {};
}

// https://gist.github.com/paulirish/5438650
if ("now" in window.performance === false){
	var nowOffset = Date.now();
	if (performance.timing && performance.timing.navigationStart){
	  nowOffset = performance.timing.navigationStart;
	}
	window.performance.now = function now(){
	  return Date.now() - nowOffset;
	};
}

//-------- private functions

var toHex2 = function(number) {
	if (number<0 || number>255)
		throw "Number is out of range";
	if (number<16)
		return "0" + number.toString(16);
	return number.toString(16);
};

//-------- public functions

return {

/* Monotone cubic spline interpolation
   Usage example:
	var f = createInterpolant([0, 1, 2, 3, 4], [0, 1, 4, 9, 16]);
	var message = '';
	for (var x = 0; x <= 4; x += 0.5) {
		var xSquared = f(x);
		message += x + ' squared is about ' + xSquared + '\n';
	}
	alert(message);
	https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
*/
/* jshint ignore:start */
createInterpolant: function(xs, ys) {
	var i, length = xs.length;

	// Deal with length issues
	if (length != ys.length) { throw 'Need an equal count of xs and ys.'; }
	if (length === 0) { return function(x) { return 0; }; }
	if (length === 1) {
		// Impl: Precomputing the result prevents problems if ys is mutated later and allows garbage collection of ys
		// Impl: Unary plus properly converts values to numbers
		var result = +ys[0];
		return function(x) { return result; };
	}

	// Rearrange xs and ys so that xs is sorted
	var indexes = [];
	for (i = 0; i < length; i++) { indexes.push(i); }
	indexes.sort(function(a, b) { return xs[a] < xs[b] ? -1 : 1; });
	var oldXs = xs, oldYs = ys;
	// Impl: Creating new arrays also prevents problems if the input arrays are mutated later
	xs = []; ys = [];
	// Impl: Unary plus properly converts values to numbers
	for (i = 0; i < length; i++) { xs.push(+oldXs[indexes[i]]); ys.push(+oldYs[indexes[i]]); }

	// Get consecutive differences and slopes
	var dys = [], dxs = [], ms = [];
	for (i = 0; i < length - 1; i++) {
		var dx = xs[i + 1] - xs[i], dy = ys[i + 1] - ys[i];
		dxs.push(dx); dys.push(dy); ms.push(dy/dx);
	}

	// Get degree-1 coefficients
	var c1s = [ms[0]];
	for (i = 0; i < dxs.length - 1; i++) {
		var m = ms[i], mNext = ms[i + 1];
		if (m*mNext <= 0) {
			c1s.push(0);
		} else {
			var dx = dxs[i], dxNext = dxs[i + 1], common = dx + dxNext;
			c1s.push(3*common/((common + dxNext)/m + (common + dx)/mNext));
		}
	}
	c1s.push(ms[ms.length - 1]);

	// Get degree-2 and degree-3 coefficients
	var c2s = [], c3s = [];
	for (i = 0; i < c1s.length - 1; i++) {
		var c1 = c1s[i], m = ms[i], invDx = 1/dxs[i], common = c1 + c1s[i + 1] - m - m;
		c2s.push((m - c1 - common)*invDx); c3s.push(common*invDx*invDx);
	}

	// Return interpolant function
	return function(x) {
		// The rightmost point in the dataset should give an exact result
		var i = xs.length - 1;
		if (x == xs[i]) { return ys[i]; }

		// Search for the interval x is in, returning the corresponding y if x is one of the original xs
		var low = 0, mid, high = c3s.length - 1;
		while (low <= high) {
			mid = Math.floor(0.5*(low + high));
			var xHere = xs[mid];
			if (xHere < x) { low = mid + 1; }
			else if (xHere > x) { high = mid - 1; }
			else { return ys[mid]; }
		}
		i = Math.max(0, high);

		// Interpolate
		var diff = x - xs[i], diffSq = diff*diff;
		return ys[i] + c1s[i]*diff + c2s[i]*diffSq + c3s[i]*diff*diffSq;
	};
},
/* jshint ignore:end */

/*
 * Convert hue-saturation-value/luminosity to RGB.
 * Input ranges:
 *   H =   [0, 360] (integer degrees)
 *   S = [0.0, 1.0] (float)
 *   V = [0.0, 1.0] (float)
 */
hsv_to_rgb: function(h, s, v) {
	if (h==360) h=0;
	if ( v > 1.0 ) v = 1.0;
	var hp = h/60.0;
	var c = v * s;
	var x = c*(1 - Math.abs((hp % 2) - 1));
	var rgb = [0,0,0];

	if ( 0<=hp && hp<1 ) rgb = [c, x, 0];
	if ( 1<=hp && hp<2 ) rgb = [x, c, 0];
	if ( 2<=hp && hp<3 ) rgb = [0, c, x];
	if ( 3<=hp && hp<4 ) rgb = [0, x, c];
	if ( 4<=hp && hp<5 ) rgb = [x, 0, c];
	if ( 5<=hp && hp<6 ) rgb = [c, 0, x];

	var m = v - c;
	rgb[0] += m;
	rgb[1] += m;
	rgb[2] += m;

	rgb[0] *= 255;
	rgb[1] *= 255;
	rgb[2] *= 255;
	return rgb;
},

defaultProps: function(dest, def) {
	var prop;
	if (!dest) {
		dest={};
	}
	for (prop in def) {
		if (!(prop in dest)) {
			dest[prop] = def[prop];
		}
	}
	for (prop in dest) {
		if (!(prop in def)) {
			console.log("WARN : unknown property ", prop);
		}
	}
	return dest;
},

getHashColor: function(r, g, b) {
		return "#" + toHex2(r) + toHex2(g) + toHex2(b);
},

epsilonEquals: function(v1, v2, epsilon) {
	if (!epsilon)
		epsilon=1e-15;
	return Math.abs(v1-v2)<epsilon;
},

// http://stackoverflow.com/questions/21797299/convert-base64-string-to-arraybuffer
base64ToArrayBuffer: function (base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
},

// https://jmperezperez.com/ondemand-javascript-lazy-loading-stubs/
loadJs: function(url, cb) {
  var script = document.createElement('script');
  script.setAttribute('src', url);
  script.setAttribute('type', 'text/javascript');

  var loaded = false;
  var loadFunction = function () {
    if (loaded) return;
    loaded = true;
    if (cb) cb();
  };
  script.onload = loadFunction;
  script.onreadystatechange = loadFunction;
  document.getElementsByTagName("head")[0].appendChild(script);
},

// http://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
is_touch_device: function() {
  return 'ontouchstart' in window ||        // works on most browsers
       navigator.maxTouchPoints;       // works on IE10/11 and Surface
},

Matrix: function(a,b,c,d,e,f) {
	var Matrix = FractalJS.util.Matrix;
    if (f===undefined) {
      this.a = 1; this.c = 0; this.e = 0;
      this.b = 0; this.d = 1; this.f = 0;
    } else {
      this.a = a; this.c = c; this.e = e;
      this.b = b; this.d = d; this.f = f;
    }
    this.isInvertible = function() {
      var deter = this.a * this.d - this.b * this.c;
      return Math.abs(deter)>1e-15;
    };
    this.inverseGaussJordan = function() {
		function gje(M,c1i,c2i,f) {
			var c1 = M[c1i];
			var c2 = M[c2i];
			for (var i=0; i<6; i++) {
				// console.log("multiply factor", f, "by member", c2[i])
				c1[i] += c2[i] * f;
			}
		}
		function gjet(M,c1i,f) {
			var c1 = M[c1i];
			for (var i=0; i<6; i++) {
				// console.log("multiply factor", f, "by member", c1[i], "res", c1[i] * f)
				c1[i] = c1[i] * f;
			}
		}
		var M = [[a,c,e,1,0,0],[b,d,f,0,1,0],[0,0,1,0,0,1]];
		// console.log("START\n"+str(M));
		gje(M,1,2,-M[1][2]); // c2 = c2 + c3 * -f
		// console.log("c2=c2-fc3\n"+str(M));
		gje(M,0,2,-M[0][2]); // c1 = c1 + c3 * -e
		// console.log("c2=c2-ec3\n"+str(M));
		gje(M,1,0,-M[1][0]/M[0][0]);
		// console.log("c2=c2-?c3\n"+str(M));
		gje(M,0,1,-M[0][1]/M[1][1]);
		// console.log("c2=c2-?c3\n"+str(M));
		gjet(M,0,1/M[0][0]);
		// console.log("c1 norm\n"+str(M));
		gjet(M,1,1/M[1][1]);
		// console.log("c1 norm\n"+str(M));
		return new Matrix(M[0][3],M[1][3],M[0][4],M[1][4],M[0][5],M[1][5]);
    };
    this.inverse = function() {
      if (!this.isInvertible()) {
      	return this.inverseGaussJordan();
      } else {
        var a = this.a, b = this.b, c = this.c, d = this.d, e = this.e, f = this.f;
        var dt = a * d - b * c;
        return new Matrix(d/dt, -b/dt, -c/dt, a/dt, (c * f - d * e) / dt, -(a * f - b * e) / dt);
      }
    };
    this.multiply = function(o) {
      return new Matrix(
        this.a * o.a + this.c * o.b,
    		this.b * o.a + this.d * o.b,
    		this.a * o.c + this.c * o.d,
    		this.b * o.c + this.d * o.d,
    		this.a * o.e + this.c * o.f + this.e,
    		this.b * o.e + this.d * o.f + this.f
      );
    };
    this.rotate = function(angle) {
      var cos = Math.cos(angle), sin = Math.sin(angle);
      return this.multiply(new Matrix(cos, sin, -sin, cos, 0, 0));
    };
    this.isIdentity = function() {
      return this.a==1 && this.b===0 && this.c===0 && this.d==1 && this.e===0 && this.f===0;
    };
    this.clone = function(angle) {
      return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
    };
    this.applyTo = function(x, y) {
      return {
        x: x * this.a + y * this.c + this.e,
        y: x * this.b + y * this.d + this.f
      };
    };
    // this method is used to pass a matrix to a worker
    this.params = function() {
      return {a:a,b:b,c:c,d:d,e:e,f:f};
    };
}

};

})();

// add static method to matrix
FractalJS.util.Matrix.GetTriangleToTriangle = function(t1px, t1py, t1qx, t1qy, t1rx, t1ry, t2px, t2py, t2qx, t2qy, t2rx, t2ry) {
  var STD2T1 = new FractalJS.util.Matrix(t1px-t1rx, t1py-t1ry, t1qx-t1rx, t1qy-t1ry, t1rx, t1ry);
  var STD2T2 = new FractalJS.util.Matrix(t2px-t2rx, t2py-t2ry, t2qx-t2rx, t2qy-t2ry, t2rx, t2ry);
  var T12STD = STD2T1.inverse();
  return STD2T2.multiply(T12STD);
};

// add static method to matrix
FractalJS.util.Matrix.GetRotationMatrix = function(angle) {
  var cos = Math.cos(angle), sin = Math.sin(angle);
  return new FractalJS.util.Matrix(cos, sin, -sin, cos, 0, 0);
};

// add static method to matrix
FractalJS.util.Matrix.GetScaleMatrix = function(x, y) {
 	return new FractalJS.util.Matrix(x, 0, 0, y, 0, 0);
};

// add static method to matrix
FractalJS.util.Matrix.GetShearMatrix = function(x, y) {
 	return new FractalJS.util.Matrix(1, y, x, 1, 0, 0);
};

// add static method to matrix
FractalJS.util.Matrix.Identity = function(scale) {
  return new FractalJS.util.Matrix(1, 0, 0, 1, 0, 0);
};

