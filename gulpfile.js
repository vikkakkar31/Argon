const gulp = require("gulp");
const apidoc = require("gulp-apidoc");

gulp.task("apidoc", done => {
  apidoc(
    {
      src: "./src/routes",
      dest: "./apidocs",
    },
    done
  );
});

gulp.task("watcher", () => {
  gulp.watch(["./src/**"], done => {
    apidoc(
      {
        src: "./src/routes",
        dest: "./apidocs",
      },
      done
    );
  });
});
gulp.task("default", gulp.parallel("apidoc", "watcher"));
