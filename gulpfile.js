'use strict';

var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var ts = require('gulp-typescript');

var tsconfig = require('./tsconfig.json');

/**
 * @summary Copy the files.
 */
function exec_copy() {
  console.log("Copy the files...");
  gulp.src('src/asset/**/*.*').pipe(gulp.dest('dist/asset/'));
}

/**
 * @summary Compile Jade files.
 */
function exec_jade() {
  console.log("Compile Jade files.");
  gulp.src('src/**/*.jade')
    .pipe(jade())
    .pipe(gulp.dest('dist/'));
}

/**
 * @summary Compile SASS files.
 */
function exec_sass() {
  console.log("Compile SCSS files.");
  return gulp.src('src/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/asset/css/'));
}

/**
 * @summary Compiles TypeScript files to JavaScript files.
 */
function exec_typescript() {
  console.log("Compiles TypeScript files.");
  gulp.src(['src/**/*.{ts,tsx}'])
    .pipe(ts(tsconfig.compilerOptions))
    .pipe(gulp.dest('dist/'));
}

/**
 * @summary Watches files.
 */
function watch() {
  gulp.watch('src/asset/**/*.*', exec_copy);
  gulp.watch('src/scss/**/*.scss', exec_sass);
  gulp.watch('src/**/*.jade', exec_jade);
  gulp.watch('src/**/*.{ts,tsx}', exec_typescript);
}

gulp.task('copy', exec_copy);
gulp.task('jade', exec_jade);
gulp.task('sass', exec_sass);
gulp.task('typescript', exec_typescript);
gulp.task('watch', watch);
gulp.task('default', ['copy', 'jade', 'sass', 'typescript']);
