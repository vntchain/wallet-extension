const gulp = require('gulp')
const gulpif = require('gulp-if')
const { log, colors } = require('gulp-util')
const named = require('vinyl-named')
const webpack = require('webpack')
const gulpWebpack = require('webpack-stream')
const plumber = require('gulp-plumber')
const livereload = require('gulp-livereload')
const gulpSequence = require('gulp-sequence')
const del = require('del')
const webpackConfig = require('./config/webpack.config.gulp')
const yargs = require('yargs')

const args = yargs
  .option('production', {
    boolean: true,
    default: false,
    describe: 'Minify all scripts and assets'
  })
  .option('watch', {
    boolean: true,
    default: false,
    describe: 'Watch all files and start a livereload server'
  })
  .option('verbose', {
    boolean: true,
    default: false,
    describe: 'Log additional data'
  })
  .option('vendor', {
    string: true,
    default: 'chrome',
    describe: 'Compile the extension for different vendors',
    choices: ['chrome', 'firefox', 'opera', 'edge']
  })
  .option('sourcemaps', {
    describe: 'Force the creation of sourcemaps'
  }).argv

// Use production flag for sourcemaps
// as a fallback
if (typeof args.sourcemaps === 'undefined') {
  args.sourcemaps = !args.production
}

gulp.task('scripts', () => {
  return gulp
    .src(['src/*.js'])
    .pipe(
      plumber({
        // Webpack will log the errors
        errorHandler() {}
      })
    )
    .pipe(named())
    .pipe(
      gulpWebpack(webpackConfig, webpack, (err, stats) => {
        if (err) return
        log(
          `Finished '${colors.cyan('scripts')}'`,
          stats.toString({
            chunks: false,
            colors: true,
            cached: false,
            children: false
          })
        )
      })
    )
    .pipe(gulp.dest(`dev/`))
    .pipe(gulpif(args.watch, livereload()))
})

gulp.task('manifest', () => {
  return gulp
    .src('public/manifest.json')
    .pipe(gulp.dest('dev'))
    .pipe(gulpif(args.watch, livereload()))
})

gulp.task('extension', function() {
  return gulp
    .src(['public/extension/*'])
    .pipe(gulp.dest('dev/extension'))
    .pipe(gulpif(args.watch, livereload()))
})

gulp.task('images', function() {
  return gulp
    .src(['public/images/*'])
    .pipe(gulp.dest('dev/images'))
    .pipe(gulpif(args.watch, livereload()))
})

gulp.task('chromereload', cb => {
  // This task runs only if the
  // watch argument is present!
  if (!args.watch) return cb()

  // Start livereload server
  livereload.listen({
    reloadPage: 'Extension',
    quiet: !args.verbose
  })

  gutil.log('Starting', gutil.colors.cyan("'livereload-server'"))

  // The watching for javascript files is done by webpack
  // Check out ./tasks/scripts.js for further info.
  gulp.watch('public/manifest.json', ['manifest'])
  gulp.watch('src/*', ['script'])
  // gulp.watch('src/styles/**/*.css', ['styles:css'])
  // gulp.watch('app/styles/**/*.less', ['styles:less'])
  // gulp.watch('app/pages/**/*.html', ['pages'])
  // gulp.watch('app/_locales/**/*', ['locales'])
  // gulp.watch('assets/images/**/*', ['images'])
  // gulp.watch('app/fonts/**/*.{woff,ttf,eot,svg}', ['fonts'])
})

gulp.task('clean', () => {
  return del([`dev/**/*`, `dev/**.hot-update.**`])
  // return del(`dev/**/*`)
})

gulp.task(
  'dev',
  gulpSequence('clean', [
    'manifest',
    'scripts',
    'extension',
    'images'
    // 'pages',
    // 'locales',
    // 'images',
    // 'fonts',
    // 'chromereload',
  ])
)
