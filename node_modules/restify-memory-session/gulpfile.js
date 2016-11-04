var gulp = require('gulp'),
	chalk = require('chalk'),
	mocha = require('gulp-mocha'),
	jshint = require('gulp-jshint');

var paths = {
	'src': ['./index.js', './lib/**/*.js'],
	'tests': ['./test/**/*.js']
};

var handleError = function(err){
	console.log(chalk.red(err.name + ': ' + err.plugin + ' - ' + err.message));
	return;
};

gulp.task('lint', function(){
	return gulp.src(paths.src)
		.pipe(jshint())
		.pipe(jshint.reporter('default'));
});

gulp.task('test', function(){
	return gulp.src(paths.tests)
		.pipe(mocha({
			reporter: 'dot'
		}))
		.on('error', handleError);
});

gulp.task('default', ['lint', 'test']);