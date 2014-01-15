
'use strict';

// Live Reload
var livereloadSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {

  // Load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  //grunt.loadNpmTasks('assemble');

  var path = require('path');

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    watch: {
      options: {
        livereload: true,
        interrupt: true,
      },
      gruntfile: {
        files: 'Gruntfile.js',
        tasks: ['watchcontexthelper:gruntfile'],
        options: {
          nospawn: true,
        },
      },
      sass: {
        files: ['app/sass/{,*/}*.{scss,sass}'],
        tasks: ['watchcontexthelper:sass'],
        options: {
          nospawn: true,
        },
      },
      js: {
        files: ['app/js/**/*.js'],
        tasks: ['watchcontexthelper:js'],
        options: {
          nospawn: true
        },
      },
      img: {
        files: ['app/images/**/*','app/sass/img/**/*'],
        tasks: ['watchcontexthelper:img'],
        options: {
          nospawn: true
        },
      },
      html: {
        files: ['app/*.html','app/hbs/*.hbs','app/hbs/**/*.hbs'],
        tasks: ['watchcontexthelper:html'],
        options: {
          nospawn: true
        },
      },
    },

    connect: {
      options: {
        port: 9090,
        hostname: 'localhost',// change this to '0.0.0.0' to access the server from outside, when using localhost , you can't visit site using ip
        base:'.'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              livereloadSnippet,
              mountFolder(connect, '.')
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },

    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>/dist'
      }
    },

    sass: {
      main: {
        files: {
          'dist/css/main.css': 'app/sass/app/main.scss',
        },
      },
      mainResponsive: {
        files: {
          'dist/css/main-responsive.css': 'app/sass/app/main-responsive.scss',
        },
      },
    },
    useminPrepare: {
      html: 'app/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/styles/{,*/}*.css'],
      options: {
        dirs: ['dist']
      }
    },
    cssmin: {
      minify: {
        options: {},
        expand: true,
        cwd: 'dist/css/',
        src: [ '**/*.css', '!**/*.min.css' ],
        dest: 'dist/css/',
        rename: function(dest, src) {
           return dest + src.substring(0,src.search('.css')) + '.min.css';
        },
      }
    },

    concat: {
      js: {
       src: [
         'app/js/bootstrap/bootstrap-affix.js',
         'app/js/bootstrap/bootstrap-alert.js',
         'app/js/bootstrap/bootstrap-button.js',
         'app/js/bootstrap/bootstrap-carousel.js',
         'app/js/bootstrap/bootstrap-collapse.js',
         'app/js/bootstrap/bootstrap-dropdown.js',
         'app/js/bootstrap/bootstrap-modal.js',
         'app/js/bootstrap/bootstrap-tooltip.js',
         'app/js/bootstrap/bootstrap-popover.js',
         'app/js/bootstrap/bootstrap-scrollspy.js',
         'app/js/bootstrap/bootstrap-tab.js',
         'app/js/bootstrap/bootstrap-transition.js',
         'app/js/bootstrap/bootstrap-typeahead.js',
       ],
       dest: 'dist/js/vendor/bootstrap.js'
      },
    },

    uglify: {
      options: {},
      vendor: {
        files: [
          { expand: true, cwd: 'dist/js/vendor/', src: [ '**/*.js', '!**/*.min.js' ], dest: 'dist/js/vendor/', rename: function(dest, src){
                                                           grunt.log.write(dest +'-----====='+ src+'\n');
                                                           return dest+src.substring(0,src.lastIndexOf('.'))+'.min.js';
                                                           }
                                                           },
        ]
      },
    },

    assemble: {
      // options: {
        // data: 'app/hbs/data/*.{json,yml}',
        // partials: 'app/hbs/partials/**/*.hbs',
      // },
      // development: {
        // options: {
          // production: false
        // },
        // files: [
          // { expand: true, cwd: 'app/hbs/pages/', src: ['**/*.hbs'], dest: 'dist/html/' }
        // ],
      // },
      // production: {
        // options: {
          // production: true
        // },
        // files: [
          // { expand: true, cwd: 'app/hbs/pages/', src: ['**/*.hbs'], dest: 'dist/html/' }
        // ],
      // },
    },

    copy: {
      js: {
        files: [
          { expand: true, cwd: 'app/js/app/', src: '**/*', dest: 'dist/js/app/', filter: 'isFile' },
          { expand: true, cwd: 'app/js/vendor/', src: '**/*', dest: 'dist/js/vendor/', filter: 'isFile' },
        ],
      },
      img: {
        files: [
          { expand: true, cwd: 'app/img/', src: '**/*', dest: 'dist/img/' },
          { expand: true, cwd: 'app/sass/img/', src: '**/*', dest: 'dist/css/img/' }
          // { expand: true, cwd: 'bower_components/bxslider-4/images/', src: '**/*', dest: 'dist/css/img/'},
          // { expand: true, cwd: 'bower_components/select2/', src: ['**/*.jpg','**/*.png','**/*.gif'], dest: 'dist/css/img/'},
        ],
      },
      html: {
        files: [
          { expand: true, cwd: 'app', src: '**/*.html', dest: 'dist' },
        ],
      },
    },

    dom_munger: {
    /*
     * change destination html style and script link to correct path
     */
      updatecss: {
        options: {
          callback: function($){
            $('link').each(function(){
            if($(this).attr('href').search('bower_components') !== -1) {
              var path= $(this).attr('href');
              $(this).attr('href', 'css/vendor' + path.substring(path.lastIndexOf('/')));
              console.log($(this).attr('href'));
              // grunt.task.run('copy:css');
            }
            });
          }
        },
        src: 'dist/index.html'
      },
      updatejs: {
        options: {
          callback: function($){
            $('script').each(function(){
            if($(this).attr('src') && $(this).attr('src').search('bower_components') !== -1) {
              var path= $(this).attr('src');
              $(this).attr('src', 'js/vendor' + path.substring(path.lastIndexOf('/')));
              // grunt.task.run('copy:js');
            }
            });
          }
        },
        src: 'dist/index.html'
      },
      updatecssmin: {
        options: {
          callback: function($){
            $('link').each(function(){
              var path= $(this).attr('href');
              var name = path.substring(path.lastIndexOf('/')+1);
              if($(this).attr('href').search('css/vendor|bower_components') !== -1) {
                if(name.search('min') === -1){
                  $(this).attr('href', 'css/vendor/' + name.substring(0,name.indexOf('\.css')) + '.min.css');
                }
              }else{
                if(name.search('min') === -1){
                  $(this).attr('href', 'css/' + name.substring(0,name.indexOf('\.css')) + '.min.css');
                }
              }
            });
          }
        },
        src: 'dist/index.html'
      },
      updatejsmin: {
        options: {
          callback: function($){
            $('script').each(function(){
            if($(this).attr('src') && $(this).attr('src').search('js/vendor') !== -1) {
              var path= $(this).attr('src');
              var name = path.substring(path.lastIndexOf('/')+1);
              if(name.search('min') === -1){
                $(this).attr('src', 'js/vendor/' + name.substring(0,name.indexOf('\.js')) + '.min.js');
              }
            }
            });
          }
        },
        src: 'dist/index.html'
      }
    },

    clean: {
      dist: [ 'dist' ],
      js: [ 'dist/js' ],
      css: [ 'dist/css' ],
      html: [ 'dist/html' ],
      img: [ 'dist/images', 'dist/css/img' ],
      devjs: [ 'dist/js/**/*.js', '!dist/js/**/*.min.js' ],
      devcss: [ 'dist/css/**/*.css', '!dist/css/**/*.min.css' ],
    }
  });

  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'development',
        'connect:dist:keepalive',
        'open'
      ]);
    }

    if (target === 'production') {
      grunt.watchcontext = 'production';
      return grunt.task.run([
        'production',
        'connect:livereload',
        'open',
        'watch',
      ]);
    }

    grunt.task.run([
      'development',
      'connect:livereload',
      'open',
      'watch',
    ]);
  });


  grunt.registerTask('watchcontexthelper', function (target){
    switch (target) {
      case 'gruntfile':
        console.log('Spawning a child process for complete rebuild...');
        var child;

        var showDone = function(){
          console.log('Done');
        }

        if (grunt.watchcontext === 'production') {
          child = grunt.util.spawn({ grunt: true, args: ['production'] }, showDone);
        } else {
          child = grunt.util.spawn({ grunt: true, args: ['development'] }, showDone);
        }
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        break;
      case 'js':
        (grunt.watchcontext === 'production') ?
        grunt.task.run(['clean:js', 'copy:js', 'concat', 'uglify', 'clean:devjs']) :
        grunt.task.run(['clean:js', 'copy:js', 'concat']);
        break;
      case 'img':
        (grunt.watchcontext === 'production') ?
        grunt.task.run(['clean:img', 'copy:img']) :
        grunt.task.run(['clean:img', 'copy:img']);
        break;
      case 'html':
        (grunt.watchcontext === 'production') ?
        // grunt.task.run(['clean:html', 'copy:html', 'assemble:production']) :
        grunt.task.run(['useminPrepare','clean:html', 'copy:html','usemin']) :
        // grunt.task.run(['clean:html', 'copy:html', 'assemble:development']);
        grunt.task.run(['clean:html','copy:html','copy:img']);
        break;
      case 'sass':
        (grunt.watchcontext === 'production') ?
        grunt.task.run(['clean:css', 'sass', 'cssmin', 'clean:devcss']) :
        grunt.task.run(['clean:css', 'sass','copy:img']);
        break;
    }
  });

  grunt.registerTask('production', [
    'clean:dist',
    'useminPrepare',
    'concat',
    'sass',
    'cssmin',
    'clean:devcss',
    'copy:img',
    'copy:js',
    'uglify',
    'clean:devjs',
    'copy:html',
    //'assemble:production'
    'usemin',
    //'dom_munger:updatecssmin',
    //'dom_munger:updatejsmin'
  ]);

  grunt.registerTask('development', [
    'clean:dist',
    'useminPrepare',
    'concat',
    'sass',
    'copy:img',
    'copy:js',
    'copy:html',
    //'assemble:development'
    // 'usemin'
    //'dom_munger:updatecss',
    //'dom_munger:updatejs'
  ]);

  grunt.registerTask('dev', [
    'development'
  ]);

  grunt.registerTask('default', [
    'production'
  ]);

};
