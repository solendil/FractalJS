'use strict';

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    config: {},

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['app/scripts/*.js'],
        tasks: ['jshint'],
        options: {
          livereload: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          'app/*.html',
          'app/css/*.css',
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static('app')
            ];
          }
        }
      },
      dist: {
        options: {
          base: 'dist',
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            'dist/*',
            '!dist/.git*'
          ]
        }]
      },
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'app/scripts/*.js',
        '!app/scripts/lib/*',
      ]
    },

    requirejs: {
      compile: {
        options: {
          baseUrl: "app/scripts",
          mainConfigFile: "app/scripts/config.js",
          name: "fractal",
          out: "dist/build/out.fractal.js",
          optimize: "uglify",
        },      
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'app',
          dest: 'dist',
          src: [
            '{,**/}*.{html,js,css}',
          ]
        }]
      },
    },

    // Run some tasks in parallel to speed up build process
  });


  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'connect:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'copy:dist',
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
