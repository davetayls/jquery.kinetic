/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= pkg.license %> */'
    },
    lint: {
      files: ['grunt.js', 'jquery.kinetic.js']
    },
    server: {
      port: 9999,
      base: '.'
    },
    qunit: {
      files: ['test/specs/**/*.html']
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', 'jquery.kinetic.js'],
        dest: 'jquery.kinetic.min.js'
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },
    uglify: {},
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
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-vows');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-string-replace');

  // Default task.
  grunt.registerTask('default', 'lint server qunit');
  grunt.registerTask('selenium', 'vows:local');
  grunt.registerTask('sauce', 'vows:sauce');
  grunt.registerTask('minor', 'bump:minor');
  grunt.registerTask('patch', 'bump');
  grunt.registerTask('release', 'default string-replace:version min');

};
