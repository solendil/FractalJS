
var fractal;
var typeList = {
  "tippetts" : {
    typeId:3,
    x:-0.2,
    y:0.0,
    w:4,
    iter:50
  },
  "mandel" : {
    typeId:0,
    smooth:true,
    x:-0.7,
    y:0.0,
    w:2.5,
    iter:50
  },
  "julia_a" : {
    typeId:4,
    smooth:true,
    x:0.0,
    y:0.0,
    w:2.2,
    iter:50
  },
  "phoenix" : {
    typeId:5,
    smooth:true,
    x:0.0,
    y:-0.1,
    w:2,
    iter:500
  },
  "mandel3" : {
    typeId:1,
    smooth:true,
    x:0.0,
    y:0.0,
    w:3.0,
    iter:50
  },
  "burningship" : {
    typeId:2,
    smooth:true,
    x:-0.25,
    y:0.55,
    w:3,
    iter:50
  }
};

var buildGradientSwatches = function() {
  var div = $("#gradients");
  var builder = FractalJS.Colormapbuilder();
  var stdGradients = builder.getStandardGradients();
  for (var i in stdGradients) {
    var gradient = stdGradients[i];
    div.append("<div class='gradient'><canvas class='gradient' id='grad"+i+"' ival='"+i+"'> </canvas></div>");
    var canvas = document.getElementById("grad"+i);
    canvas.width = 120;
    canvas.height = 40;
    //console.log(canvas);
    var ctx = canvas.getContext("2d");
    var imageData = ctx.createImageData(canvas.width, 1);
    var idata32 = new Uint32Array(imageData.data.buffer);
    var buffer = builder.fromId(canvas.width,i);
    for (var x = 0; x<canvas.width; x++) {
      idata32[x] = buffer[x];
      //console.log(idata32[x])
    }
    for (var y=0; y<canvas.height; y++)
      ctx.putImageData(imageData, 0, y, 0, 0, canvas.width, 1);
  }
  // add click event
  $("canvas.gradient").click(function(e) {
    //console.log("event", e, $(this).attr("ival"))
    fractal.setColorDesc({
      typeId:$(this).attr("ival"),
      buffer:builder.fromId(1000,$(this).attr("ival"))
    });
    fractal.refreshColormap();
    console.log(fractal.getColorDesc());
  });
};

var updateInfo = function() {
  var model = fractal.getModel();
  $("#info_x").text(model.camera.x);
  $("#info_y").text(model.camera.y);
  $("#info_w").text(model.camera.w.toExponential(4));
  $("#info_iter").text(model.iter);
};

var updateShare = function() {
  var url = document.location.href;
  $("#share_link").html("<a href='"+url+"'>this link</a>");
  $("#share_embed").html("&lt;iframe onmousewheel=''<br/>src='http://solendil.github.io/fractaljs/iframe.html"+window.location.hash+"'><br/>&lt;/iframe>");
  $(".twitter-share-button").attr("href", "https://twitter.com/intent/tweet?url="+encodeURIComponent(document.location.href)+"&text=Check%20this%20nice%20%23fractaljs%20!");
};

$(function() {

  fractal = new FractalJS.create ({
    canvas:document.getElementById("maincanvas"),
    fractalDesc:typeList.mandel,
    renderer:{
      numberOfTiles:100,
      drawAfterInit:false,
    },
    controller:{
      fitToWindow:true
    },
    colormap:{
      typeId:0,
      buffer:FractalJS.Colormapbuilder().fromId(1000,0),
      density:20,
    }
  });
  fractal.draw("init");

  if (fractal.getModel().smooth) $('#smooth').removeClass('btn-default').addClass('btn-info');
  else $('#smooth').removeClass('btn-success').addClass('btn-default');
  $('#smooth').click(function(){
    if ($('#smooth').hasClass('btn-default')) {
      fractal.setFractalDesc({smooth:true});
      $('#smooth').removeClass('btn-default').addClass('btn-info');
    } else {
      fractal.setFractalDesc({smooth:false});
      $('#smooth').removeClass('btn-info').addClass('btn-default');
    }
    fractal.draw("init");
  });

  buildGradientSwatches();
  var slider_offset = document.getElementById("slider.offset");
  var slider_density = document.getElementById("slider.density");
  var increment = Math.pow(20/(1/20), 1/100);
  noUiSlider.create(slider_offset, {
    start: [0],
    range: {
      'min': 0,
      'max': 1
    }
  });
  noUiSlider.create(slider_density, {
    start: [0],
    range: {
      'min': 0,
      'max': 100
    }
  });

  // type buttons
  $(".fractaltype").click(function(e) {
    var name = $(this).attr("name");
    fractal.setFractalDesc(typeList[name]);
    fractal.resetViewport();
    $('#smooth').removeClass('btn-default').addClass('btn-info');
    slider_density.noUiSlider.set(100);
    fractal.draw("init");
  });

  // update "share" panel if it is opened
  fractal.events.on(["iter.change","user.control","api.change"], function(){
    if ($(".tabpane[name='share']").hasClass("active")) {
      updateShare();
    }
    if ($(".tabpane[name='info']").hasClass("active")) {
      updateInfo();
    }
  });

  // build data URL for image downloading
  $("#share_image").click(function() {
    var dataURL = document.getElementById("maincanvas").toDataURL('image/png');
    console.log($(this));
    $(this).context.href = dataURL;
  });

  // log end of frame recap and time
  fractal.events.on("frame.end", function(res) {
    console.log("finished drawing", res.data, "time in ms", res.time);
  });

  //
  slider_offset.noUiSlider.set(fractal.getColorDesc().offset);
  slider_offset.noUiSlider.on('start', function(){
    $(".tabpane").addClass("dissolve");
  });
  slider_offset.noUiSlider.on('end', function(){
    $(".tabpane").removeClass("dissolve");
  });
  slider_offset.noUiSlider.on('update', function(){
    var value = slider_offset.noUiSlider.get();
    if (!fractal) return;
    fractal.setColorDesc({offset:value});
    fractal.refreshColormap();
  });

  var dens = fractal.getColorDesc().density;
  var val = Math.log(20*dens)/Math.log(increment);
  slider_density.noUiSlider.set(val);
  slider_density.noUiSlider.on('start', function(){
    $(".tabpane").addClass("dissolve");
  });
  slider_density.noUiSlider.on('end', function(){
    $(".tabpane").removeClass("dissolve");
  });
  slider_density.noUiSlider.on('update', function(){
    var value = slider_density.noUiSlider.get();
    if (!fractal) return;
    fractal.setColorDesc({density:(1/20)*Math.pow(increment,value)});
    fractal.refreshColormap();
  });

  // share buttons
  $(".sharebtn").click(function(e) {
    var name = $(this).attr("name");
    $(".sharepane").removeClass("selected");
    $(".sharepane[name='"+name+"']").addClass("selected");
  });

  // FractalJS "reset" button
  $(".navbar-brand").click(function() {
    $(".navbar-nav li").removeClass("active");
    $(".tabpane").removeClass("active");
    $(".navbar-inverse").removeClass("active");
    /*fractal.setFractalDesc({type:'mandel',x:-0.7,y:0.0,w:2.5,i:50});
    fractal.draw();*/
    return false;
  });

  // open/close tabs
  $(".navbar-nav a").click(function(e) {
    var hide = false;
    var name = $(this).attr("name");
    var li = $(this).parent();
    if (li.hasClass("active"))
      hide = true;
    $(".navbar-nav li").removeClass("active");
    $(".tabpane").removeClass("active");
    $(".navbar-inverse").removeClass("active");
    if (!hide) {
      $(".navbar-nav a[name='"+name+"']").parent().addClass("active");
      $(".tabpane[name='"+name+"']").addClass("active");
      $(".navbar-inverse").addClass("active");
      updateShare();
      updateInfo();
    }
    return false;
  });

  fractal.events.on("zoom.limit.reached", function() {
    $(".alertbox").stop(true, true);
    $(".alertbox").fadeIn(0);
    $(".alertbox").delay(5000).fadeOut(1000);
  });

});
