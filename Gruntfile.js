module.exports = function(grunt) {

  var _ = require('lodash');
  
  var buildConfig = function (profile) {
    var conf1 = './config/config.json';
    var conf2 = './config/config.' + profile + '.json';
    if (!grunt.file.exists(conf2)) {
      grunt.fail.warn('File ' + conf2 + ' doesn\'t exist.');
    }

    return _.merge(
      grunt.file.readJSON(conf1),
      grunt.file.readJSON(conf2)
    );
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    //Compile customized bootstrap stylesheet
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          "public/css/bootstrap-custom.css": "less/bootstrap-custom.less" // destination file and source file
        }
      }
    },

    ngconstant: {
      options: {
        space: '  ',
        wrap: '"use strict";\n\n {%= __ngModule %}',
        name: 'config',
        dest: 'public/scripts/logic/config.js'
      },
      "production": {
        constants: {ENV: buildConfig('production')}
      },
      // Environment targets
      "development": {
        constants: {ENV: buildConfig('development')}
      }
    },

    //Minify bootstrap and ezdmp.css into single file
    cssmin: {
        options: {
            banner: '/*\n <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> \n*/\n'
        },
        build: {
            files: {
                'public/css/ezdmp.min.css' : ['public/css/bootstrap-custom.css','bower_components/angular-toastr/dist/angular-toastr.css']
            }
        }
    },
    //Run bower install after npm install to update/install all front-end components
    "bower-install-simple" : {
        options: {
            forceLatest: true,
        },
        "prod": {
            options: {
                production: true
            }
        },
        "dev": {
            options: {
                production: false
            }
        }
    },
    copy : {
        main: {
            files: [
                //Copy jQuery to vendor directory
                {expand: true, cwd:'bower_components/jquery/dist/',src: ['jquery.min.js'], dest: 'public/scripts/vendor/'},
//                {expand: true, cwd:'bower_components/moment/min/',src: ['moment.min.js'], dest: 'public/scripts/vendor/'},
                //Copy bootstrap fonts to vendor directory
                {expand: true, cwd:'bower_components/bootstrap/fonts/',src: ['**'], dest: 'public/fonts/'}
                //{expand: true, cwd:'bower_components/bootstrap/dist/js/', src: ['bootstrap.min.js'], dest: 'public/scripts/vendor/'}
            ]
        }
    },
    concat: {
      //Concatenate all angular components into a single include in vendor directory
      angular: {
        files: {
          'public/scripts/vendor/angular-all.min.js': [
              'bower_components/angular/angular.min.js',
              'bower_components/angular-animate/angular-animate.min.js',
              'bower_components/angular-cookies/angular-cookies.min.js',
              'bower_components/angular-loader/angular-loader.min.js',
              'bower_components/angular-messages/angular-messages.min.js',
              'bower_components/angular-resource/angular-resource.min.js',
              'bower_components/angular-route/angular-route.min.js',
              'bower_components/angular-sanitize/angular-sanitize.min.js',
              'bower_components/angular-toastr/dist/angular-toastr.tpls.min.js',
              'bower_components/satellizer/dist/satellizer.min.js',
              'bower_components/angular-modal-service/dst/angular-modal-service.min.js'
          ]
        }
      },
      bootstrap: {
        files: {
          'public/scripts/vendor/bootstrap-all.min.js' : [
              'bower_components/bootstrap/dist/js/bootstrap.min.js'
          ]
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks("grunt-bower-install-simple");
  grunt.loadNpmTasks("grunt-ng-constant");

  grunt.registerTask('default', [
    'bower-install-simple:dev',
    'ngconstant:development',
    'copy:main',
    'concat',
    'less:development',
    'cssmin'
  ]);
  grunt.registerTask("myLess", ['less:development']);
  grunt.registerTask("bower-install", [ "bower-install-simple" ]);
};
