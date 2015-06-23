/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower: grunt.file.readJSON('bower.json'),
    server: {
      port: 8989,
      base: '.'
    },
    qunit: {
      all: ['test/specs/**/*.html']
    },
    uglify: {
      dist: {
        files: {
          'jquery.kinetic.min.js': ['jquery.kinetic.js']
        },
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %> <%= pkg.homepage %> ' +
            '\n * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= pkg.license %> */\n'
        }
      }
    },
    watch: {
      all: {
        files: [
          'jquery.kinetic.js',
          'test/specs/*.js'
        ],
        tasks: ['jshint', 'qunit']
      }
    },
    jshint: {
      files: ['grunt.js', 'jquery.kinetic.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    vows: {
        local: {
            files: ["test/local.vows.js"],
            // String {spec|json|dot-matrix|xunit|tap}
            // defaults to "dot-matrix"
            reporter: "spec"
        },
        sauce: {
            files: ["test/sauce.vows.js"],
            // String {spec|json|dot-matrix|xunit|tap}
            // defaults to "dot-matrix"
            reporter: "spec"
        }
    },
    "string-replace": {
      version: {
        files: {
          "jquery.kinetic.js": "jquery.kinetic.js"
        },
        options: {
          replacements: [{
            pattern: /jQuery\.kinetic v\d\.\d\.\d/g,
            replacement: "jQuery.kinetic v<%= pkg.version %>"
          }]
        }
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: ['pkg', 'bower'],
        push: false,
        tagName: '%VERSION%',
        commitFiles: ['.']
      }
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-vows');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-string-replace');

  // Default task.
  grunt.registerTask('default', ['jshint', 'qunit']);
  //grunt.registerTask('selenium', ['vows:local']); not used any more
  grunt.registerTask('sauce', ['vows:sauce']);
  grunt.registerTask('release', function(release) {
    release = release || 'patch';
    grunt.task.run([
      'bump-only:' + release,
      'default',
      'string-replace:version',
      'uglify',
      'bump-commit'
    ]);
  });

};
