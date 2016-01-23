/* File: gulpfile.js */

// grab our packages
var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    glob = require('glob'),
    del = require('del');

var buildConfig = {
    vendorFilesBase: './client/vendor/**/',
    vendorFiles: [
        '/jquery/dist/jquery.js',
        '/angular/angular.js',
        '/angular-animate/angular-animate.js',
        '/angular-aria/angular-aria.js',
        //the order matter here these have to be after the first ones
        '/angular-material/angular-material.js',
        '/angular-socket-io/socket.js',
        '/angular-ui-router/release/angular-ui-router.js'
    ],

    vendorStyles: [
        '/angular-material/angular-material.min.css'
    ],

    initialAppFiles : ['src/app-modules.js'],

    applicaitonBasePath:'./client/',
    applicationFiles: 'src/**/*.js',

    generatedApplicationFiles: [
        'src/app-templates.js'
    ],

    applicationStyles: [
        'src/styles/main.css'
    ]
};

// define the default task and add the watch task to it
gulp.task('default', ['build']);

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
    return del([
        './public/'
        // if we don't want to clean any file we can use negate pattern
        //'!dist/mobile/deploy.json'
    ], callback);
});

gulp.task('index', ['build:copy', 'angular-templatecache', 'clean'], function () {

    var vendorFilesInHtml = buildConfig.vendorFiles.map(function (vendorFile) {
        return 'vendor' + vendorFile;
    });

    var vendorStylesInHtml = buildConfig.vendorStyles.map(function (vendorFile) {
        return 'vendor' + vendorFile;
    });

    var expandedArrayOfFiles = glob.sync(buildConfig.applicationFiles, {
        cwd: buildConfig.applicaitonBasePath,
        ignore: buildConfig.initialAppFiles
    });

    Array.prototype.push.apply(expandedArrayOfFiles, buildConfig.generatedApplicationFiles);

    return gulp.src('./client/index-base.html')
        // add templates path
        .pipe($.htmlReplace({
            'vendorFiles': vendorFilesInHtml,
            'vendorStyles': vendorStylesInHtml,
            'applicationInitials': buildConfig.initialAppFiles,
            'applicationFiles': expandedArrayOfFiles,
            'applicaitonStyles': buildConfig.applicationStyles
        }))
        .pipe($.rename('index.html'))
        .pipe(gulp.dest('./public/'));
});

gulp.task('build:compile-scss', function () {

});

gulp.task('angular-templatecache', ['clean'], function () {
    return gulp.src('client/**/*_template.html')
        .pipe($.angularTemplatecache('app-templates.js'))
        .pipe(gulp.dest('public/src'));
});

gulp.task('build:copy', ['clean'],function () {
    gulp.src(['./client/src/**/*.js', ])
        .pipe($.ngAnnotate())
        .pipe(gulp.dest('./public/src/'));

    gulp.src(['./client/src/**/*.css'])
        .pipe(gulp.dest('./public/src/'));


    var vendorFiles = buildConfig.vendorFiles.map(function (vendorFile) {
        return buildConfig.vendorFilesBase + vendorFile;
    });

    var vendorStyles = buildConfig.vendorStyles.map(function (vendorFile) {
        return buildConfig.vendorFilesBase + vendorFile;
    });

    gulp.src(vendorFiles)
        .pipe(gulp.dest('./public/vendor/'));

    return gulp.src(vendorStyles)
        .pipe(gulp.dest('./public/vendor/'));
});

gulp.task('build', ['clean', 'build:copy', 'index', 'angular-templatecache']);
//gulp.task('build', ['clean', 'build:copy', 'build:compile-scss', 'angular-templates-cache', 'index']);
//gulp.task('compile', ['clean', 'compile-scss', 'angular-templates-cache', 'index']);

