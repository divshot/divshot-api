module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    browserify: {
      standalone: {
        files: {
          'dist/divshot.js': ['lib/Divshot.js'],
        },
        options: {
          standalone: 'Divshot'
        }
      },
      angular: {
        files: {
          'dist/divshot.angular.js': ['lib/browser/divshot_angular.js'],
        },
        options: {
          ignore: ['promise', 'request']
        }
      }
    },
    
    uglify: {
      standalone: {
        src: 'dist/divshot.js',
        dest: 'dist/divshot.min.js'
      },
      angular: {
        src: 'dist/divshot.angular.js',
        dest: 'dist/divshot.angular.min.js'
      }
    },
    
    watch: {
      build: {
        files: 'lib/**/*.js',
        tasks: ['build']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('build', ['browserify', 'uglify']);
};