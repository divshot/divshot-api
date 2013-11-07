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
      }
    },
    
    uglify: {
      standalone: {
        src: 'dist/divshot.js',
        dest: 'dist/divshot.min.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('build', ['browserify', 'uglify']);
};