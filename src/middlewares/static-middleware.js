const path = require("path");

const send = require("send");

const FileHelper = require("../helpers/FileHelper");

const prettyExtensions = ["html", "htm"];

module.exports =
  (tmpPath, dir, { ignore = [] } = {}) =>
  async ({ request, response, next }) => {
    const url =
      tmpPath !== "/"
        ? request.url !== tmpPath
          ? request.url.replace(tmpPath, "")
          : "/"
        : request.url;

    const tmpUrl = new URL(url, "http://localhost");

    const { pathname } = tmpUrl;

    let ended = false;

    const serve = async (file) => {
      const shouldBeIgnored = ignore.some(
        (tmpIgnore) => path.resolve(dir, tmpIgnore) === file
      );

      if (shouldBeIgnored) {
        return;
      }

      send(request, file).pipe(response);

      ended = true;
    };

    const redirect = (location) => {
      response.statusCode = 301;

      response.setHeader("Location", location);

      response.end();

      ended = true;
    };

    /*

    -> serve
    => redirect

    */

    // //hello => /hello

    if (url.includes("//")) {
      const cleanUrl = url.replace(/\/{2,}/g, "/");

      const location = `${tmpPath !== "/" ? tmpPath : ""}${cleanUrl}`;

      redirect(location);
    }

    if (ended) {
      return;
    }

    if (url === "/") {
      // /path => /path/

      if (tmpPath !== "/" && !request.url.endsWith("/")) {
        const location = `${tmpPath}/`;

        redirect(location);
      }

      if (ended) {
        return;
      }

      // / -> /index.html

      for (const prettyExtension of prettyExtensions) {
        const file = path.resolve(dir, `index.${prettyExtension}`);

        if (await FileHelper.exists(file)) {
          await serve(file);

          break;
        }
      }
    } else {
      // /hello -> /hello.html

      if (!request.url.endsWith("/")) {
        for (const prettyExtension of prettyExtensions) {
          const file = path.resolve(
            dir,
            `${pathname.slice(1)}.${prettyExtension}`
          );

          if (await FileHelper.exists(file)) {
            await serve(file);

            break;
          }
        }
      }

      if (ended) {
        return;
      }

      const tmpDir = path.resolve(dir, pathname.slice(1));

      if (
        (await FileHelper.exists(tmpDir)) &&
        (await FileHelper.isDirectory(tmpDir))
      ) {
        // /world => /world/

        if (!request.url.endsWith("/")) {
          const location = `${tmpPath !== "/" ? tmpPath : ""}${url}/`;

          redirect(location);
        }

        if (ended) {
          return;
        }

        // /hello/ -> /hello/index.html

        for (const prettyExtension of prettyExtensions) {
          const file = path.resolve(tmpDir, `index.${prettyExtension}`);

          if (await FileHelper.exists(file)) {
            await serve(file);

            break;
          }
        }
      }

      if (ended) {
        return;
      }

      const file = path.resolve(dir, pathname.slice(1));

      // /hello.html -> /hello.html

      if (
        (await FileHelper.exists(file)) &&
        (await FileHelper.isFile(file)) &&
        !request.url.endsWith("/")
      ) {
        await serve(file);
      }
    }

    if (ended) {
      return;
    }

    // anything -> 404.html (if it exists only)

    for (const prettyExtension of prettyExtensions) {
      const file = path.resolve(dir, `404.${prettyExtension}`);

      if (await FileHelper.exists(file)) {
        response.statusCode = 404;

        await serve(file);

        break;
      }
    }

    if (ended) {
      return;
    }

    // not ended, next

    next();
  };
