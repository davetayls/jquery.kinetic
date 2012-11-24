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
    qunit: {
      files: ['test/**/*.html']
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
        all: {
            // String or array of strings
            // determining which files to include
            files: ["test/tests.vows.js"],
            // String {spec|json|dot-matrix|xunit|tap}
            // defaults to "dot-matrix"
            reporter: "spec"
        }
    }
  });

  // Load tasks
  grunt.loadNpmTasks('grunt-vows');

  // Default task.
  grunt.registerTask('default', 'lint vows min');

};
