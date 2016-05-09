var gulp         = require('gulp'),
  plumber        = require('gulp-plumber'),
  browserSync    = require('browser-sync'),
  stylus         = require('gulp-stylus'),
  uglify         = require('gulp-uglify'),
  concat         = require('gulp-concat'),
  prefixer       = require('autoprefixer-stylus'),
  imagemin       = require('gulp-imagemin'),
  cp             = require('child_process'),

  poststylus     = require('poststylus'),
  sourcemaps     = require('gulp-sourcemaps'),
  autoprefixer   = require('autoprefixer'),
  lost           = require('lost');

var messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
  browserSync.notify(messages.jekyllBuild);
  return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
    .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
  browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['jekyll-build'], function() {
  browserSync({
    server: {
      baseDir: '_site'
    }
  });
});

/**
 * Stylus task
 */
gulp.task('stylus', function(){
  gulp.src('src/styl/main.styl')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(stylus({
      use: [
        poststylus(['lost', 'autoprefixer', 'rucksack-css'])
      ]
    }))
    .pipe(gulp.dest('_site/assets/css/'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('assets/css'))
});

/**
 * Javascript Task
 */
gulp.task('js', function(){
  return gulp.src('src/js/**/*.js')
    .pipe(plumber())
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js/'))
});

/**
 * Imagemin Task
 */
gulp.task('imagemin', function() {
  return gulp.src('src/img/**/*.{jpg,png,gif}')
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
    .pipe(gulp.dest('assets/img/'));
});

/**
 * Watch stylus files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
  gulp.watch('src/styl/**/*.styl', ['stylus']);
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/img/**/*.{jpg,png,gif}', ['imagemin']);
  gulp.watch(['*.html', '_includes/*.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['js', 'stylus', 'browser-sync', 'watch']);
