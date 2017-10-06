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
    build: {
        html: "dist/",
        js: "dist/js/",
        css: "dist/css/",
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
    clean: "./dist"
};


// ///////////////////////////////////////////////////
// Webserver config
// ///////////////////////////////////////////////////
var config = {
    server: "dist/",
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


gulp.task("html:build", function () {
    return gulp.src(path.src.html)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("css:build", function () {
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
        .pipe(gulp.dest(path.build.css))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("js:build", function () {
    gulp.src(path.src.js)
        .pipe(plumber())
        .pipe(rigger())
        .pipe(uglify())
        .pipe(removeComments())
        .pipe(rename("all.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(path.build.js))
        .pipe(webserver.reload({stream: true}));
});


gulp.task("fonts:build", function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
});


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


gulp.task("clean", function (cb) {
    rimraf(path.clean, cb);
});


gulp.task('build', function (cb) {
    run(
        "clean",
        "html:build",
        "css:build",
        "js:build",
        "fonts:build",
        "image:build"
    , cb);
});


gulp.task("watch", function() {
    watch([path.watch.html], function(event, cb) {
        gulp.start("html:build");
    });
    watch([path.watch.css], function(event, cb) {
        gulp.start("css:build");
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start("js:build");
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start("image:build");
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start("fonts:build");
    });
});


gulp.task("default", function (cb) {
   run(
       "clean",
       "jquery",
       "build",
       "webserver",
       "watch"
   , cb);
});