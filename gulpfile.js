var gulp = require("gulp"),
  del = require("del"),
  browserSync = require("browser-sync"),
  concat = require("gulp-concat"),
  sass = require("gulp-sass"),
  notify = require("gulp-notify"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  babel = require("gulp-babel"),
  cssnano = require("cssnano");

//build
const buildMarkup = () => {
  return gulp.src("app/*.html").pipe(gulp.dest("docs"));
};
const buildScript = () => {
  return gulp.src(["app/js/scripts.min.js"]).pipe(gulp.dest("docs/js"));
};
const buildStyle = () => {
  return gulp.src(["app/css/style.min.css"]).pipe(gulp.dest("docs/css"));
};
const buildFonts = () => {
  return gulp.src(["app/fonts/**/*"]).pipe(gulp.dest("docs/fonts"));
};
const buildImage = () => {
  return gulp.src(["app/img/**/*"]).pipe(gulp.dest("docs/img"));
};
const removeDocs = () => {
  return del("docs");
};

//compile
const compileScript = () => {
  return gulp
    .src([
      // here add js libs
      "app/js/script.js",
    ])
    .pipe(concat("scripts.min.js"))
    .pipe(
      babel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(gulp.dest("app/js"))
    .pipe(browserSync.stream());
};

const compileStyle = () => {
  var plugins = [autoprefixer(), cssnano()];
  return gulp
    .src(["app/scss/style.scss"])
    .pipe(
      sass({
        outputStyle: "expand",
      }).on("error", notify.onError())
    )
    .pipe(concat("style.min.css"))
    .pipe(postcss(plugins))
    .pipe(gulp.dest("app/css"))
    .pipe(browserSync.stream());
};

const compile = gulp.parallel(compileScript, compileStyle);

const build = gulp.series(
  removeDocs,
  compile,
  gulp.parallel(buildMarkup, buildScript, buildStyle, buildFonts, buildImage)
);

//serve
const startServer = (done) => {
  browserSync.init({
    server: {
      baseDir: "app",
    },
    port: 3000,
  });
  done();
};

const reload = (done) => {
  browserSync.reload();
  done();
};

const serve = gulp.series(compile, startServer);

//watch
const watchMarkup = (done) => {
  gulp.watch("app/*.html", gulp.series(reload));
  done();
};
const watchScript = (done) => {
  gulp.watch("app/js/script.js", gulp.series(compileScript));
  done();
};
const watchStyle = (done) => {
  gulp.watch("app/scss/*.scss", gulp.series(compileStyle)); //последовательно
  done();
};

const watch = gulp.parallel(watchMarkup, watchScript, watchStyle);

const defaultTasks = gulp.parallel(serve, watch); //одновременно

gulp.task("build", build);
gulp.task("default", defaultTasks);
