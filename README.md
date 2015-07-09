# FractalJS

[![](static/button.png)](http://solendil.github.io/fractaljs/)

FractalJS is a web application written in Javascript and one of the more friendly, fluid, colorful and spectacular fractal browsers available. Try it! Share it!

### Project statement

* To be a **realtime fractal explorer** working right in the browser.
* To be reasonably complete while remaining dead **simple** to use.
* To be a platform to **share** places and pictures of fractal sets.
* To be a showcase for the power of **javascript** and web technologies.
* To be a simple and welcoming **open source** project.
* To be **compatible** with latest Chrome, Firefox, Safari and IE>11 on the desktop.

### Available Fractals

* [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set)
* [Multibrot 3](https://en.wikipedia.org/wiki/Multibrot_set)
* [Burning Ship](https://en.wikipedia.org/wiki/Burning_Ship_fractal)
* [John Tippetts Mandelbrot](http://paulbourke.net/fractals/tippetts/)
* ...don't be shy, why not adding your own?

# Technical details

### Build system

FractalJS is designed as a no-setup project. You can just download it, open /app/index.html in your browser and start editing the javascript. 
There is an optional build system, based on [Grunt](http://gruntjs.com/), that I use for compilation/minification.

### Technologies

The project is 100% percent Javascript, using the following technologies:
* [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) to draw the nice picture
* [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) and type conversion for image and color buffers manipulation
* [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to split the computations across cores


