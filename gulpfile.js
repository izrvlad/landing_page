const gulp = require('gulp');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const sourceMaps = require('gulp-sourcemaps');
const imagemin = require("gulp-imagemin");
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const run = require("run-sequence");
const del = require("del");
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

gulp.task('sass',function (done) {
        return gulp.src('scss/style.scss')
            .pipe(plumber())
            .pipe(sass())
            .pipe(sourceMaps.init())
            .pipe(autoprefixer({
                overrideBrowserslist:  ['last 2 versions'],
                cascade: false
            }))
            .pipe(sourceMaps.write())
            .pipe(gulp.dest('build/css'))
            .pipe(browserSync.reload({stream:true}));
        done()
});
gulp.task('html',function (done) {
    return gulp.src('*.html')
        .pipe(gulp.dest('build'))
        .pipe(browserSync.reload({stream:true}));
    done()
});

gulp.task('css',function (done) {
    return gulp.src('css/**/*.css')
        .pipe(gulp.dest('build/css'))
        .pipe(browserSync.reload({stream:true}));
    done()
});
gulp.task('js',function (done) {
    return gulp.src('js/**/*.js')
        .pipe(gulp.dest('build/js'))
        .pipe(browserSync.reload({stream:true}));
    done()
});
gulp.task('allimg',function (done) {
    return gulp.src('img/**/*.{png,jpg}')
        .pipe(gulp.dest('build/img'))
        .pipe(browserSync.reload({stream:true}));
    done()
});
gulp.task('images', function (done) {
    return gulp.src('build/img/**/*.${png,jpg}')
        .pipe(imagemin([
            imagemin.mozjpeg({progressive: true}),
            imageminJpegRecompress({
                loops: 5,
                min: 65,
                max: 70,
                quality: 0.5
            }),
            imagemin.optipng({optimizationLevel: 3}),
            pngquant({quality: '65-70', speed: 5})
        ]))
        .pipe(gulp.dest('build/img'));
         done()
});
gulp.task('svg', function (done) {
    return gulp.src('img/**/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('build/img'));
    done()
});

gulp.task('serve', function (done) {
    browserSync.init({
        server: "build"
    });

    gulp.watch("scss/**/*.scss", gulp.series('sass'));
    gulp.watch("*.html", gulp.series('html'));
    gulp.watch("js/**/*.js", gulp.series('js'));
    gulp.watch("css/**/*.css", gulp.series('css'));
    gulp.watch("img/**/*.{png,jpg}", gulp.series('allimg'));
    gulp.watch("img/**/*.{svg}", gulp.series('svg'));
    done()
});

gulp.task('copy', function (done) {
    return gulp.src([
        'img/**',
        'js/**',
        'css/**',
        '*.html'
    ], {
        base: '.'
    })
        .pipe(gulp.dest('build'));
        done()

});

gulp.task('clean', function (done) {
    return del('build');
    done()
});

gulp.task('build',gulp.series('clean','copy','sass','images','svg'));




