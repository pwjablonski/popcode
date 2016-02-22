/* eslint-env node */
import gulp from 'gulp';
import concat from 'gulp-concat';
import browserify from 'browserify';
import browserifyInc from 'browserify-incremental';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import cssnano from 'gulp-cssnano';
import gutil from 'gulp-util';
import memoize from 'lodash/memoize';
import brfs from 'brfs-babel';
import babelify from 'babelify';
import envify from 'envify';

const browserSync = require('browser-sync').create();
const srcDir = 'src';
const baseDir = 'static';
const distDir = `${baseDir}/compiled`;
const stylesheetsDir = `${srcDir}/css`;

let browserifyImpl;
if (gulp.env.production) {
  browserifyImpl = browserify;
} else {
  browserifyImpl = browserifyInc;
}

let browserifyDone = Promise.resolve();

const browserifyOpts = {
  extensions: ['.jsx'],
  debug: true,
  fullPaths: !gulp.env.production,
};

const buildBrowserifyCompiler = memoize(
  (filename) => browserifyImpl(`src/${filename}`, browserifyOpts).
    transform(brfs).
    transform(babelify.configure({sourceMapRelative: __dirname})).
    transform(envify)
);

function buildBrowserifyStream(filename) {
  return new Promise((resolve, reject) => {
    buildBrowserifyCompiler(filename).bundle().
      pipe(source(filename)).
      pipe(buffer()).
      pipe(sourcemaps.init({loadMaps: true})).
      pipe(gutil.env.production ? uglify() : gutil.noop()).
      pipe(sourcemaps.write('./')).
      pipe(gulp.dest(distDir)).
      on('end', resolve).
      on('error', reject).
      pipe(browserSync.reload({stream: true}));
  });
}

gulp.task('env', () => {
  if (gulp.env.production) {
    process.env.NODE_ENV = 'production';
  }
});

gulp.task('css', () => gulp.src(`${stylesheetsDir}/**/*.css`).
  pipe(concat('application.css')).
  pipe(sourcemaps.init({loadMaps: true})).
  pipe(gutil.env.production ? cssnano() : gutil.noop()).
  pipe(sourcemaps.write('./')).
  pipe(gulp.dest(distDir)).
  pipe(browserSync.reload({stream: true})));

gulp.task('js', ['env'], () => {
  browserifyDone = buildBrowserifyStream('application.js');
  return browserifyDone;
});

gulp.task('build', ['css', 'js']);

gulp.task('dev', ['browserSync', 'css', 'js'], () => {
  gulp.watch(`${stylesheetsDir}/**/*.css`, ['css']);
  gulp.watch(`${srcDir}/**/*.js{,x}`, ['js']);
});

gulp.task('browserSync', () => {
  browserSync.init({
    server: {
      baseDir,
      middleware: (_req, _res, next) => {
        browserifyDone.then(() => {
          next();
        });
      },
    },
  });
});