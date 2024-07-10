//
import gulp from "gulp";

import fs from "fs";
import git from "git-last-commit";
import webpack from "webpack";

import webpackConfig from "./webpack.config.js";
import webpackLibsConfig from "./webpack.config.libs.js";
import webpackExternalLibsConfig from "./webpack.config.libs_external.js";

let configLocation = "../cables_api/cables.json";
if (process.env.npm_config_apiconfig) configLocation = "../cables_api/cables_env_" + process.env.npm_config_apiconfig + ".json";

let isLiveBuild = false;
let minify = false;
let analyze = false;

let config = {};
if (fs.existsSync(configLocation))
{
    config = JSON.parse(fs.readFileSync(configLocation, "utf-8"));
    isLiveBuild = config.env === "live";
    minify = config.hasOwnProperty("minifyJs") ? config.minifyJs : false;
}

function getBuildInfo(cb)
{
    const date = new Date();
    git.getLastCommit((err, commit) =>
    {
        const buildInfo = {
            "timestamp": date.getTime(),
            "created": date.toISOString(),
            "git": {
                "branch": commit.branch,
                "commit": commit.hash,
                "date": commit.committedOn,
                "message": commit.subject
            }
        };
        fs.writeFile("build/buildinfo.json", JSON.stringify(buildInfo), () =>
        {
            cb(buildInfo);
        });
    });
}

function _watch(done)
{
    gulp.watch(["src/core/**/*", "../shared/client/**/*"], { "usePolling": true }, gulp.series(gulp.parallel(_core_js), gulp.parallel(_core_libs), _copy_ui, _core_libs_copy));
    gulp.watch("libs/**/*", { "usePolling": true }, gulp.series(_external_libs, _copy_ui));
    gulp.watch("src/libs/**/*", { "usePolling": true }, gulp.series(_core_libs_clean, gulp.parallel(_core_libs), _core_libs_copy));
    done();
}

function _analyze(done)
{
    analyze = true;
    done();
}

function _core_libs_clean(done)
{
    const dir = "build/libs/";
    if (fs.existsSync(dir)) fs.rmSync(dir, { "recursive": true });
    done();
}

function _copy_ui()
{
    return gulp.src(["build/*", "!build/buildinfo.json", "!/build/libs/*", "!build/report_*.html"]).pipe(gulp.dest("../cables_ui/dist/js/"));
}

function _core_libs_copy(done)
{
    const source = "build/libs/";
    const target = "../cables_api/public/libs_core/";

    if (!process.env.cables_standalone)
    {
        if (!fs.existsSync(target)) fs.mkdirSync(target, { "recursive": true });
        if (!fs.existsSync(source)) fs.mkdirSync(source, { "recursive": true });
        return gulp.src(source + "*.js").pipe(gulp.dest(target));
    }
    else
    {
        done();
    }
}

function _core_js(done)
{
    getBuildInfo((buildInfo) =>
    {
        webpack(webpackConfig(isLiveBuild, buildInfo, minify, analyze), (err, stats) =>
        {
            if (err) throw err;
            if (stats.hasErrors())
            {
                done(new Error(stats.compilation.errors.join("\n")));
            }
            done();
        });
    });
}

function _core_libs(done)
{
    getBuildInfo((buildInfo) =>
    {
        webpack(webpackLibsConfig(isLiveBuild, buildInfo, false, analyze),
            (err, stats) =>
            {
                if (err) throw err;
                if (stats && stats.hasErrors() && stats.compilation && stats.compilation.errors)
                {
                    done(Error(stats.compilation.errors.join("\n")));
                }
                else
                {
                    done();
                }
            }
        );
    });
}

function _external_libs(done)
{
    getBuildInfo((buildInfo) =>
    {
        webpack(webpackExternalLibsConfig(isLiveBuild, buildInfo, true, analyze),
            (err, stats) =>
            {
                if (err) throw err;
                if (stats.hasErrors())
                {
                    done(new Error(stats.compilation.errors.join("\n")));
                }
                done();
            }
        );
    });
}

/*
 * -------------------------------------------------------------------------------------------
 * MAIN TASKS
 * -------------------------------------------------------------------------------------------
 */

const defaultSeries = gulp.series(
    gulp.parallel(
        _external_libs,
        _core_js
    ),
    _core_libs_clean,
    _core_libs,
    _copy_ui,
    _core_libs_copy
);

gulp.task("build", defaultSeries);

gulp.task("analyze", gulp.series(
    _analyze,
    defaultSeries,
));

gulp.task("default", gulp.series(
    defaultSeries,
    _watch
));

gulp.task("watch", gulp.series(
    defaultSeries,
    _watch
));

