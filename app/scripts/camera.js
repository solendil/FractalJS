/*
 * The camera projects screen space on complex space and vice-versa
 */
FractalJS.Camera = function(){
  "use strict";

  this.width = 100;
  this.height = 100;
  this.x = 0;
  this.y = 0;
  this.w = 0;
  this.pixelOnP = 0;
  this.pxmin = 0;
  this.pymin = 0;

  this.project = function() {
    var extent = Math.min(this.width, this.height);
    // precision limit is ten times the nb of pixels times double precision
    var limit = extent*1.11e-15;
    if (this.w<limit)
      this.w = limit;
    this.pixelOnP = this.w/extent;
    this.pxmin = this.x - this.width/2 * this.pixelOnP;
    this.pymin = this.y - this.height/2 * this.pixelOnP;
  };

  this.setSize = function(width, height) {
    this.width = width;
    this.height = height;
    this.project();
  };

  this.setXYW = function(x,y,w) {
    this.x = x;
    this.y = y;
    if (w) this.w = w;
    this.project();
  };

  // returns a serialisable object
  this.getWorkerModel = function() {
    return {pxmin:this.pxmin, pymin:this.pymin, pixelOnP:this.pixelOnP};
  };

  this.clone = function() {
    var res = new FractalJS.Camera();
    res.width    = this.width;
    res.height   = this.height;
    res.x        = this.x;
    res.y        = this.y;
    res.w        = this.w;
    res.pixelOnP = this.pixelOnP;
    res.pxmin    = this.pxmin;
    res.pymin    = this.pymin;
    return res;
  };

};
