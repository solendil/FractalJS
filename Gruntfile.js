module.exports = function (grunt) {
"use strict";

require('time-grunt')(grunt);

grunt.initConfig({

connect: {
  app: {
    options: {
      port: 9000,
      base: 'app',
      open: true, // open a browser
      livereload: true, // inject live reloading script
    }
  },
},

watch: {
  scripts: {
    files: 'app/**/*.*',
    options: {
      livereload: true,
    },
  },
},

// define a variable that will be used by the preprocessor to conditionally replace HTML parts
env : {
  dist: {
    NODE_ENV : 'PRODUCTION'
  }
},

jshint: {
  options: {
    jshintrc: '.jshintrc',
    reporter: require('jshint-stylish')
  },
  all: [
    'app/scripts/*.js',
  ]
},

clean: {
  options: { force: true },
  dist: ['dist/*'],
  web: ['../solendil.github.io/fractaljs/*']
},

concat: {
  options: {
    separator: ';',
  }, 
  dist: {
    src: [
      'app/scripts/util.js',
      'app/scripts/events.js',
      'app/scripts/engine-worker.js',
      'app/scripts/colormap.js',
      'app/scripts/renderer.js',
      'app/scripts/controller.js',
      'app/scripts/colormapbuilder.js',
      'app/scripts/fractal.js',
    ],
    dest: 'dist/scripts/fractal.js',
  },
},

uglify: {
  dist: {
    files: {
     'dist/scripts/fractal.min.js':['dist/scripts/fractal.js']
    }
  }
},

// copy HTML files while applying preprocessing
preprocess : {
  dist: {
    src : '*.html',
    ext: '.html',
    cwd: 'app',
    dest : 'dist',
    expand: true
  }
},

copy: {
  dist: {
    files: [
    {expand: true,cwd: 'app/css',src: '**',dest: 'dist/css/',},
    {expand: true,cwd: 'app/libs',src: '**',dest: 'dist/libs/',},
    {expand: true,cwd: 'app/scripts',src: 'fractal-ui.js',dest: 'dist/scripts/',},
    ]
  },
  web: {
    expand: true,
    cwd: 'dist/',
    src: '**',
    dest: '../solendil.github.io/fractaljs/',
  },
},

});

grunt.loadNpmTasks('grunt-env');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-preprocess');

grunt.registerTask('serve', [
    'connect:app',
    'watch',
  ]);

grunt.registerTask('build', [
    'jshint',
    'env',
    'clean:dist',
    'concat',
    'uglify',
    'preprocess',
    'copy:dist',
    'clean:web',
    'copy:web',
  ]);

};
