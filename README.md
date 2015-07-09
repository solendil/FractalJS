# FractalJS

[![](static/button.png)](http://solendil.github.io/fractaljs/)

FractalJS is a web application written in Javascript, and one of the more friendly, fluid, colorful and spectacular fractal browsers available. Try it! Share it!

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

### How to setup

In order to setup the FractalJS project at home, it is advised to use [Bower](http://bower.io/) :  ```bower install```. Alternatively, you can also install all dependencies (listed in ```bower.json```) by hand in ```app/libs```...

[Grunt](http://gruntjs.com/) is optionally used to compile, minify and distribute the project. Its usage is optional as the project is designed to run uncompiled directly from the ```src``` directory.


### Technologies

The project is 100% percent Javascript, using the following technologies:
* [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) to draw the nice picture
* [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) and type conversion for image and color buffers manipulation
* [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to split the computations across cores
* more to come...






