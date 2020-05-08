const gulp = require("gulp");
const webpack = require("webpack-stream");
const compiler = require("webpack");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const webpackConfig = require("./webpack.config");
const libWebpackConfig = require("./webpack.config.libs");

exports.default = exports.watch = gulp.series(
    gulp.parallel(taskExtentalLibs, taskCoreJsMax, taskCoreJsMin, taskCoreJsMaxBabel, taskCoreJsMinBabel, taskCoreLibsJsMax),
    _watch
);

exports.build = gulp.parallel(taskExtentalLibs, taskCoreJsMax, taskCoreJsMin, taskCoreJsMaxBabel, taskCoreJsMinBabel, taskCoreLibsJsMax);

function _watch()
{
    gulp.watch("src/core/**/*", gulp.parallel(taskCoreJsMax, taskCoreJsMin));
    gulp.watch("libs/**/*", gulp.parallel(taskExtentalLibs));
    gulp.watch("src/libs/**/*", gulp.parallel(taskCoreLibsJsMax));
}

function taskExtentalLibs()
{
    return (
        gulp
            .src(["libs/*.js"])
            // .pipe(sourcemaps.init())
            .pipe(concat("libs.core.js"))
            .pipe(gulp.dest("build"))
            .pipe(rename("libs.core.min.js"))
            // .pipe(uglify())
            // .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest("build"))
    );
}

function taskCoreJsMax()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(false, false),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )
            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}
function taskCoreJsMaxBabel()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(false, true),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )
            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreJsMin()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(true, false),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreJsMinBabel()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/core/index.js"])
            .pipe(
                webpack(
                    {
                        "config": webpackConfig(true, true),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )

            .pipe(gulp.dest("build"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}

function taskCoreLibsJsMax()
{
    return new Promise((resolve, reject) =>
    {
        gulp.src(["src/libs/**/*"])
            .pipe(
                webpack(
                    {
                        "config": libWebpackConfig(false, true),
                    },
                    compiler,
                    (err, stats) =>
                    {
                        if (err) throw err;
                        if (stats.hasErrors())
                        {
                            return reject(new Error(stats.compilation.errors.join("\n")));
                        }
                        resolve();
                    }
                )
            )
            .pipe(gulp.dest("build/libs"))
            .on("error", (err) =>
            {
                console.error("WEBPACK ERROR", err);
            });
    });
}
