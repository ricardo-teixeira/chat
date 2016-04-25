// Modules: gulp install gulp gulp-uglify gulp-ruby-sass gulp-rename gulp-concat gulp-cssmin gulp-plumber --save-dev
var gulp = require('gulp'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-ruby-sass'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	cssmin = require('gulp-cssmin'),
	plumber = require('gulp-plumber');

// Scripts Task
gulp.task('scripts', function(){
	gulp.src(['src/script/chat.mdl.js', 'src/script/chat.drv.js', 'src/script/chat.fct.js'])
		.pipe(plumber())
		.pipe(uglify())
		.pipe(concat('chat.min.js'))
		.pipe(gulp.dest('dist/js/'));
});

// Styles Task
gulp.task('styles', function(){
    sass('src/**/*.sass')
        .on('error', sass.logError)
        .pipe(cssmin())
		.pipe(concat('chat.min.css'))
        .pipe(gulp.dest('dist/css'));
	}
);

//  Watch Task
gulp.task('watch', function(){
	gulp.watch('src/**/*.js', ['scripts']);
	gulp.watch('src/**/*.css', ['styles']);
	gulp.watch('src/**/*.sass', ['styles']);
});

gulp.task('default', ['scripts', 'styles', 'watch']);