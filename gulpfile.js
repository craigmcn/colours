const { readFileSync } = require('fs')
const gulp = require('gulp')
const gulpif = require('gulp-if')
const flatten = require('gulp-flatten')
const hash = require('gulp-hash')
const hashOptions = { template: '<%= name %>.<%= hash %><%= ext %>' }
const hashFilename = 'hash-manifest.json'
const rewrite = require('gulp-rev-rewrite')
const argv = require('minimist')(process.argv.slice(2))
const env = argv.env ? argv.env : 'development'
const output = {
  development: './tmp',
  production: './dist',
  netlify: './netlify',
}
const outputNetlify = `${output[env]}/colours`
const browserSync = require('browser-sync').create()

// CSS
const sass = require('gulp-sass')(require('sass')),
  autoprefixer = require('gulp-autoprefixer')

const sassOptions = {
  development: {
    errLogToConsole: true,
    outputStyle: 'expanded',
  },
  production: {
    errLogToConsole: false,
    outputStyle: 'compressed',
  },
}

gulp.task('styles', () => {
  return gulp
    .src('./src/styles/**/*.scss')
    .pipe(sass(sassOptions[env]).on('error', sass.logError))
    .pipe(autoprefixer({ grid: 'autoplace' }))
    .pipe(flatten())
    .pipe(hash(hashOptions))
    .pipe(gulp.dest(output[env]))
    .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
    .pipe(
      hash.manifest(hashFilename, {
        deleteOld: true,
        sourceDir: __dirname + output[env].substring(1),
      })
    )
    .pipe(gulp.dest(output[env]))
    .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
})

// JS
const browserify = require('browserify'),
  babelify = require('babelify'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  uglify = require('gulp-uglify')

gulp.task('scripts', () => {
  const b = browserify({
    entries: `./src/scripts/scripts.js`,
    debug: env !== 'development',
  })

  return b
    .transform(
      babelify.configure({
        presets: ['@babel/preset-env'],
        sourceMaps: env !== 'development',
      })
    )
    .bundle()
    .pipe(source('scripts.js'))
    .pipe(gulpif(env !== 'development', buffer()))
    .pipe(gulpif(env !== 'development', uglify()))
    .pipe(flatten())
    .pipe(hash(hashOptions))
    .pipe(gulp.dest(output[env]))
    .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
    .pipe(
      hash.manifest(hashFilename, {
        deleteOld: true,
        sourceDir: __dirname + output[env].substring(1),
        append: true,
      })
    )
    .pipe(gulp.dest(output[env]))
    .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
})

// HTML
gulp.task('html', () => {
  const render = require('gulp-nunjucks-render')
  const manifest = readFileSync(`${output[env]}/${hashFilename}`)

  return gulp
    .src('./src/pages/**/*.html')
    .pipe(
      render({
        path: ['src/templates'],
      })
    )
    .pipe(rewrite({ manifest }))
    .pipe(gulp.dest(output[env]))
    .pipe(gulpif(env === 'netlify', gulp.dest(outputNetlify)))
})

// Build
gulp.task('build', gulp.series('styles', 'scripts', 'html'))

// Reload browser
gulp.task('reload', (done) => {
  browserSync.reload()
  done()
})

// Browser sync
gulp.task('browserSync', () => {
  browserSync.init({
    port: 1235,
    server: output[env],
    ui: false,
  })
  gulp.watch(
    ['src/styles/**/*.scss', 'src/scripts/**/*.js', 'src/**/*.html'],
    gulp.series('build', 'reload')
  )
})

// Dev server
gulp.task('serve', gulp.series('build', 'browserSync'))
