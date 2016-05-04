FractalJS.Renderer = function (fractal, model) {
  "use strict";

  //-------- shortcuts

  var events = fractal.events;
  var params = fractal.params.renderer;
  var canvas = fractal.params.canvas;
  var util = FractalJS.util;
  var that = this;
  var debug = false;

  //-------- private members

  // the canvas on which to display, its context, backbuffer and view as int32
  var context = canvas.getContext("2d");
  var imageData, idata32;
  var vectorCanvas;

  // colormap is defined later
  var colormap = null;

  // internal state for tiling
  var tiles = [];
  var drawList = []; // list of remaining items to be drawn

  var startFrameMs;
  var frameId = 0;
  var nbOfThreads = 4;

  //-------- constructor

  if ("hardwareConcurrency" in navigator) {
    nbOfThreads = navigator.hardwareConcurrency;
    console.log("FractalJS will use all " + nbOfThreads + " cores");
  } else {
    console.log("FractalJS will use the default " + nbOfThreads + " threads");
  }

  var workers = [];

  //-------- public methods

  this.resize = function () {
    // resize temp buffers
    imageData = context.createImageData(canvas.width, canvas.height);
    idata32 = new Uint32Array(imageData.data.buffer);
    vectorCanvas = document.createElement('canvas');
    vectorCanvas.width = canvas.width;
    vectorCanvas.height = canvas.height;

    // compute new tiling
    var ratio = canvas.width / canvas.height;
    var tileNbHeight = Math.sqrt(params.numberOfTiles / ratio);
    var tileNbWidth = Math.round(tileNbHeight * ratio);
    tileNbHeight = Math.round(tileNbHeight);
    console.log("Canvas: " + canvas.width + "*" + canvas.height +
      " (ratio " + ratio.toFixed(3) + ")" +
      ", Tiles: " + tileNbWidth + "*" + tileNbHeight + " (" + tileNbHeight * tileNbWidth + " for " + params.numberOfTiles + " asked)" +
      " (~size " + Math.round(canvas.width / tileNbWidth) + "*" + Math.round(canvas.height / tileNbHeight) + ")"
    );

    // instanciate new tiles
    var tileid = 0;
    tiles.length = 0;
    for (var j = 0; j < tileNbHeight; j++) {
      for (var i = 0; i < tileNbWidth; i++) {
        var tile = {
          i: i,
          j: j,
          id: tileid++,
          x1: Math.round(i * canvas.width / tileNbWidth),
          x2: Math.round((i + 1) * canvas.width / tileNbWidth) - 1,
          y1: Math.round(j * canvas.height / tileNbHeight),
          y2: Math.round((j + 1) * canvas.height / tileNbHeight) - 1,
        };
        tile.x = (tile.x1 + tile.x2) / 2; // center of tile
        tile.y = (tile.y1 + tile.y2) / 2;
        tile.width = tile.x2 - tile.x1 + 1;
        tile.height = tile.y2 - tile.y1 + 1;
        tile.frame = new Float32Array(tile.width * tile.height);
        tile.indexScreen = tile.y1 * canvas.width + tile.x1;
        tiles.push(tile);
      }
    }
  };

  this.getIterAt = function (sx, sy) {
    // TODO : find a more efficient way than enumerating all tiles...
    for (var t in tiles) {
      var tile = tiles[t];
      if (sx >= tile.x1 && sx <= tile.x2 && sy >= tile.y1 && sy <= tile.y2) {
        return tile.frame[(sy - tile.y1) * tile.width + (sx - tile.x1)];
      }
    }
  };

  this.setColorDesc = function (desc) {
    if (!colormap) {
      colormap = FractalJS.Colormap(desc);
    } else {
      return colormap.setDesc(desc);
    }
  };

  this.getColorDesc = function () {
    return colormap.getDesc();
  };

  this.drawColors = function () {
    refreshColormap();
  };

  var lastvector = null;
  var lastquality = null;

  this.draw = function (reason, vector, fid, quality) {
    if (!quality) {
      quality = 200;
    }
    lastvector = vector;
    lastquality = quality;

    if (quality === 300 && fid !== frameId) {
      // drop supersampling if frame has changed since it was asked
      return;
    }

    // if a frame is being drawn, cancel next callback, empty draw list
    if (drawList.length !== 0) {
      drawList.length = 0;
    }

    startFrameMs = performance.now();
    frameId++;
    events.send("frame.start");

    // if a movement vector is provided, zoom/pan the current canvas accordingly to provide a quick first picture
    if (vector) {
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      vectorCanvas.getContext("2d").putImageData(imageData, 0, 0);
      if (vector.matrix) {
        context.translate(model.camera.width / 2, model.camera.height / 2);
        context.transform(vector.matrix.a, vector.matrix.b, vector.matrix.c, vector.matrix.d, vector.matrix.e, vector.matrix.f);
        context.translate(-model.camera.width / 2, -model.camera.height / 2);
      } else {
        context.scale(vector.z, vector.z);
        context.translate(vector.x, vector.y);
      }
      context.drawImage(vectorCanvas, 0, 0);
      context.setTransform(1, 0, 0, 1, 0, 0);
    }

    // push tiles in drawList
    var tile;
    for (var i in tiles) {
      tile = tiles[i];
      if (vector && (vector.mvt === "zoomin" || vector.mvt === "zoomout")) {
        tile.dx = vector.sx - tile.x; // distance to zoom point
        tile.dy = vector.sy - tile.y;
        tile.dist = tile.dx * tile.dx + tile.dy * tile.dy;
      }
      if (vector && vector.mvt === "pan") {
        tile.prio = 0;
        if (vector.x > 0 && tile.x1 < vector.x) {
          tile.prio = 1;
        }
        if (vector.x < 0 && tile.x2 > canvas.width + vector.x) {
          tile.prio = 1;
        }
        if (vector.y > 0 && tile.y1 < vector.y) {
          tile.prio = 1;
        }
        if (vector.y < 0 && tile.y2 > canvas.height + vector.y) {
          tile.prio = 1;
        }
      }
      // if this is an init, starts with a low quality 16x subsampling
      if (reason === "init") {
        drawList.push({
          action: 'draw',
          quality: 100,
          frameId: frameId,
          tile: tile
        });
      }

      drawList.push({
        action: 'draw',
        quality: quality,
        frameId: frameId,
        tile: tile
      });
    }

    // prioritize tiles according to movement
    drawList.sort(function (t1, t2) {
      if (t1.quality !== t2.quality) {
        return t1.quality - t2.quality;
      }
      if (vector) {
        if (vector.mvt === "pan") {
          return t2.tile.prio - t1.tile.prio;
        }
        if (vector.mvt === "zoomin") {
          return t1.tile.dist - t2.tile.dist;
        }
        if (vector.mvt === "zoomout") {
          return t2.tile.dist - t1.tile.dist;
        }
      }
      return t1.tile.id - t2.tile.id;
    });

    // dispatch first items of the drawList to all workers
    for (var w in workers) {
      var drawOrder = drawList.shift();
      if (drawOrder) {
        drawOrder.model = model.getWorkerModel();
        workers[w].postMessage(drawOrder);
      }
    }

  };

  //-------- private methods

  var endOfFrame = function (fid) {
    var endFrameMs = performance.now();
    events.send("frame.end", function () {
      return {
        time: endFrameMs - startFrameMs,
        data: {
          lastquality: lastquality,
        }
      };
    });
    if (lastquality === 300) {
      return;
    }
    // frame is finished; analyze buffer to auto-adjust iteration count
    // algorithm:
    // - we compute the percentage of pixels in the set/pixels on the screen
    // - the fringe is the band of pixels whose iteration is in the 10% upper
    // - we compute the percentage of pixels in the fringe/pixels in the set
    // - if set is big enough (>1%) and fringe is big vs set (>1%) increase iterations
    // - if set is big enough (>1%) and fringe is small vs set (<0.2%) decrease iterations
    var i, iter;
    //var buffer = engine.getBuffer();
    var minIter = 1e12,
      maxIter = -1;
    var nb = 0,
      nbInSet = 0;
    var tile;
    for (var ti in tiles) {
      tile = tiles[ti];
      for (i = 0; i < tile.frame.length; i++) {
        nb++;
        iter = tile.frame[i];
        if (iter === 0) {
          nbInSet++;
          continue;
        }
        if (iter > maxIter) {
          maxIter = iter;
        }
        if (iter < minIter) {
          minIter = iter;
        }
      }
    }
    var iterRange = maxIter - minIter;
    var fringe10p = model.iter - Math.ceil(iterRange / 10);
    var nbFringe10p = 0;
    //console.log(minIter, maxIter, iterRange +"/"+ engine.getDesc().iter, nbInSet, fringe10p)
    for (ti in tiles) {
      tile = tiles[ti];
      for (i = 0; i < tile.frame.length; i++) {
        iter = tile.frame[i];
        if (iter === 0) {
          continue;
        }
        if (iter >= fringe10p) {
          nbFringe10p++;
        }
      }
    }
    var percInSet = 100.0 * nbInSet / nb;
    var percFringe10p = 100.0 * nbFringe10p / nbInSet;
    //console.log(nbFringe10p, percInSet, percFringe10p)
    if (percInSet > 1 && percFringe10p > 1) {
      model.iter = Math.round(model.iter * 1.5);
      that.draw(null, null, null, 200);
      events.send("iter.change");
    } else {
      setTimeout(function () {
        that.draw("supersampling", null, fid, 300);
      }, 1000);
    }
    if (percInSet > 1 && percFringe10p < 0.2) {
      model.iter = Math.round(model.iter / 1.5);
      // public_methods.draw();
      events.send("iter.change");
    }
  };

  var refreshColormap = function () {
    var start = performance.now();
    // Performing the colormap refresh in place instead of calling the colormap
    // object brings a 5x performance in Chrome (25ms instead of 150).
    var cmap = colormap.getDesc();
    var buffer = cmap.buffer,
      offset = cmap.offset * buffer.length,
      density = cmap.density,
      resolution = buffer.length;
    for (var ti in tiles) {
      var tile = tiles[ti];
      var indexscreen = tile.indexScreen;
      var index = 0;
      for (var y = 0; y < tile.height; y++) {
        for (var x = 0; x < tile.width; x++) {
          var iter = tile.frame[index++];
          if (iter === 0) {
            idata32[indexscreen] = 0xFF000000;
          } else {
            idata32[indexscreen] = buffer[~~((iter * density + offset) % resolution)];
          }
          indexscreen++;
        }
        indexscreen += canvas.width - tile.width;
      }
    }
    context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    var end = performance.now();
    //console.log("colormap refreshed in ", (end-start))
  };

  this.workerMessage = function (param) {
    if (param.data.action === "endTile") {
      if (param.data.frameId !== frameId) {
        return; // frame has changed, drop this result
      }

      // replace original tile by the one coming from worker
      var incid = param.data.tile.id;
      var tile = param.data.tile;
      tiles[incid] = tile;

      // paint on canvas
      var tileIndex = 0;
      var bufferIndex = 0;
      var cmap = colormap.getDesc();
      var buffer = cmap.buffer,
        offset = cmap.offset * buffer.length,
        density = cmap.density,
        resolution = buffer.length,
        color;
      for (var ty = 0; ty < tile.height; ty++) {
        bufferIndex = (ty + tile.y1) * canvas.width + tile.x1;
        for (var tx = 0; tx < tile.width; tx++) {
          var iter = tile.frame[tileIndex++];
          if (iter === 0) {
            color = 0xFF000000;
          } else {
            color = buffer[~~((iter * density + offset) % resolution)];
          }
          idata32[bufferIndex++] = color;
        }
      }
      context.putImageData(imageData, 0, 0, tile.x1, tile.y1, tile.width, tile.height);
      if (debug) {
        console.log(param.data);
        context.strokeStyle = param.data.quality === 300 ? "red" : "green";
        context.strokeRect(tile.x1, tile.y1, tile.width, tile.height);
      }

      // set this worker to another task
      if (drawList.length > 0) {
        var drawOrder = drawList.shift();
        if (drawList.length === 0) {
          drawOrder.finished = true;
        }
        drawOrder.model = model.getWorkerModel();
        param.target.postMessage(drawOrder);
      }

      // this mechanism looks fragile...
      if (param.data.finished) {
        endOfFrame(param.data.frameId);
      }
    } else {
      throw "Unknown message";
    }
  };

  for (var i = 0; i < nbOfThreads; i++) {
    var worker = FractalJS.EngineWorker();
    workers.push(worker);
    worker.onmessage = this.workerMessage;
  }

  this.resize();

};
