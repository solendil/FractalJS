/*
 * The engine:
 * - knows fractal parameters and perform basic computations on them (pixel ratio, zoom limit, etc...)
 * - instanciates and maintains workers to perform the actual fractal computations
 */
FractalJS.Engine = function(nbThreads) {
"use strict";

var desc = {};
var workers = [];
for (var i=0; i<nbThreads; i++)
  workers.push(FractalJS.EngineWorker());

var project = function() {
  var sminExtent = Math.min(desc.swidth, desc.sheight);
  // precision limit is ten times the nb of pixels times double precision
  var limit = sminExtent*1.11e-15;
  if (desc.w<limit)
    desc.w = limit;
  desc.pixelOnP = desc.w/sminExtent;
  desc.pxmin = desc.x - desc.swidth/2 * desc.pixelOnP;
  desc.pymin = desc.y - desc.sheight/2 * desc.pixelOnP;
};

this.eachWorker = function (callback) {
  for (var w in workers)
    callback(workers[w]);
};

this.setDesc = function (other) {
  if ('x' in other)
    desc.x = other.x;
  if ('y' in other)
    desc.y = other.y;
  if (other.w)
    desc.w = other.w;
  if (other.i)
    desc.iter = Math.round(other.i);
  if (other.iter)
    desc.iter = Math.round(other.iter);
  if ('typeid' in other)
    desc.typeid = other.typeid;
  if ('smooth' in other)
    desc.smooth = other.smooth;
  if (other.swidth) {
    desc.swidth = other.swidth;
    desc.sheight = other.sheight;
  }
  project();
  for (var w in workers)
    workers[w].postMessage({action:"setDesc",desc:desc,other:other});
};

this.getDesc = function () {
  return {
    x:desc.x, y:desc.y, w:desc.w, iter:desc.iter,
    pixelOnP:desc.pixelOnP,
    swidth:desc.swidth, sheight:desc.sheight,
    pxmin:desc.pxmin, pymin:desc.pymin,
    typeid:desc.typeid, smooth:desc.smooth
  };
};

};
