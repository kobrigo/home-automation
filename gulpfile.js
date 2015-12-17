/* File: gulpfile.js */

// grab our packages
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    del = require('del');

var buildConfig = {
    vendorFilesBase:'./client/**/',
    vendorFiles: [
        'vendor/angular/angular.js',
        'vendor/angular-animate/angular-animate.js',
        'vendor/angular-aria/angular-aria.js',
        //the order matter here these have to be after the first ones
        'vendor/angular-material/angular-material.js',
        'vendor/angular-socket-io/socket.js'
    ]
};

// define the default task and add the watch task to it
gulp.task('default', ['watch']);

// configure the jshint task
gulp.task('jshint', function () {
    return gulp.src(['public/src/**/*.js', 'server/**/*.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function () {
    gulp.watch('client/src/**/*.js', ['jshint']);
    gulp.watch('server/**/*.js', ['jshint']);
});

gulp.task('clean', function (callback) {
    del([
        './public/'
        // if we don't want to clean any file we can use negate pattern
        //'!dist/mobile/deploy.json'
    ], callback);
});

gulp.task('index', function () {
    return gulp.src('./client/index-base.html')
        // add templates path
        .pipe($.htmlReplace({
            'vendorFiles': buildConfig.vendorFiles
        }))
        .pipe($.rename('index.html'))
        .pipe(gulp.dest('./public/'));
});

gulp.task('build:compile-scss', function () {

});

gulp.task('angular-templates-cache', function () {
    return gulp.src('server/**/*-template.html')
        .pipe(templateCache())
        .pipe(gulp.dest('public'));
});


gulp.task('build:copy', function () {
    gulp.src(['./client/src/**/*.js'])
        .pipe(gulp.dest('./public/src/'));

    var vendorFiles = buildConfig.vendorFiles.map(function (vendorFile) {
        return buildConfig.vendorFilesBase + vendorFile;
    });

    gulp.src(vendorFiles)
        .pipe(gulp.dest('./public/'));
});

gulp.task('build', ['clean', 'build:copy','build:compile-scss', 'angular-templates-cache', 'index']);
//gulp.task('compile', ['clean', 'compile-scss', 'angular-templates-cache', 'index']);

