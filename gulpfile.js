"use strict";

var gulp           = require("gulp"),
    autoprefixer   = require("gulp-autoprefixer"),
    removeComments = require('gulp-strip-css-comments'),
    rename         = require("gulp-rename"),
    sass           = require("gulp-sass"),
    cssnano        = require("gulp-cssnano"),
    rigger         = require("gulp-rigger"),
    uglify         = require("gulp-uglify"),
    watch          = require("gulp-watch"),
    plumber        = require("gulp-plumber"),
    imagemin       = require("gulp-imagemin"),
    run            = require("run-sequence"),
    rimraf         = require("rimraf"),
    jquery         = require('gulp-jquery'),
    webserver      = require("browser-sync");


// ///////////////////////////////////////////////////
// Paths to app/dist/watch files
// ///////////////////////////////////////////////////
var path = {
    dev: {
        js: "app/src/js/",
        css: "app/src/css/",
    },
    build: {
        html: "dist/",
        js: "dist/src/js/",
        css: "dist/src/css/",
        img: "dist/images/",
        fonts: "dist/fonts/"
    },
    src: {
        html: "app/*.{htm,html}",
        js: "app/js/all.js",
        css: "app/sass/style.scss",
        img: "app/images/**/*.*",
        fonts: "app/fonts/**/*.*"
    },
    watch: {
        html: "app/**/*.{htm,html}",
        js: "app/js/**/*.js",
        css: "app/sass/**/*.scss",
        img: "app/images/**/*.*",
        fonts: "app/fonts/**/*.*"
    },
    clean: {
        dist: "dist",
        dev: "app/src"
    }
};


// ///////////////////////////////////////////////////
// Webserver config
// ///////////////////////////////////////////////////
var config = {
    server: "app/",
    notify: false,
    open: true,
    ui: false
};


// ///////////////////////////////////////////////////
// Tasks
// ///////////////////////////////////////////////////
gulp.task("webserver", function () {
    webserver(config);
});


gulp.task('jquery', function () {
    return jquery.src({
        release: 2, //jQuery 2 
    })
    .pipe(gulp.dest('app/js/includes'));
    // creates app/js/includes/jquery.custom.js 
});


// Html task
gulp.task("html:dev", function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(webserver.reload({stream: true}));
});
gulp.task("html:build", function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html));
});


// Sass task
gulp.task("css:dev", function () {
    gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError ))
        .pipe(autoprefixer({
            browsers: ["last 5 versions"],
            cascade: true
        }))
        .pipe(removeComments())
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(rename("style.min.css"))
        .pipe(gulp.dest(path.dev.css))
        .pipe(webserver.reload({stream: true}));
});

gulp.task("css:build", function () {
    gulp.src(path.dev.css+'style.min.css')
        .pipe(gulp.dest(path.build.css));
});


// Js task
gulp.task("js:dev", function () {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("all.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(path.dev.js))
        .pipe(webserver.reload({stream: true}));
});

gulp.task("js:build", function () {
    gulp.src(path.dev.js+'all.min.js')
        .pipe(gulp.dest(path.build.js));
});


// Fonts task
gulp.task("fonts:build", function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


// Images task
gulp.task("image:build", function () {
    gulp.src(path.src.img)
        .pipe(imagemin({
            optimizationLevel: 3,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img));
});


// Clean tasks
gulp.task("clean_dist", function (cb) {
    rimraf(path.clean.dist, cb);
});
gulp.task("clean_dev", function (cb) {
    rimraf(path.clean.dev, cb);
});


// Build task
gulp.task('build', function (cb) {
    run(
        "clean_dist",
        "html:build",
        "css:build",
        "js:build",
        "fonts:build",
        "image:build"
    , cb);
});


gulp.task("watch", function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start("html:dev");
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start("css:dev");
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start("js:dev");
    });
});


gulp.task("default", function (cb) {
   run(
       "jquery",
       "clean_dev",
       "html:dev",
       "css:dev",
       "js:dev",       
       "webserver",
       "watch"
   , cb);
});