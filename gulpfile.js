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
	// Minify
	gulp.src(['src/script/chat.mdl.js', 'src/script/chat.drv.js', 'src/script/chat.fct.js'])
		.pipe(plumber())
		.pipe(uglify())
		.pipe(concat('chat.min.js'))
		.pipe(gulp.dest('dist/js/'));
});

// Styles Task
gulp.task('styles', function(){
	// Minify
    sass(['src/**/*.sass', '!src/stylesheet/theme.sass'])
        .on('error', sass.logError)
        .pipe(cssmin())
		.pipe(concat('chat.min.css'))
        .pipe(gulp.dest('dist/css'));
	}
);

// Generate theme
gulp.task('theme', function(){
    sass('src/stylesheet/theme.sass')
        .on('error', sass.logError)
		.pipe(concat('theme.css'))
        .pipe(gulp.dest('dist/css'));
	}
);

// Uncompressed
gulp.task('compile', function(){
	gulp.src(['src/script/chat.mdl.js', 'src/script/chat.drv.js', 'src/script/chat.fct.js'])
		.pipe(concat('chat.js'))
		.pipe(gulp.dest('src/script'));

    sass('src/stylesheet/chat-app.sass')
        .on('error', sass.logError)
		.pipe(concat('chat.css'))
        .pipe(gulp.dest('src/stylesheet'));
	}
);

//  Watch Task
gulp.task('watch', function(){
	gulp.watch('src/**/*.js', ['scripts']);
	gulp.watch(['src/**/*.sass', 'src/**/*.css'], ['styles', 'theme']);
	gulp.watch(['src/**/*.js', 'src/**/*.sass'], ['compile']);
});

gulp.task('default', ['scripts', 'styles', 'compile', 'theme', 'watch']);