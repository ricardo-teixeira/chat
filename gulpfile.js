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
	gulp.src(['src/**/*.js'])
		.pipe(plumber())
		.pipe(concat('chat.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js/'));
});

// Styles Task
// gulp.task('styles', function () {
// 	return gulp.src(['src/**/*.css', '!src/**/style.css'])
// 		.pipe(cssmin())
// 		.pipe(concat('emoji.min.css'))
// 		.pipe(gulp.dest('dist/css'));
// });

gulp.task('styles', function(){
    sass('src/**/*.sass')
        .on('error', sass.logError)
        .pipe(cssmin())
		.pipe(concat('chat.min.css'))
        .pipe(gulp.dest('dist/css'));
	}
);

// gulp.task('styles', function () {
//   return gulp.src('src/**/*.sass')
//     .pipe(sass().on('error', sass.logError))
//     .pipe(cssmin())
// 	.pipe(concat('chat.min.css'))
//     .pipe(gulp.dest('dist/css'));
// });

//  Watch Task
//  Watches JS
gulp.task('watch', function(){
	gulp.watch('src/**/*.js', ['scripts']);
	gulp.watch('src/**/*.css', ['styles']);
	gulp.watch('src/**/*.sass', ['styles']);
});

gulp.task('default', ['scripts', 'styles', 'watch']);