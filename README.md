# FractalJS

FractalJS is a realtime fractal exporer.

It lets you explore different fractal sets with different color palettes, and share your best discoveries with others. It is a progressive web app running on all your devices. The rendering, which is computationally intensive, is entirely done in multi-threaded Javascript (hence JS in the name).

### Click here to [Start FractalJS](http://solendil.github.io/fractaljs/)
![Start FractalJS](/public/screen.png?raw=true "FractalJS")

## Available Fractals

* [Mandelbrot set](https://en.wikipedia.org/wiki/Mandelbrot_set)
* [Multibrot 3 & 4](https://en.wikipedia.org/wiki/Multibrot_set)
* [Burning Ship](https://en.wikipedia.org/wiki/Burning_Ship_fractal)
* [Burning Bird](http://v.rentalserver.jp/morigon.jp/Repository/SUBI0/SUBI_BurningBird2_e.html)
* [John Tippetts Mandelbrot](http://paulbourke.net/fractals/tippetts/)

## History

This is the third iteration of FractalJS
* [V1](https://solendil.github.io/fractaljs-v1) (June 2015) used Grunt and jQuery
* [V2](https://solendil.github.io/fractaljs-v2) (April 2017) moved to Webpack and Vue.js, and a Material interface
* [V3](https://solendil.github.io/fractaljs) (April 2020) is a mobile-first PWA application, using React and Typescript

# Technical

## Technologies

* The UX is written with [React](https://reactjs.org/) and [Redux](https://redux-toolkit.js.org/), project is set up using [create-react-app](https://create-react-app.dev/)
* Widgets and mobile capabilities are provided by [Material UI](https://material-ui.com/)
* Touch interface works thanks to [Hammer.js](https://hammerjs.github.io/)
* Both UX and Engine are written in [Typescript](https://www.typescriptlang.org/)
* Fractal are drawn on a [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), using mere Javascript code, multi-threaded with [web workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
* ...plus lots of code, and lots of :heart:

## Project Setup

```
$ git clone https://github.com/solendil/FractalJS.git
$ cd FractalJS
$ npm install
$ npm run start
```

## Contribute

Do you want to implement a new fractal set in FractalJS? It couldn't be easier. After the project is set up, just head to `/src/engine/fractals/` copy `example.ts` and write your own fractal function.


